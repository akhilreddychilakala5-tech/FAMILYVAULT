import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.resolve(__dirname, '../supabase_seed_data.sql');

const escapeSql = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

async function generateSupabaseDump() {
  console.log('🔄 Fetching all current vault data from FamilyVault API...');

  // Login as admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@familyvault.app', password: 'Demo@123' }),
  }).then((r) => r.json());

  if (!loginRes.token) {
    console.error('❌ Failed to authenticate with vault API');
    return;
  }

  const headers = { Authorization: 'Bearer ' + loginRes.token };

  // Fetch all collections
  const [docsRes, userRes, familyRes, warrantiesRes, billsRes] = await Promise.all([
    fetch('http://localhost:5000/api/documents', { headers }).then((r) => r.json()),
    fetch('http://localhost:5000/api/auth/me', { headers }).then((r) => r.json()),
    fetch('http://localhost:5000/api/family', { headers }).then((r) => r.json()),
    fetch('http://localhost:5000/api/warranties', { headers }).then((r) => r.json()),
    fetch('http://localhost:5000/api/bills', { headers }).then((r) => r.json()),
  ]);

  const user = userRes.user;
  const family = familyRes.family;
  const members = familyRes.members || [];
  const documents = docsRes.documents || [];
  const warranties = warrantiesRes.warranties || [];
  const bills = billsRes.bills || [];

  console.log(`📦 Retrieved:`);
  console.log(`   - 1 Family: ${family?.name}`);
  console.log(`   - 1 User: ${user?.name} (${user?.email})`);
  console.log(`   - ${members.length} Family Members`);
  console.log(`   - ${documents.length} Documents (including ganesha)`);
  console.log(`   - ${warranties.length} Warranties`);
  console.log(`   - ${bills.length} Bills`);

  let sql = `-- ==============================================================================
-- FAMILYVAULT -> SUPABASE FULL DATA SYNC
-- Generated on: ${new Date().toISOString()}
-- Target Project: ${process.env.SUPABASE_URL || 'https://vmjgfdyhaljycehtndud.supabase.co'}
-- INSTRUCTIONS: Copy and paste this ENTIRE script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vmjgfdyhaljycehtndud/sql/new
-- Then click RUN. All tables and your 29 documents will be created & visible!
-- ==============================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    family_id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.family_members (
    id TEXT PRIMARY KEY,
    family_id TEXT,
    name TEXT NOT NULL,
    relationship TEXT,
    date_of_birth DATE,
    phone TEXT,
    is_emergency_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    family_id TEXT,
    owner_id TEXT,
    member_name TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    document_number TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT DEFAULT 0,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_emergency BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warranties (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    product_name TEXT NOT NULL,
    provider TEXT,
    duration_months INT,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    biller_name TEXT NOT NULL,
    amount NUMERIC,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shares (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    document_name TEXT,
    token TEXT UNIQUE NOT NULL,
    permission TEXT DEFAULT 'view_download',
    share_url TEXT,
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INT DEFAULT 0,
    max_accesses INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Public Read/Write for Table Editor visibility without RLS locks
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares DISABLE ROW LEVEL SECURITY;

-- 2. Clear previous records if any to avoid duplicates
TRUNCATE TABLE public.shares, public.bills, public.warranties, public.documents, public.family_members, public.users, public.families CASCADE;

-- 3. Insert Family
INSERT INTO public.families (id, name, created_at)
VALUES (${escapeSql(family?._id || 'fam-1')}, ${escapeSql(family?.name || 'The Reddy Family')}, NOW());

-- 4. Insert User
INSERT INTO public.users (id, family_id, name, email, role, avatar, created_at)
VALUES (
    ${escapeSql(user?._id || 'usr-1')},
    ${escapeSql(family?._id || 'fam-1')},
    ${escapeSql(user?.name || 'Rahul Reddy')},
    ${escapeSql(user?.email || 'demo@familyvault.app')},
    ${escapeSql(user?.role || 'admin')},
    ${escapeSql(user?.avatar || '')},
    NOW()
);

`;

  // 5. Insert Family Members
  if (members.length > 0) {
    sql += `-- 5. Insert Family Members (${members.length})\n`;
    for (const m of members) {
      sql += `INSERT INTO public.family_members (id, family_id, name, relationship, date_of_birth, phone, is_emergency_contact, created_at) VALUES (${escapeSql(m._id)}, ${escapeSql(family?._id || 'fam-1')}, ${escapeSql(m.name)}, ${escapeSql(m.relationship || 'Member')}, ${m.dateOfBirth ? escapeSql(m.dateOfBirth) : 'NULL'}, ${escapeSql(m.phone || '')}, ${m.isEmergencyContact ? 'true' : 'false'}, NOW());\n`;
    }
    sql += '\n';
  }

  // 6. Insert Documents
  sql += `-- 6. Insert All Documents (${documents.length})\n`;
  for (const doc of documents) {
    const docOwnerId = typeof doc.ownerId === 'object' ? doc.ownerId?._id : (doc.ownerId || user?._id || 'usr-1');
    const docFamilyId = typeof doc.familyId === 'object' ? doc.familyId?._id : (doc.familyId || family?._id || 'fam-1');
    const docMemberName = doc.memberId?.name || (typeof doc.memberId === 'string' ? doc.memberId : 'Family');
    const tagsSql = doc.tags && doc.tags.length > 0 ? `ARRAY[${doc.tags.map((t) => escapeSql(t)).join(', ')}]` : `'{}'::text[]`;
    sql += `INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    ${escapeSql(doc._id)},
    ${escapeSql(docFamilyId)},
    ${escapeSql(docOwnerId)},
    ${escapeSql(docMemberName)},
    ${escapeSql(doc.name)},
    ${escapeSql(doc.category)},
    ${escapeSql(doc.documentNumber || '')},
    ${escapeSql(doc.fileUrl || '')},
    ${escapeSql(doc.fileType || '')},
    ${doc.fileSize || 0},
    ${tagsSql},
    ${doc.isPinned ? 'true' : 'false'},
    ${doc.isEmergency ? 'true' : 'false'},
    ${escapeSql(doc.status || 'active')},
    ${doc.expiryDate ? escapeSql(doc.expiryDate) : 'NULL'},
    ${doc.createdAt ? escapeSql(doc.createdAt) : 'NOW()'}
);\n`;
  }
  sql += '\n';

  // 7. Insert Warranties
  if (warranties.length > 0) {
    sql += `-- 7. Insert Warranties (${warranties.length})\n`;
    for (const w of warranties) {
      sql += `INSERT INTO public.warranties (id, document_id, product_name, provider, duration_months, expiry_date, created_at) VALUES (${escapeSql(w._id)}, ${escapeSql(w.documentId?._id || w.documentId)}, ${escapeSql(w.productName)}, ${escapeSql(w.provider || '')}, ${w.durationMonths || 12}, ${w.expiryDate ? escapeSql(w.expiryDate) : 'NULL'}, NOW());\n`;
    }
    sql += '\n';
  }

  // 8. Insert Bills
  if (bills.length > 0) {
    sql += `-- 8. Insert Bills (${bills.length})\n`;
    for (const b of bills) {
      sql += `INSERT INTO public.bills (id, document_id, biller_name, amount, due_date, status, created_at) VALUES (${escapeSql(b._id)}, ${escapeSql(b.documentId?._id || b.documentId)}, ${escapeSql(b.billerName)}, ${b.amount || 0}, ${b.dueDate ? escapeSql(b.dueDate) : 'NULL'}, ${escapeSql(b.status || 'pending')}, NOW());\n`;
    }
    sql += '\n';
  }

  // 9. Add Ganesha Share
  sql += `-- 9. Insert Public Share with Worldwide Download Link
INSERT INTO public.shares (id, document_id, document_name, token, permission, share_url, download_url, expires_at, created_at)
VALUES (
    'share-ganesha-1',
    '6ab75251cd299d3ea05edb60',
    'ganesha',
    '04be713c644f757bce7d0517287c59735d0bcb22c148ebbd',
    'view_download',
    'https://dramatically-publication-sellers-sleep.trycloudflare.com/shared/04be713c644f757bce7d0517287c59735d0bcb22c148ebbd',
    'https://dramatically-publication-sellers-sleep.trycloudflare.com/api/shares/token/04be713c644f757bce7d0517287c59735d0bcb22c148ebbd/download',
    NOW() + INTERVAL '30 days',
    NOW()
);
`;

  fs.writeFileSync(outputFile, sql, 'utf8');
  console.log(`✅ Generated complete Supabase seed script at: ${outputFile}`);
  console.log(`   File Size: ${fs.statSync(outputFile).size} bytes`);
}

generateSupabaseDump().catch(console.error);
