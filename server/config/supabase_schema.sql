-- ==============================================================================
-- FAMILYVAULT SUPABASE DATABASE SCHEMA
-- Project Reference: vmjgfdyhaljycehtndud
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vmjgfdyhaljycehtndud/sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Families Table
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'The Reddy Family Vault',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Family Members Table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(50),
    is_emergency_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    member_name VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Identity, Insurance, Education, Property, Vehicle, Financial, Bills, Warranty, Other
    document_number VARCHAR(255),
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT DEFAULT 0,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_emergency BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active', -- active, expiring_soon, expired, archived
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Shares Table (QR & Worldwide Direct Download)
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    permission VARCHAR(50) DEFAULT 'view_download', -- view_only, view_download, manage
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_accesses INT DEFAULT 50,
    access_count INT DEFAULT 0,
    qr_code TEXT,
    share_url TEXT,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notifications & Reminders
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Storage Bucket for Vault Files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vault-documents', 'vault-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policy (Allow Public Read & Authenticated/Anon Upload)
CREATE POLICY "Public Document Access" ON storage.objects FOR SELECT USING (bucket_id = 'vault-documents');
CREATE POLICY "Document Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vault-documents');
