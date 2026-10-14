import { OpsError } from './contracts.js';
import type { ChoiceInput, Decision, PurposeInput, Receipt } from './contracts.js';
export type { ChoiceInput, ChoiceState, Decision, PurposeInput, Receipt } from './contracts.js';
export { OpsError } from './contracts.js';

/** Server-side only: an application must authenticate and authorize its customer before calling OPS. */
export class OpsClient {
  private baseUrl: string;
  constructor(private options: { baseUrl: string; token: string; timeoutMs?: number }) {
    const url = new URL(options.baseUrl);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))
      throw new Error('OPS requires HTTPS except on loopback');
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/')
      throw new Error('Use an OPS origin without credentials, path, query, or fragment');
    this.baseUrl = url.origin;
  }
  private async request<T>(path: string, method = 'GET', value?: unknown): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      method, redirect: 'error', signal: AbortSignal.timeout(this.options.timeoutMs ?? 5000),
      headers: { authorization: `Bearer ${this.options.token}`, 'content-type': 'application/json' },
      ...(value === undefined ? {} : { body: JSON.stringify(value) }),
    });
    const payload = await response.json() as T & { error?: { code: string; message: string } };
    if (!response.ok) throw new OpsError(response.status, payload.error?.code ?? 'http_error', payload.error?.message ?? 'OPS request failed');
    return payload;
  }
  definePurpose(input: PurposeInput) { return this.request<PurposeInput>('/v1/purposes', 'POST', input); }
  purpose(id: string) { return this.request<PurposeInput>(`/v1/purposes/${encodeURIComponent(id)}`); }
  recordChoice(input: ChoiceInput) { return this.request<Receipt>('/v1/choices', 'POST', input); }
  decision(subjectId: string, purposeId: string) {
    return this.request<Decision>('/v1/decisions', 'POST', { subjectId, purposeId });
  }
  receipt(id: string) { return this.request<Receipt>(`/v1/receipts/${encodeURIComponent(id)}`); }
  history(subjectId: string, purposeId: string, beforeRevision?: number) {
    const params = new URLSearchParams({ subjectId, purposeId });
    if (beforeRevision !== undefined) params.set('beforeRevision', String(beforeRevision));
    return this.request<Receipt[]>(`/v1/history?${params}`);
  }
  /** Run immediately before a consent-dependent use. A transport failure never calls use(). */
  async withPermission<T>(subjectId: string, purposeId: string, use: (decision: Decision) => Promise<T>): Promise<T> {
    const decision = await this.decision(subjectId, purposeId);
    if (decision.allowed !== true || decision.reason !== 'granted')
      throw new OpsError(403, 'permission_denied', 'Consent-dependent use blocked');
    return use(decision);
  }
}
