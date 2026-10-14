import { randomUUID } from 'node:crypto';
import { OpsClient, OpsError } from '../src/sdk.js';
const baseUrl = process.env.OPS_URL ?? 'http://127.0.0.1:3000';
const token = process.env.OPS_APP_TOKEN;
const adminToken = process.env.OPS_ADMIN_TOKEN;
if (!token || !adminToken) throw new Error('Set OPS_APP_TOKEN and OPS_ADMIN_TOKEN for a synthetic development tenant');
const admin = new OpsClient({ baseUrl, token: adminToken });
const ops = new OpsClient({ baseUrl, token });
await admin.definePurpose({ purposeId: 'marketing-email', version: 1,
  title: 'Promotional emails', notice: 'Send me occasional product offers by email. I can withdraw this choice at any time.' });
const subjectId = `example_${randomUUID()}`;
let sends = 0;
const sendSyntheticPromotion = async () => { sends += 1; return 'Synthetic promotion sent'; };
async function tryPromotion() {
  try { console.log(await ops.withPermission(subjectId, 'marketing-email', sendSyntheticPromotion)); }
  catch (error) { if (error instanceof OpsError && error.code === 'permission_denied') console.log('Promotion blocked'); else throw error; }
}
console.log('Alex supplied an email for an e-receipt. No marketing choice has been collected.');
await tryPromotion();
console.log('Alex separately chooses promotional emails.');
const grant = await ops.recordChoice({ subjectId, purposeId: 'marketing-email', purposeVersion: 1,
  state: 'granted', expectedRevision: 0, idempotencyKey: randomUUID(), source: 'synthetic-example' });
await tryPromotion();
console.log('Alex withdraws the marketing choice.');
await ops.recordChoice({ subjectId, purposeId: 'marketing-email', purposeVersion: 1,
  state: 'withdrawn', expectedRevision: grant.revision, idempotencyKey: randomUUID(), source: 'synthetic-example' });
await tryPromotion();
if (sends !== 1) throw new Error('Enforcement example failed');
console.log('Verified: one permitted synthetic send; missing consent and withdrawal both blocked.');
console.log('Receipts:', (await ops.history(subjectId, 'marketing-email')).map(r => ({ id: r.id, state: r.state, revision: r.revision })));
