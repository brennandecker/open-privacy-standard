import pg from 'pg';
export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');
  const max = Number(process.env.OPS_DB_POOL_SIZE ?? 10);
  if (!Number.isInteger(max) || max < 1 || max > 100) throw new Error('Invalid OPS_DB_POOL_SIZE');
  // TLS settings belong in the database URL / deployment configuration. Never disable certificate verification here.
  return new pg.Pool({ connectionString, max, connectionTimeoutMillis: 5000,
    statement_timeout: 5000, idle_in_transaction_session_timeout: 10000 });
}
