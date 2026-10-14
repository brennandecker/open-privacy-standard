import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
const execute = promisify(execFile);

test('Installable package and real entrypoints run the complete synthetic workflow', { timeout: 120000 }, async () => {
  const root = resolve('.');
  const directory = await mkdtemp(join(tmpdir(), 'ops-install-'));
  const db = await PGlite.create(join(directory, 'db'));
  const socket = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, maxConnections: 1 });
  let processApi: ChildProcess | undefined;
  try {
    await socket.start();
    const reserve = createServer();
    await new Promise<void>(resolve => reserve.listen(0, '127.0.0.1', resolve));
    const address = reserve.address(); assert(address && typeof address !== 'string');
    const port = address.port;
    await new Promise<void>(resolve => reserve.close(() => resolve()));
    const admin = randomBytes(32).toString('hex'); const app = randomBytes(32).toString('hex');
    const env = { ...process.env, DATABASE_URL: `postgresql://postgres@${socket.getServerConn()}/postgres`,
      PORT: String(port), HOST: '127.0.0.1', OPS_DB_POOL_SIZE: '1', OPS_URL: `http://127.0.0.1:${port}`,
      OPS_ADMIN_TOKEN: admin, OPS_APP_TOKEN: app,
      OPS_CREDENTIALS: JSON.stringify([{ token: admin, tenantId: 'process-shop', role: 'admin' },
        { token: app, tenantId: 'process-shop', role: 'application' }]) };
    await execute(process.execPath, ['dist/src/migrate.js'], { cwd: root, env, timeout: 10000 });
    await new Promise(resolve => setImmediate(resolve));
    processApi = spawn(process.execPath, ['dist/src/main.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('API startup timed out')), 10000);
      const ready = (data: Buffer) => { if (data.toString().includes('listening')) { clearTimeout(timer); resolve(); } };
      processApi!.stdout!.on('data', ready);
      processApi!.once('error', e => { clearTimeout(timer); reject(e); });
      processApi!.once('exit', code => { clearTimeout(timer); reject(new Error(`API exited before readiness (${code})`)); });
    });
    const example = await execute(process.execPath, ['dist/examples/receipt-and-marketing.js'], { cwd: root, env, timeout: 10000 });
    assert.match(example.stdout, /Verified: one permitted synthetic send/);
    assert.equal(example.stdout.match(/Promotion blocked/g)?.length, 2);
    const packed = await execute('npm', ['pack', '--json', '--pack-destination', directory], { cwd: root, timeout: 30000 });
    const [result] = JSON.parse(packed.stdout) as { filename: string }[];
    assert(result);
    await execute('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', join(directory, result.filename)], {
      cwd: directory, timeout: 30000,
    });
    const installed = await execute(process.execPath, ['--input-type=module', '-e',
      "import { OpsClient } from '@open-privacy-standard/consent'; const api = new OpsClient({baseUrl: process.env.OPS_URL, token: process.env.OPS_APP_TOKEN}); const decision=await api.decision('unknown-customer','marketing-email'); if(decision.allowed || decision.reason!=='no_choice') throw Error('Unexpected permission'); console.log('Installed SDK verified');"],
    { cwd: directory, env, timeout: 10000 });
    assert.match(installed.stdout, /Installed SDK verified/);
    await execute(process.execPath, [join(root, 'scripts/setup-env.mjs')], { cwd: directory, timeout: 10000 });
    const privateFile = await readFile(join(directory, '.env'), 'utf8');
    assert.match(privateFile, /OPS_CREDENTIALS='/);
    await assert.rejects(execute(process.execPath, [join(root, 'scripts/setup-env.mjs')], { cwd: directory, timeout: 10000 }));
    assert.equal(await readFile(join(directory, '.env'), 'utf8'), privateFile);
  } finally {
    if (processApi && processApi.exitCode === null) {
      await new Promise<void>(resolve => {
        processApi!.once('exit', () => resolve());
        processApi!.kill('SIGTERM');
        setTimeout(() => processApi!.kill('SIGKILL'), 5000).unref();
      });
    }
    await socket.stop();
    // Socket cleanup is dispatched through setImmediate by the test-only wire server.
    await new Promise(resolve => setImmediate(resolve));
    await new Promise(resolve => setImmediate(resolve));
    await db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
