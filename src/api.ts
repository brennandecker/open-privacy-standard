import { createHash, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
import { OpsError, identifier, object } from './contracts.js';
import { ConsentStore } from './store.js';

export interface Credential { token: string; tenantId: string; role: 'admin' | 'application' }
export function credentials(value: unknown): Credential[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Configure at least one OPS credential');
  const result = value.map(item => {
    const c = object(item, ['token', 'tenantId', 'role']);
    if (typeof c.token !== 'string' || c.token.length < 32 || c.token.length > 256 || /\s/.test(c.token)
      || !['admin', 'application'].includes(String(c.role))) throw new Error('Invalid OPS credential configuration');
    return { token: c.token, tenantId: identifier(c.tenantId), role: c.role as Credential['role'] };
  });
  if (new Set(result.map(c => c.token)).size !== result.length) throw new Error('OPS tokens must be unique');
  return result;
}
async function body(request: IncomingMessage): Promise<unknown> {
  if (request.headers['content-type']?.split(';')[0] !== 'application/json')
    throw new OpsError(415, 'unsupported_media_type', 'Send application/json');
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16384) throw new OpsError(413, 'body_too_large', 'Body exceeds 16 KiB');
    chunks.push(Buffer.from(chunk));
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new OpsError(400, 'invalid_json', 'Invalid JSON'); }
}
export function createApi(store: ConsentStore, config: Credential[]) {
  const configured = credentials(config).map(c => ({ ...c,
    digest: createHash('sha256').update(c.token).digest() }));
  const server = createServer(async (request, response) => {
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.setHeader('cache-control', 'no-store');
    response.setHeader('x-content-type-options', 'nosniff');
    const send = (status: number, result: unknown) => { response.writeHead(status); response.end(JSON.stringify(result)); };
    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      if (request.method === 'GET' && url.pathname === '/health') { send(200, { status: 'alive' }); return; }
      const auth = request.headers.authorization;
      if (!auth?.startsWith('Bearer ') || auth.length > 263)
        throw new OpsError(401, 'unauthorized', 'A server-side bearer token is required');
      const digest = createHash('sha256').update(auth.slice(7)).digest();
      const caller = configured.find(c => timingSafeEqual(c.digest, digest));
      if (!caller) throw new OpsError(401, 'unauthorized', 'Invalid credential');
      if (request.method === 'POST' && url.pathname === '/v1/purposes') {
        if (caller.role !== 'admin') throw new OpsError(403, 'forbidden', 'Purpose configuration requires an admin credential');
        send(200, await store.definePurpose(caller.tenantId, await body(request))); return;
      }
      if (request.method === 'GET' && url.pathname.startsWith('/v1/purposes/')) {
        send(200, await store.purpose(caller.tenantId, url.pathname.slice('/v1/purposes/'.length))); return;
      }
      if (request.method === 'POST' && url.pathname === '/v1/choices') {
        send(200, await store.recordChoice(caller.tenantId, await body(request))); return;
      }
      if (request.method === 'POST' && url.pathname === '/v1/decisions') {
        const input = object(await body(request), ['subjectId', 'purposeId']);
        send(200, await store.decision(caller.tenantId, identifier(input.subjectId), identifier(input.purposeId))); return;
      }
      if (request.method === 'GET' && url.pathname.startsWith('/v1/receipts/')) {
        send(200, await store.receipt(caller.tenantId, url.pathname.slice('/v1/receipts/'.length))); return;
      }
      if (request.method === 'GET' && url.pathname === '/v1/history') {
        if ([...url.searchParams.keys()].some(key => !['subjectId', 'purposeId', 'beforeRevision'].includes(key)))
          throw new OpsError(400, 'invalid_input', 'Unexpected query parameter');
        const before = url.searchParams.get('beforeRevision');
        send(200, await store.history(caller.tenantId, identifier(url.searchParams.get('subjectId')),
          identifier(url.searchParams.get('purposeId')), before === null ? undefined : Number(before))); return;
      }
      throw new OpsError(404, 'not_found', 'Endpoint not found');
    } catch (error) {
      if (error instanceof OpsError) send(error.status, { error: { code: error.code, message: error.message } });
      else {
        // Do not log request bodies, subject identifiers, database details, or credentials.
        console.error('OPS request failed');
        send(503, { error: { code: 'service_unavailable', message: 'Permission service unavailable; do not proceed with consent-dependent processing' } });
      }
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  return server;
}
