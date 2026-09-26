-- ==============================================================================
-- FAMILYVAULT -> SUPABASE FULL DATA SYNC
-- Generated on: 2026-09-26T05:32:55.889Z
-- Target Project: https://vmjgfdyhaljycehtndud.supabase.co
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
VALUES ('6ab69f4ea6dc7df6427a6e39', 'The Reddy Family', NOW());

-- 4. Insert User
INSERT INTO public.users (id, family_id, name, email, role, avatar, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e38',
    '6ab69f4ea6dc7df6427a6e39',
    'Rahul Reddy',
    'demo@familyvault.app',
    'owner',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    NOW()
);

-- 5. Insert Family Members (4)
INSERT INTO public.family_members (id, family_id, name, relationship, date_of_birth, phone, is_emergency_contact, created_at) VALUES ('6ab69f4ea6dc7df6427a6e44', '6ab69f4ea6dc7df6427a6e39', 'Rahul Reddy', 'Father', NULL, '', false, NOW());
INSERT INTO public.family_members (id, family_id, name, relationship, date_of_birth, phone, is_emergency_contact, created_at) VALUES ('6ab69f4ea6dc7df6427a6e46', '6ab69f4ea6dc7df6427a6e39', 'Priya Reddy', 'Mother', NULL, '', false, NOW());
INSERT INTO public.family_members (id, family_id, name, relationship, date_of_birth, phone, is_emergency_contact, created_at) VALUES ('6ab69f4ea6dc7df6427a6e48', '6ab69f4ea6dc7df6427a6e39', 'Arjun Reddy', 'Son', NULL, '', false, NOW());
INSERT INTO public.family_members (id, family_id, name, relationship, date_of_birth, phone, is_emergency_contact, created_at) VALUES ('6ab69f4ea6dc7df6427a6e4a', '6ab69f4ea6dc7df6427a6e39', 'Ananya Reddy', 'Daughter', NULL, '', false, NOW());

