import { database } from './database.js';
import { ConsentStore } from './store.js';
import { createApi, credentials } from './api.js';
const configured = (() => {
  try { return credentials(JSON.parse(process.env.OPS_CREDENTIALS ?? 'null')); }
  catch { throw new Error('OPS_CREDENTIALS must contain valid tenant-bound credentials'); }
})();
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const pool = database();
// Fail startup if the schema is missing. Run migrations explicitly before starting.
await pool.query('SELECT 1 FROM ops_preferences LIMIT 1');
const server = createApi(new ConsentStore(pool), configured);
server.listen(port, process.env.HOST ?? '127.0.0.1', () => console.log(`OPS consent API listening on port ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  server.close(() => { void pool.end().then(() => process.exit(0)); });
  setTimeout(() => process.exit(1), 10000).unref();
});
