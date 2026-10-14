import { readFile } from 'node:fs/promises';
import { database } from './database.js';
const pool = database();
try {
  await pool.query(await readFile(new URL('../../migrations/001-consent.sql', import.meta.url), 'utf8'));
  console.log('OPS schema installed');
} finally { await pool.end(); }