-- 6. Insert All Documents (29)
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab75251cd299d3ea05edb60',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'ganesha',
    'Identity',
    '',
    '/uploads/1790399057457-685651038-ganesha.png',
    'image/png',
    1024004,
    '{}'::text[],
    true,
    false,
    'no_expiry',
    NULL,
    '2026-09-26T05:04:17.464Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e84',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Ananya Reddy',
    'Family Medical History & Vaccinations',
    'Other',
    'MED-VAC-2025-09',
    '/uploads/doc-28-family_medical_history___vaccinations.svg',
    'image/svg+xml',
    820000,
    ARRAY['Medical', 'Emergency', 'Vaccination', 'Health Record'],
    true,
    true,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.680Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e82',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Home Loan Sanction Letter',
    'Financial',
    'SBI-HL-99182049',
    '/uploads/doc-27-home_loan_sanction_letter.svg',
    'image/svg+xml',
    1350000,
    ARRAY['Financial', 'Loan', 'Home Loan', 'SBI'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.676Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e80',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'HDFC Savings Bank Account Passbook',
    'Financial',
    'HDFC-ACC-50100291',
    '/uploads/doc-26-hdfc_savings_bank_account_passbook.svg',
    'image/svg+xml',
    510000,
    ARRAY['Financial', 'Bank', 'HDFC', 'Savings'],
    false,
    true,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.672Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e7e',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Arjun Reddy',
    'Apple MacBook Pro M3 Invoice & AppleCare',
    'Warranty',
    'APP-CARE-998201',
    '/uploads/doc-25-apple_macbook_pro_m3_invoice___applecare.svg',
    'image/svg+xml',
    740000,
    ARRAY['Warranty', 'Electronics', 'Apple', 'Laptop'],
    false,
    false,
    'active',
    '2028-04-27T16:20:30.507Z',
    '2026-09-25T16:20:30.667Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e7c',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'LG OLED 55" Smart TV Warranty',
    'Warranty',
    'LG-OLED-55-8819',
    '/uploads/doc-24-lg_oled_55__smart_tv_warranty.svg',
    'image/svg+xml',
    580000,
    ARRAY['Warranty', 'Electronics', 'Television'],
    false,
    false,
    'active',
    '2028-03-08T16:20:30.507Z',
    '2026-09-25T16:20:30.663Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e7a',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Priya Reddy',
    'Samsung Refrigerator Warranty & Invoice',
    'Warranty',
    'WAR-SAMS-99281-NX',
    '/uploads/doc-23-samsung_refrigerator_warranty___invoice.svg',
    'image/svg+xml',
    620000,
    ARRAY['Warranty', 'Appliances', 'Samsung', 'Refrigerator', 'Kitchen'],
    false,
    false,
    'active',
    '2026-11-06T16:20:30.507Z',
    '2026-09-25T16:20:30.659Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e78',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Priya Reddy',
    'Piped Gas Bill - GAIL Gas',
    'Bills',
    'GAIL-GAS-449102',
    '/uploads/doc-22-piped_gas_bill___gail_gas.svg',
    'image/svg+xml',
    260000,
    ARRAY['Bills', 'Gas', 'Kitchen'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.654Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e76',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Broadband Fiber Bill - Airtel',
    'Bills',
    'AIRTEL-FIB-77182',
    '/uploads/doc-21-broadband_fiber_bill___airtel.svg',
    'image/svg+xml',
    280000,
    ARRAY['Bills', 'Internet', 'Broadband'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.650Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e74',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Electricity Bill - BESCOM',
    'Bills',
    'BESCOM-99201948',
    '/uploads/doc-20-electricity_bill___bescom.svg',
    'image/svg+xml',
    320000,
    ARRAY['Bills', 'Electricity', 'Utilities'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.647Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e72',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Residential Lease Agreement',
    'Property',
    'LEASE-AGR-2025-01',
    '/uploads/doc-19-residential_lease_agreement.svg',
    'image/svg+xml',
    720000,
    ARRAY['Property', 'Rental', 'Agreement'],
    false,
    false,
    'active',
    '2027-03-29T16:20:30.507Z',
    '2026-09-25T16:20:30.643Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e70',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Property Tax Receipt 2026',
    'Property',
    'BBMP-TAX-2026-8819',
    '/uploads/doc-18-property_tax_receipt_2026.svg',
    'image/svg+xml',
    450000,
    ARRAY['Property', 'Tax', 'Municipal', 'Receipt'],
    false,
    false,
    'active',
    '2027-07-07T16:20:30.507Z',
    '2026-09-25T16:20:30.636Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e6e',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Apartment Sale Deed - Bangalore',
    'Property',
    'BLR-REG-2019-9941',
    '/uploads/doc-17-apartment_sale_deed___bangalore.svg',
    'image/svg+xml',
    2400000,
    ARRAY['Property', 'Sale Deed', 'Real Estate', 'Legal', 'High Value'],
    true,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.633Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e6c',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'MBA Certificate - Rahul Reddy',
    'Education',
    'IIM-MBA-2008-042',
    '/uploads/doc-16-mba_certificate___rahul_reddy.svg',
    'image/svg+xml',
    1400000,
    ARRAY['Education', 'Post Graduate', 'MBA'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.630Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e6a',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Ananya Reddy',
    'High School Diploma - Ananya',
    'Education',
    'CBSE-XII-2025-9921',
    '/uploads/doc-15-high_school_diploma___ananya.svg',
    'image/svg+xml',
    890000,
    ARRAY['Education', 'CBSE', 'School', 'Certificate'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.627Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e68',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Arjun Reddy',
    'B.Tech Degree Certificate - Arjun',
    'Education',
    'VTU-DEG-2024-8812',
    '/uploads/doc-14-b_tech_degree_certificate___arjun.svg',
    'image/svg+xml',
    1100000,
    ARRAY['Education', 'Degree', 'Graduation', 'Engineering'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.624Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e66',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Arjun Reddy',
    'Two Wheeler RC - TVS Jupiter',
    'Vehicle',
    'RC-KA05NQ9912',
    '/uploads/doc-13-two_wheeler_rc___tvs_jupiter.svg',
    'image/svg+xml',
    480000,
    ARRAY['Vehicle', 'RC', 'Scooter'],
    false,
    false,
    'active',
    '2035-06-30T16:20:30.507Z',
    '2026-09-25T16:20:30.622Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e64',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Arjun Reddy',
    'Pollution Certificate PUC - Two Wheeler',
    'Vehicle',
    'PUC-KA03-882190',
    '/uploads/doc-12-pollution_certificate_puc___two_wheeler.svg',
    'image/svg+xml',
    310000,
    ARRAY['Vehicle', 'PUC', 'Emission', 'Two Wheeler'],
    false,
    false,
    'expiring_soon',
    '2026-10-09T16:20:30.507Z',
    '2026-09-25T16:20:30.619Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e62',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Car RC - Honda City (KA-03-MM-4821)',
    'Vehicle',
    'RC-KA03MM4821',
    '/uploads/doc-11-car_rc___honda_city__ka_03_mm_4821_.svg',
    'image/svg+xml',
    520000,
    ARRAY['Vehicle', 'RC', 'Car', 'Registration'],
    true,
    true,
    'active',
    '2033-04-21T16:20:30.507Z',
    '2026-09-25T16:20:30.616Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e60',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Driving License - Rahul Reddy',
    'Vehicle',
    'DL-042022019842',
    '/uploads/doc-10-driving_license___rahul_reddy.svg',
    'image/svg+xml',
    450000,
    ARRAY['Vehicle', 'Driving', 'Identity', 'Transport'],
    true,
    true,
    'expiring_soon',
    '2026-10-18T16:20:30.507Z',
    '2026-09-25T16:20:30.613Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e5e',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Past Health Policy 2025 (Archived)',
    'Insurance',
    'STAR-HEALTH-77102',
    '/uploads/doc-9-past_health_policy_2025__archived_.svg',
    'image/svg+xml',
    780000,
    ARRAY['Insurance', 'Archived', 'Expired Record'],
    false,
    false,
    'expired',
    '2026-09-10T16:20:30.507Z',
    '2026-09-25T16:20:30.609Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e5c',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Priya Reddy',
    'Term Life Insurance - Priya',
    'Insurance',
    'LIC-TERM-901844',
    '/uploads/doc-8-term_life_insurance___priya.svg',
    'image/svg+xml',
    850000,
    ARRAY['Insurance', 'Life', 'Term Plan', 'Security'],
    false,
    true,
    'active',
    '2028-09-14T16:20:30.507Z',
    '2026-09-25T16:20:30.606Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e5a',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Car Insurance - Honda City',
    'Insurance',
    'ICICI-LOMB-772910',
    '/uploads/doc-7-car_insurance___honda_city.svg',
    'image/svg+xml',
    940000,
    ARRAY['Insurance', 'Vehicle', 'Car', 'Motor', 'Renewal Required'],
    true,
    true,
    'expiring_soon',
    '2026-10-03T16:20:30.507Z',
    '2026-09-25T16:20:30.602Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e58',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Family Health Insurance Policy',
    'Insurance',
    'HDFC-ERGO-994821',
    '/uploads/doc-6-family_health_insurance_policy.svg',
    'image/svg+xml',
    1250000,
    ARRAY['Insurance', 'Medical', 'Health', 'Cashless', 'Family Floater'],
    true,
    true,
    'active',
    '2027-03-29T16:20:30.507Z',
    '2026-09-25T16:20:30.599Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e56',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Arjun Reddy',
    'Voter ID - Arjun Reddy',
    'Identity',
    'WBG9821045',
    '/uploads/doc-5-voter_id___arjun_reddy.svg',
    'image/svg+xml',
    290000,
    ARRAY['Identity', 'Voter', 'Government ID'],
    false,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.580Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e53',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Priya Reddy',
    'Passport - Priya Reddy',
    'Identity',
    'Z8493012',
    '/uploads/doc-4-passport___priya_reddy.svg',
    'image/svg+xml',
    680000,
    ARRAY['Identity', 'Travel', 'Passport', 'International'],
    true,
    true,
    'expiring_soon',
    '2026-10-22T16:20:30.507Z',
    '2026-09-25T16:20:30.576Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e51',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'PAN Card - Rahul Reddy',
    'Identity',
    'ABCDE1234F',
    '/uploads/doc-3-pan_card___rahul_reddy.svg',
    'image/svg+xml',
    310000,
    ARRAY['Identity', 'Financial', 'Tax', 'PAN'],
    true,
    false,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.572Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e4f',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Priya Reddy',
    'Aadhaar Card - Priya',
    'Identity',
    'XXXX-XXXX-9104',
    '/uploads/doc-2-aadhaar_card___priya.svg',
    'image/svg+xml',
    390000,
    ARRAY['Identity', 'Essential', 'Government ID'],
    true,
    true,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.548Z'
);
INSERT INTO public.documents (id, family_id, owner_id, member_name, name, category, document_number, file_url, file_type, file_size, tags, is_pinned, is_emergency, status, expiry_date, created_at)
VALUES (
    '6ab69f4ea6dc7df6427a6e4c',
    '6ab69f4ea6dc7df6427a6e39',
    '6ab69f4ea6dc7df6427a6e38',
    'Rahul Reddy',
    'Aadhaar Card - Rahul',
    'Identity',
    'XXXX-XXXX-4821',
    '/uploads/doc-1-aadhaar_card___rahul.svg',
    'image/svg+xml',
    420000,
    ARRAY['Identity', 'Essential', 'Government ID', 'Aadhaar'],
    true,
    true,
    'no_expiry',
    NULL,
    '2026-09-25T16:20:30.543Z'
);

-- 7. Insert Warranties (3)
INSERT INTO public.warranties (id, document_id, product_name, provider, duration_months, expiry_date, created_at) VALUES ('6ab69f4ea6dc7df6427a6e86', '6ab69f4ea6dc7df6427a6e7a', 'Samsung Double Door Inverter Refrigerator', '', 12, NULL, NOW());
INSERT INTO public.warranties (id, document_id, product_name, provider, duration_months, expiry_date, created_at) VALUES ('6ab69f4ea6dc7df6427a6e87', '6ab69f4ea6dc7df6427a6e7c', 'LG 55 Inch 4K Cinema OLED TV', '', 12, NULL, NOW());
INSERT INTO public.warranties (id, document_id, product_name, provider, duration_months, expiry_date, created_at) VALUES ('6ab69f4ea6dc7df6427a6e88', '6ab69f4ea6dc7df6427a6e7e', 'Apple MacBook Pro 14" M3 Space Black', '', 12, NULL, NOW());

-- 8. Insert Bills (3)
INSERT INTO public.bills (id, document_id, biller_name, amount, due_date, status, created_at) VALUES ('6ab69f4ea6dc7df6427a6e8e', '6ab69f4ea6dc7df6427a6e78', NULL, 860, '2026-09-23T16:20:30.507Z', 'paid', NOW());
INSERT INTO public.bills (id, document_id, biller_name, amount, due_date, status, created_at) VALUES ('6ab69f4ea6dc7df6427a6e8c', '6ab69f4ea6dc7df6427a6e74', NULL, 2840, '2026-10-01T16:20:30.507Z', 'due_soon', NOW());
INSERT INTO public.bills (id, document_id, biller_name, amount, due_date, status, created_at) VALUES ('6ab69f4ea6dc7df6427a6e8d', '6ab69f4ea6dc7df6427a6e76', NULL, 1179, '2026-10-07T16:20:30.507Z', 'due_soon', NOW());

-- 9. Insert Public Share with Worldwide Download Link
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
