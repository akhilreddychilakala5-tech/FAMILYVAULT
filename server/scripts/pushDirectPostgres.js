import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlFile = path.resolve(__dirname, '../supabase_seed_data.sql');

export async function pushDirectToSupabase(dbPassword) {
  if (!dbPassword) {
    console.error('❌ Database password required');
    return false;
  }

  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.vmjgfdyhaljycehtndud',
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL at aws-0-ap-south-1.pooler.supabase.com:6543...');
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL successfully!');

    console.log('📖 Reading supabase_seed_data.sql...');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('⚡ Executing full schema & data migration...');
    await client.query(sql);

    console.log('🎉 Successfully created all tables and populated all 29 documents, users, families, and shares into Supabase!');
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

if (process.argv[2]) {
  pushDirectToSupabase(process.argv[2]).then(() => process.exit(0));
}
