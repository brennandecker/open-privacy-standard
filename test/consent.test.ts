import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { ConsentStore } from '../src/store.js';
import { createApi, credentials } from '../src/api.js';
import { OpsClient, OpsError } from '../src/sdk.js';
import type { ChoiceInput } from '../src/contracts.js';

test('Consent service: SQL ledger, HTTP API, and SDK', { timeout: 120000 }, async t => {
  const folder = await mkdtemp(join(tmpdir(), 'ops-consent-'));
  const schema = `ops_test_${randomUUID().replaceAll('-', '')}`;
  let embedded: PGlite | undefined;
  let socket: PGLiteSocketServer | undefined;
  let adminDb: pg.Pool | undefined;
  let pool: pg.Pool | undefined;
  let api: ReturnType<typeof createApi> | undefined;
  const sql = await readFile(new URL('../../migrations/001-consent.sql', import.meta.url), 'utf8');
  try {
    if (process.env.TEST_DATABASE_URL) {
      adminDb = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
      await adminDb.query(`CREATE SCHEMA ${schema}`);
      pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 8,
        options: `-c search_path=${schema}`, statement_timeout: 5000 });
    } else {
      embedded = await PGlite.create(join(folder, 'db'));
      socket = new PGLiteSocketServer({ db: embedded, host: '127.0.0.1', port: 0, maxConnections: 1 });
      await socket.start();
      pool = new pg.Pool({ connectionString: `postgresql://postgres@${socket.getServerConn()}/postgres`, max: 1 });
    }
    await pool.query(sql);
    await pool.query(sql); // Migration can be run again without destroying history.
    const store = new ConsentStore(pool);
    const adminToken = randomUUID(); const appToken = randomUUID(); const otherToken = randomUUID();
    api = createApi(store, [
      { token: adminToken, tenantId: 'shop', role: 'admin' },
      { token: appToken, tenantId: 'shop', role: 'application' },
      { token: otherToken, tenantId: 'other-shop', role: 'admin' },
    ]);
    api.listen(0, '127.0.0.1'); await once(api, 'listening');
    const address = api.address(); assert(address && typeof address !== 'string');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const admin = new OpsClient({ baseUrl, token: adminToken });
    const app = new OpsClient({ baseUrl, token: appToken });
    const other = new OpsClient({ baseUrl, token: otherToken });
    const definition = { purposeId: 'marketing', version: 1, title: 'Offers', notice: 'Send me product offers. I can withdraw.' };
    const input: ChoiceInput = { subjectId: 'alex', purposeId: 'marketing', purposeVersion: 1,
      state: 'granted', expectedRevision: 0, idempotencyKey: 'grant-1', source: 'preference-center' };
    const error = (code: string) => (e: unknown) => e instanceof OpsError && e.code === code;

    await t.test('Credential and tenant configuration validation', () => {
      assert.throws(() => credentials([]));
      assert.throws(() => credentials([{ token: 'short', tenantId: 'shop', role: 'admin' }]));
      assert.throws(() => credentials([{ token: adminToken, tenantId: 'shop', role: 'admin' },
        { token: adminToken, tenantId: 'other', role: 'application' }]));
      assert.throws(() => new OpsClient({ baseUrl: 'http://remote.example', token: appToken }));
    });
    await t.test('Authentication and role authorization precede writes', async () => {
      await assert.rejects(new OpsClient({ baseUrl, token: 'bad' }).definePurpose(definition), error('unauthorized'));
      await assert.rejects(app.definePurpose(definition), error('forbidden'));
      assert.equal((await fetch(baseUrl + '/v1/history')).status, 401);
      await admin.definePurpose(definition);
      assert.deepEqual(await app.purpose('marketing'), definition);
      assert.deepEqual(await admin.definePurpose(definition), definition);
      await assert.rejects(admin.definePurpose({ ...definition, notice: 'Changed' }), error('purpose_version_conflict'));
    });
    await t.test('An e-receipt customer record never implies marketing consent', async () => {
      const decision = await app.decision('alex', 'marketing');
      assert.equal(decision.allowed, false); assert.equal(decision.reason, 'no_choice');
      let sends = 0;
      await assert.rejects(app.withPermission('alex', 'marketing', async () => sends++), error('permission_denied'));
      assert.equal(sends, 0);
      assert.equal((await app.decision('alex', 'not-configured')).reason, 'unknown_purpose');
    });
    const grant = await app.recordChoice(input);
    await t.test('Grant permits use and records the exact wording', async () => {
      assert.equal(grant.revision, 1); assert.deepEqual(grant.purpose, definition);
      assert.deepEqual(await app.receipt(grant.id), grant);
      assert.equal(await app.withPermission('alex', 'marketing', async () => 'sent'), 'sent');
      assert.equal((await app.decision('alex', 'marketing')).receiptId, grant.id);
    });
    await t.test('Identical retries are stable; changed payloads conflict', async () => {
      assert.deepEqual(await app.recordChoice(input), grant);
      await assert.rejects(app.recordChoice({ ...input, state: 'withdrawn' }), error('idempotency_conflict'));
      assert.equal((await app.history('alex', 'marketing')).length, 1);
    });
    const withdrawal = await app.recordChoice({ ...input, state: 'withdrawn', expectedRevision: 1, idempotencyKey: 'withdraw-1' });
    await t.test('Withdrawal blocks the next use; stale and retried grants cannot restore it', async () => {
      assert.equal(withdrawal.revision, 2);
      await assert.rejects(app.withPermission('alex', 'marketing', async () => assert.fail('Must not send')), error('permission_denied'));
      await assert.rejects(app.recordChoice({ ...input, expectedRevision: 1, idempotencyKey: 'delayed-grant' }), error('revision_conflict'));
      assert.deepEqual(await app.recordChoice(input), grant);
      assert.equal((await app.decision('alex', 'marketing')).reason, 'withdrawn');
      const history = await app.history('alex', 'marketing');
      assert.deepEqual(history.map(r => r.state), ['withdrawn', 'granted']);
      assert.equal((await app.history('alex', 'marketing', 2))[0]?.id, grant.id);
    });
    await t.test('Tenant and subject isolation include receipts, history, and configuration', async () => {
      await assert.rejects(other.receipt(grant.id), error('not_found'));
      assert.deepEqual(await other.history('alex', 'marketing'), []);
      assert.equal((await other.decision('alex', 'marketing')).reason, 'unknown_purpose');
      assert.equal((await app.decision('blair', 'marketing')).reason, 'no_choice');
      await other.definePurpose(definition);
      await other.recordChoice(input); // Same idempotency key, isolated tenant.
      assert.equal((await other.decision('alex', 'marketing')).allowed, true);
      assert.equal((await app.decision('alex', 'marketing')).allowed, false);
      await assert.rejects(app.recordChoice({ ...input, tenantId: 'other-shop' } as ChoiceInput), error('invalid_input'));
    });
    await t.test('Concurrent writes sharing an expected revision have one winner', async () => {
      const writes = await Promise.allSettled(['race-a', 'race-b'].map(idempotencyKey => app.recordChoice({
        ...input, subjectId: 'race', idempotencyKey })));
      assert.equal(writes.filter(r => r.status === 'fulfilled').length, 1);
      const failed = writes.find(r => r.status === 'rejected');
      assert(failed?.status === 'rejected' && error('revision_conflict')(failed.reason));
      assert.equal((await app.history('race', 'marketing')).length, 1);
    });
    await t.test('Concurrent retries record one event; key reuse across purposes conflicts', async () => {
      const request = { ...input, subjectId: 'retry', idempotencyKey: 'race-retry' };
      const receipts = await Promise.all([app.recordChoice(request), app.recordChoice(request)]);
      assert.deepEqual(receipts[0], receipts[1]);
      assert.equal((await app.history('retry', 'marketing')).length, 1);
      await admin.definePurpose({ ...definition, purposeId: 'personalization' });
      await assert.rejects(app.recordChoice({ ...request, purposeId: 'personalization' }), error('idempotency_conflict'));
    });
    await t.test('Purpose changes invalidate old grants, preserve evidence, and require a fresh choice', async () => {
      await app.recordChoice({ ...input, expectedRevision: 2, idempotencyKey: 'regrant' });
      await admin.definePurpose({ ...definition, version: 2, notice: 'Send me offers and news. I can withdraw.' });
      assert.equal((await app.decision('alex', 'marketing')).reason, 'purpose_changed');
      await assert.rejects(app.recordChoice({ ...input, expectedRevision: 3, idempotencyKey: 'old-notice' }), error('purpose_version_conflict'));
      assert.equal((await app.receipt(grant.id)).purpose.notice, definition.notice);
      await app.recordChoice({ ...input, purposeVersion: 2, expectedRevision: 3, idempotencyKey: 'new-notice' });
      assert.equal((await app.decision('alex', 'marketing')).allowed, true);
      await app.recordChoice({ ...input, purposeVersion: 2, state: 'denied', expectedRevision: 4, idempotencyKey: 'denied' });
      assert.equal((await app.decision('alex', 'marketing')).reason, 'denied');
    });
    await t.test('Validation rejects customer data, bad JSON, and invalid revisions', async () => {
      await assert.rejects(app.recordChoice({ ...input, subjectId: 'alex@example.com' }), error('invalid_input'));
      await assert.rejects(app.recordChoice({ ...input, expectedRevision: -1 }), error('invalid_input'));
      await assert.rejects(app.recordChoice({ ...input, email: 'alex@example.com' } as ChoiceInput), error('invalid_input'));
      await assert.rejects(app.receipt('------------------------------------'), error('invalid_input'));
      const post = (body: string, contentType: string) => fetch(baseUrl + '/v1/choices', {
        method: 'POST', headers: { authorization: `Bearer ${appToken}`, 'content-type': contentType }, body });
      assert.equal((await post('{', 'application/json')).status, 400);
      assert.equal((await post('{}', 'text/plain')).status, 415);
      assert.equal((await post(JSON.stringify({ notice: 'x'.repeat(17000) }), 'application/json')).status, 413);
    });
    await t.test('Historical evidence cannot be updated or deleted by runtime SQL', async () => {
      await assert.rejects(pool!.query('UPDATE ops_choice_events SET revision=99 WHERE tenant_id=$1 AND id=$2', ['shop', grant.id]));
      await assert.rejects(pool!.query('DELETE FROM ops_choice_events WHERE tenant_id=$1 AND id=$2', ['shop', grant.id]));
      await assert.rejects(pool!.query('UPDATE ops_purposes SET definition=$1 WHERE tenant_id=$2', [{}, 'shop']));
      assert.deepEqual(await app.receipt(grant.id), grant);
    });
    await t.test('Ledger survives a new pool and service instance', async () => {
      await pool!.end();
      if (embedded && socket) {
        await socket.stop(); await embedded.close();
        embedded = await PGlite.create(join(folder, 'db'));
        socket = new PGLiteSocketServer({ db: embedded, host: '127.0.0.1', port: 0, maxConnections: 1 });
        await socket.start();
        pool = new pg.Pool({ connectionString: `postgresql://postgres@${socket.getServerConn()}/postgres`, max: 1 });
      } else {
        pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
      }
      const restarted = new ConsentStore(pool!);
      assert.deepEqual(await restarted.receipt('shop', grant.id), grant);
      assert.equal((await restarted.decision('shop', 'alex', 'marketing')).reason, 'denied');
    });
    await t.test('API and SDK fail closed when persistence becomes unavailable', async () => {
      // The API still holds the ended original pool. No callback may run after a database failure.
      let calls = 0;
      await assert.rejects(app.withPermission('alex', 'marketing', async () => calls++), error('service_unavailable'));
      assert.equal(calls, 0);
    });
  } finally {
    if (api) { api.closeAllConnections(); await new Promise<void>(resolve => api!.close(() => resolve())); }
    await pool?.end();
    await socket?.stop(); await embedded?.close();
    if (adminDb) { await adminDb.query(`DROP SCHEMA ${schema} CASCADE`); await adminDb.end(); }
    await rm(folder, { recursive: true, force: true });
  }
});
