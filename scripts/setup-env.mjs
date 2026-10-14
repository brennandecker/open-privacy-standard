import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const admin = randomBytes(32).toString('hex');
const app = randomBytes(32).toString('hex');
const config = JSON.stringify([
  { token: admin, tenantId: 'development-shop', role: 'admin' },
  { token: app, tenantId: 'development-shop', role: 'application' },
]);
try {
  await writeFile('.env', [
    `OPS_DB_PASSWORD=${randomBytes(32).toString('hex')}`,
    `OPS_ADMIN_TOKEN=${admin}`, `OPS_APP_TOKEN=${app}`,
    `OPS_CREDENTIALS='${config}'`, 'OPS_URL=http://127.0.0.1:3000', '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Created .env with random development credentials. Keep it private.');
} catch (error) {
  if (error.code === 'EEXIST') throw new Error('.env already exists; it was not replaced');
  throw error;
}
