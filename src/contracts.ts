export type ChoiceState = 'granted' | 'denied' | 'withdrawn';
export interface PurposeInput { purposeId: string; version: number; title: string; notice: string }
export interface ChoiceInput {
  subjectId: string; purposeId: string; purposeVersion: number;
  state: ChoiceState; expectedRevision: number; idempotencyKey: string; source: string;
}
export interface Receipt extends ChoiceInput {
  id: string; revision: number; recordedAt: string;
  purpose: PurposeInput;
}
export interface Decision {
  allowed: boolean;
  reason: 'granted' | 'no_choice' | 'denied' | 'withdrawn' | 'purpose_changed' | 'unknown_purpose';
  revision: number; purposeVersion: number | null; receiptId: string | null;
  evaluatedAt: string;
}
export class OpsError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function object(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new OpsError(400, 'invalid_input', 'Expected a JSON object');
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !fields.includes(key)))
    throw new OpsError(400, 'invalid_input', 'Unexpected field');
  return input;
}
export function identifier(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value))
    throw new OpsError(400, 'invalid_input', 'Use an opaque identifier of 1–128 letters, numbers, underscores, or hyphens');
  return value;
}
function integer(value: unknown, minimum: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > 2147483646)
    throw new OpsError(400, 'invalid_input', 'Invalid version or revision');
  return value;
}
function text(value: unknown, limit: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > limit)
    throw new OpsError(400, 'invalid_input', 'Missing or oversized text');
  return value;
}
export function purposeInput(value: unknown): PurposeInput {
  const p = object(value, ['purposeId', 'version', 'title', 'notice']);
  return { purposeId: identifier(p.purposeId), version: integer(p.version, 1),
    title: text(p.title, 160), notice: text(p.notice, 4000) };
}
export function choiceInput(value: unknown): ChoiceInput {
  const c = object(value, ['subjectId', 'purposeId', 'purposeVersion', 'state', 'expectedRevision', 'idempotencyKey', 'source']);
  if (!['granted', 'denied', 'withdrawn'].includes(String(c.state)))
    throw new OpsError(400, 'invalid_input', 'Invalid choice state');
  return { subjectId: identifier(c.subjectId), purposeId: identifier(c.purposeId),
    purposeVersion: integer(c.purposeVersion, 1), state: c.state as ChoiceState,
    expectedRevision: integer(c.expectedRevision, 0), idempotencyKey: identifier(c.idempotencyKey),
    source: identifier(c.source) };
}
