import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { OpsError, choiceInput, identifier, purposeInput } from './contracts.js';
import type { Decision, PurposeInput, Receipt } from './contracts.js';

export class ConsentStore {
  constructor(private pool: Pool) {}

  private async transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await run(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  private async lock(client: PoolClient, parts: string[]) {
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [JSON.stringify(parts)]);
  }

  async definePurpose(tenant: string, value: unknown): Promise<PurposeInput> {
    identifier(tenant);
    const input = purposeInput(value);
    return this.transaction(async client => {
      await this.lock(client, ['purpose', tenant, input.purposeId]);
      const result = await client.query<{ definition: PurposeInput }>(
        'SELECT definition FROM ops_purposes WHERE tenant_id=$1 AND purpose_id=$2 ORDER BY version DESC LIMIT 1',
        [tenant, input.purposeId]);
      const latest = result.rows[0]?.definition;
      // JSONB key order is not preserved. Compare fields explicitly for identical retries.
      if (latest && latest.version === input.version && latest.title === input.title && latest.notice === input.notice)
        return latest;
      if (input.version !== (latest?.version ?? 0) + 1)
        throw new OpsError(409, 'purpose_version_conflict', 'Create the next purpose version; existing wording is immutable');
      await client.query('INSERT INTO ops_purposes (tenant_id,purpose_id,version,definition) VALUES ($1,$2,$3,$4)',
        [tenant, input.purposeId, input.version, input]);
      return input;
    });
  }

  async purpose(tenant: string, purposeId: string): Promise<PurposeInput> {
    const result = await this.pool.query<{ definition: PurposeInput }>(
      'SELECT definition FROM ops_purposes WHERE tenant_id=$1 AND purpose_id=$2 ORDER BY version DESC LIMIT 1',
      [identifier(tenant), identifier(purposeId)]);
    if (!result.rows[0]) throw new OpsError(404, 'unknown_purpose', 'Purpose not found');
    return result.rows[0].definition;
  }

  async recordChoice(tenant: string, value: unknown): Promise<Receipt> {
    identifier(tenant);
    const input = choiceInput(value);
    const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    return this.transaction(async client => {
      // Serialize retries even when they target different purposes.
      await this.lock(client, ['idempotency', tenant, input.idempotencyKey]);
      const retry = await client.query<{ request_hash: string; receipt: Receipt }>(
        'SELECT request_hash,receipt FROM ops_choice_events WHERE tenant_id=$1 AND idempotency_key=$2',
        [tenant, input.idempotencyKey]);
      if (retry.rows[0]) {
        if (retry.rows[0].request_hash !== hash)
          throw new OpsError(409, 'idempotency_conflict', 'This key was used for a different choice');
        return retry.rows[0].receipt;
      }
      await this.lock(client, ['purpose', tenant, input.purposeId]);
      const purposes = await client.query<{ definition: PurposeInput }>(
        'SELECT definition FROM ops_purposes WHERE tenant_id=$1 AND purpose_id=$2 ORDER BY version DESC LIMIT 1',
        [tenant, input.purposeId]);
      const purpose = purposes.rows[0]?.definition;
      if (!purpose) throw new OpsError(404, 'unknown_purpose', 'Purpose not found');
      if (purpose.version !== input.purposeVersion)
        throw new OpsError(409, 'purpose_version_conflict', 'Read the current purpose wording before submitting a choice');
      const current = await client.query<{ revision: number }>(
        'SELECT revision FROM ops_preferences WHERE tenant_id=$1 AND subject_id=$2 AND purpose_id=$3',
        [tenant, input.subjectId, input.purposeId]);
      const revision = current.rows[0]?.revision ?? 0;
      // Every transition uses compare-and-swap. A delayed grant cannot overwrite withdrawal.
      if (revision !== input.expectedRevision)
        throw new OpsError(409, 'revision_conflict', 'Read the current revision and collect a fresh choice; do not automatically retry a grant');
      const timestamp = await client.query<{ now: Date }>('SELECT clock_timestamp() AS now');
      const receipt: Receipt = { ...input, id: randomUUID(), revision: revision + 1,
        recordedAt: timestamp.rows[0]!.now.toISOString(), purpose };
      await client.query(`INSERT INTO ops_choice_events
        (tenant_id,id,subject_id,purpose_id,purpose_version,revision,idempotency_key,request_hash,receipt)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [tenant, receipt.id, input.subjectId, input.purposeId, input.purposeVersion,
        receipt.revision, input.idempotencyKey, hash, receipt]);
      await client.query(`INSERT INTO ops_preferences (tenant_id,subject_id,purpose_id,event_id,revision)
        VALUES ($1,$2,$3,$4,$5) ON CONFLICT (tenant_id,subject_id,purpose_id)
        DO UPDATE SET event_id=EXCLUDED.event_id,revision=EXCLUDED.revision`,
      [tenant, input.subjectId, input.purposeId, receipt.id, receipt.revision]);
      return receipt;
    });
  }

  async decision(tenant: string, subjectId: string, purposeId: string): Promise<Decision> {
    [tenant, subjectId, purposeId].forEach(identifier);
    // One SQL snapshot prevents mixed purpose/preference reads during concurrent changes.
    const result = await this.pool.query<{ version: number; receipt: Receipt | null; now: Date }>(`
      SELECT p.version,e.receipt,clock_timestamp() AS now FROM ops_purposes p
      LEFT JOIN ops_preferences c ON c.tenant_id=p.tenant_id AND c.purpose_id=p.purpose_id AND c.subject_id=$2
      LEFT JOIN ops_choice_events e ON e.tenant_id=c.tenant_id AND e.id=c.event_id
      WHERE p.tenant_id=$1 AND p.purpose_id=$3 ORDER BY p.version DESC LIMIT 1`, [tenant, subjectId, purposeId]);
    const row = result.rows[0];
    const receipt = row?.receipt;
    const reason: Decision['reason'] = !row ? 'unknown_purpose' : !receipt ? 'no_choice'
      : receipt.purposeVersion !== row.version ? 'purpose_changed' : receipt.state;
    return { allowed: reason === 'granted', reason, revision: receipt?.revision ?? 0,
      purposeVersion: row?.version ?? null, receiptId: receipt?.id ?? null,
      evaluatedAt: row?.now.toISOString() ?? new Date().toISOString() };
  }

  async receipt(tenant: string, id: string): Promise<Receipt> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))
      throw new OpsError(400, 'invalid_input', 'Invalid receipt ID');
    const result = await this.pool.query<{ receipt: Receipt }>(
      'SELECT receipt FROM ops_choice_events WHERE tenant_id=$1 AND id=$2', [identifier(tenant), id]);
    if (!result.rows[0]) throw new OpsError(404, 'not_found', 'Receipt not found');
    return result.rows[0].receipt;
  }

  async history(tenant: string, subjectId: string, purposeId: string, beforeRevision = 2147483647): Promise<Receipt[]> {
    [tenant, subjectId, purposeId].forEach(identifier);
    if (!Number.isSafeInteger(beforeRevision) || beforeRevision < 1 || beforeRevision > 2147483647)
      throw new OpsError(400, 'invalid_input', 'Invalid history cursor');
    const result = await this.pool.query<{ receipt: Receipt }>(`SELECT receipt FROM ops_choice_events
      WHERE tenant_id=$1 AND subject_id=$2 AND purpose_id=$3 AND revision<$4 ORDER BY revision DESC LIMIT 100`,
    [tenant, subjectId, purposeId, beforeRevision]);
    return result.rows.map(row => row.receipt);
  }
}
