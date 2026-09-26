import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Document from '../models/Document.js';
import Reminder from '../models/Reminder.js';
import Notification from '../models/Notification.js';
import Warranty from '../models/Warranty.js';
import Bill from '../models/Bill.js';
import ActivityLog from '../models/ActivityLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate sample preview files for seeded documents so viewing/downloading works
const createSampleDocFile = (filename, title, category, docNumber, ownerName) => {
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    // Generate clean SVG visual document certificate
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="800" height="1100" fill="url(#grid)" />
  <rect x="25" y="25" width="750" height="1050" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Header Bar -->
  <rect x="25" y="25" width="750" height="140" rx="16" fill="url(#headerGrad)"/>
  
  <!-- Vault Seal Icon -->
  <circle cx="85" cy="95" r="35" fill="rgba(255,255,255,0.15)"/>
  <path d="M85 70 L65 80 V95 C65 107 73 118 85 121 C97 118 105 107 105 95 V80 Z" fill="#38bdf8"/>
  <path d="M85 82 L75 90 V102 H95 V90 Z" fill="#ffffff"/>

  <text x="140" y="85" fill="#ffffff" font-size="28" font-weight="bold" letter-spacing="1">FAMILYVAULT VERIFIED RECORD</text>
  <text x="140" y="115" fill="#93c5fd" font-size="15" font-weight="500">DIGITALLY ARCHIVED &amp; ENCRYPTED DOCUMENT</text>

  <!-- Title & Category Badge -->
  <rect x="60" y="200" width="130" height="34" rx="17" fill="#e0f2fe"/>
  <text x="125" y="222" fill="#0369a1" font-size="14" font-weight="bold" text-anchor="middle">${category.toUpperCase()}</text>

  <text x="60" y="280" fill="#0f172a" font-size="34" font-weight="800">${title}</text>
  <text x="60" y="315" fill="#64748b" font-size="16">Family Record Holder: <tspan fill="#0284c7" font-weight="bold">${ownerName}</tspan></text>
  
  <line x1="60" y1="345" x2="740" y2="345" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Info Grid -->
  <rect x="60" y="375" width="320" height="90" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="80" y="405" fill="#64748b" font-size="13" font-weight="600">IDENTIFICATION / POLICY NO.</text>
  <text x="80" y="440" fill="#0f172a" font-size="20" font-weight="bold">${docNumber}</text>

  <rect x="420" y="375" width="320" height="90" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="440" y="405" fill="#64748b" font-size="13" font-weight="600">SECURITY STATUS</text>
  <text x="440" y="440" fill="#16a34a" font-size="20" font-weight="bold">ACTIVE IN VAULT</text>

  <!-- Document Body Placeholder Info -->
  <text x="60" y="520" fill="#334155" font-size="16" font-weight="600">Document Verification Details:</text>
  <rect x="60" y="540" width="680" height="340" rx="12" fill="#f8fafc" stroke="#e2e8f0"/>
  
  <text x="90" y="580" fill="#475569" font-size="15">• Issuing Body: Official Registered Authority</text>
  <text x="90" y="620" fill="#475569" font-size="15">• Digital Checksum: SHA-256 Verified</text>
  <text x="90" y="660" fill="#475569" font-size="15">• Access Level: Family Vault Authorized Members</text>
  <text x="90" y="700" fill="#475569" font-size="15">• Original Resolution: 300 DPI High-Fidelity Scanned Document</text>
  <text x="90" y="740" fill="#475569" font-size="15">• Encryption: AES-GCM Encrypted Storage Reference</text>
  <text x="90" y="780" fill="#475569" font-size="15">• Storage Tag: #FamilyVault #${category} #${ownerName.replace(/\\s+/g, '')}</text>

  <!-- Watermark Stamp -->
  <circle cx="620" cy="740" r="65" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-dasharray="6,4" opacity="0.6"/>
  <text x="620" y="735" fill="#0284c7" font-size="14" font-weight="bold" text-anchor="middle" opacity="0.8">FAMILYVAULT</text>
  <text x="620" y="755" fill="#0284c7" font-size="12" font-weight="bold" text-anchor="middle" opacity="0.8">VERIFIED</text>

  <!-- Footer -->
  <line x1="60" y1="920" x2="740" y2="920" stroke="#e2e8f0" stroke-width="1"/>
  <text x="60" y="955" fill="#94a3b8" font-size="13">FamilyVault Safe Storage Engine • Vault ID: FV-REDDY-2026</text>
  <text x="60" y="980" fill="#94a3b8" font-size="13">“Your family documents. Safe, organized, always ready.”</text>
</svg>`;
    fs.writeFileSync(filePath, svgContent, 'utf8');
  }
};

export const seedDemoData = async () => {
  try {
    console.log('🌱 Starting FamilyVault Seed Process...');

    // Remove existing demo user if present to ensure clean seed
    const demoEmail = 'demo@familyvault.app';
    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
      console.log('🔄 Cleaning up existing demo data...');
      const oldFamilyId = existingUser.familyId;
      await User.deleteMany({ email: demoEmail });
      if (oldFamilyId) {
        await Family.deleteMany({ _id: oldFamilyId });
        await FamilyMember.deleteMany({ familyId: oldFamilyId });
        await Document.deleteMany({ familyId: oldFamilyId });
        await Reminder.deleteMany({ familyId: oldFamilyId });
        await Notification.deleteMany({ familyId: oldFamilyId });
        await Warranty.deleteMany({ familyId: oldFamilyId });
        await Bill.deleteMany({ familyId: oldFamilyId });
        await ActivityLog.deleteMany({ familyId: oldFamilyId });
      }
    }

    // 1. Create Demo User
    const user = new User({
      name: 'Rahul Reddy',
      email: demoEmail,
      password: 'Demo@123',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      preferences: {
        reminderDays: [7, 15, 30, 60],
        theme: 'dark',
        emailNotifications: true,
        inAppNotifications: true,
      },
      onboardingCompleted: true,
    });

    // 2. Create Family: "The Reddy Family"
    const family = await Family.create({
      name: 'The Reddy Family',
      ownerId: user._id,
    });

    user.familyId = family._id;
    await user.save();

    // 3. Create Family Members
    const memberData = [
      {
        name: 'Rahul Reddy',
        relationship: 'Father',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        permissions: { canUpload: true, canDownload: true, canDelete: true },
        email: 'rahul.reddy@example.com',
      },
      {
        name: 'Priya Reddy',
        relationship: 'Mother',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        permissions: { canUpload: true, canDownload: true, canDelete: false },
        email: 'priya.reddy@example.com',
      },
      {
        name: 'Arjun Reddy',
        relationship: 'Son',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        permissions: { canUpload: true, canDownload: true, canDelete: false },
        email: 'arjun.reddy@example.com',
      },
      {
        name: 'Ananya Reddy',
        relationship: 'Daughter',
        role: 'viewer',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        permissions: { canUpload: false, canDownload: true, canDelete: false },
        email: 'ananya.reddy@example.com',
      },
    ];

    const members = [];
    for (const m of memberData) {
      const created = await FamilyMember.create({
        familyId: family._id,
        userId: m.name === 'Rahul Reddy' ? user._id : undefined,
        ...m,
      });
      members.push(created);
    }

    const father = members[0];
    const mother = members[1];
    const son = members[2];
    const daughter = members[3];

    // Reference dates for status calculation
    const now = new Date();
    const addDays = (d) => {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      return date;
    };
    const subDays = (d) => {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      return date;
    };

    // 4. Create 28 Documents
    // Notice: Exactly 4 Expiring Soon (diff <= 30), 1 Expired (< 0), rest Active or No Expiry!
    const documentsData = [
      // --- IDENTITY (5) ---
      {
        name: 'Aadhaar Card - Rahul',
        category: 'Identity',
        memberId: father._id,
        documentNumber: 'XXXX-XXXX-4821',
        issuingAuthority: 'UIDAI',
        issueDate: subDays(1500),
        expiryDate: null, // No Expiry
        tags: ['Identity', 'Essential', 'Government ID', 'Aadhaar'],
        isPinned: true,
        isEmergency: true,
        fileSize: 420000,
      },
      {
        name: 'Aadhaar Card - Priya',
        category: 'Identity',
        memberId: mother._id,
        documentNumber: 'XXXX-XXXX-9104',
        issuingAuthority: 'UIDAI',
        issueDate: subDays(1400),
        expiryDate: null, // No Expiry
        tags: ['Identity', 'Essential', 'Government ID'],
        isPinned: true,
        isEmergency: true,
        fileSize: 390000,
      },
      {
        name: 'PAN Card - Rahul Reddy',
        category: 'Identity',
        memberId: father._id,
        documentNumber: 'ABCDE1234F',
        issuingAuthority: 'Income Tax Department',
        issueDate: subDays(2200),
        expiryDate: null, // No Expiry
        tags: ['Identity', 'Financial', 'Tax', 'PAN'],
        isPinned: true,
        isEmergency: false,
        fileSize: 310000,
      },
      {
        name: 'Passport - Priya Reddy',
        category: 'Identity',
        memberId: mother._id,
        documentNumber: 'Z8493012',
        issuingAuthority: 'Ministry of External Affairs',
        issueDate: subDays(3600),
        expiryDate: addDays(27), // 🟡 EXPIRING SOON #1 (in 27 days)
        tags: ['Identity', 'Travel', 'Passport', 'International'],
        isPinned: true,
        isEmergency: true,
        fileSize: 680000,
      },
      {
        name: 'Voter ID - Arjun Reddy',
        category: 'Identity',
        memberId: son._id,
        documentNumber: 'WBG9821045',
        issuingAuthority: 'Election Commission of India',
        issueDate: subDays(600),
        expiryDate: null,
        tags: ['Identity', 'Voter', 'Government ID'],
        isPinned: false,
        isEmergency: false,
        fileSize: 290000,
      },

      // --- INSURANCE (4) ---
      {
        name: 'Family Health Insurance Policy',
        category: 'Insurance',
        memberId: father._id,
        documentNumber: 'HDFC-ERGO-994821',
        issuingAuthority: 'HDFC ERGO General Insurance',
        issueDate: subDays(180),
        expiryDate: addDays(185), // 🟢 Active
        tags: ['Insurance', 'Medical', 'Health', 'Cashless', 'Family Floater'],
        isPinned: true,
        isEmergency: true,
        fileSize: 1250000,
      },
      {
        name: 'Car Insurance - Honda City',
        category: 'Insurance',
        memberId: father._id,
        documentNumber: 'ICICI-LOMB-772910',
        issuingAuthority: 'ICICI Lombard Motor Insurance',
        issueDate: subDays(357),
        expiryDate: addDays(8), // 🟡 EXPIRING SOON #2 (in 8 days)
        tags: ['Insurance', 'Vehicle', 'Car', 'Motor', 'Renewal Required'],
        isPinned: true,
        isEmergency: true,
        fileSize: 940000,
      },
      {
        name: 'Term Life Insurance - Priya',
        category: 'Insurance',
        memberId: mother._id,
        documentNumber: 'LIC-TERM-901844',
        issuingAuthority: 'Life Insurance Corporation of India',
        issueDate: subDays(400),
        expiryDate: addDays(720), // 🟢 Active
        tags: ['Insurance', 'Life', 'Term Plan', 'Security'],
        isPinned: false,
        isEmergency: true,
        fileSize: 850000,
      },
      {
        name: 'Past Health Policy 2025 (Archived)',
        category: 'Insurance',
        memberId: father._id,
        documentNumber: 'STAR-HEALTH-77102',
        issuingAuthority: 'Star Health & Allied Insurance',
        issueDate: subDays(450),
        expiryDate: subDays(15), // 🔴 EXPIRED #1 (expired 15 days ago)
        tags: ['Insurance', 'Archived', 'Expired Record'],
        isPinned: false,
        isEmergency: false,
        fileSize: 780000,
      },

      // --- VEHICLE (4) ---
      {
        name: 'Driving License - Rahul Reddy',
        category: 'Vehicle',
        memberId: father._id,
        documentNumber: 'DL-042022019842',
        issuingAuthority: 'Regional Transport Office (RTO)',
        issueDate: subDays(3650),
        expiryDate: addDays(23), // 🟡 EXPIRING SOON #3 (in 23 days)
        tags: ['Vehicle', 'Driving', 'Identity', 'Transport'],
        isPinned: true,
        isEmergency: true,
        fileSize: 450000,
      },
      {
        name: 'Car RC - Honda City (KA-03-MM-4821)',
        category: 'Vehicle',
        memberId: father._id,
        documentNumber: 'RC-KA03MM4821',
        issuingAuthority: 'Transport Department Karnataka',
        issueDate: subDays(1200),
        expiryDate: addDays(2400), // 🟢 Active
        tags: ['Vehicle', 'RC', 'Car', 'Registration'],
        isPinned: true,
        isEmergency: true,
        fileSize: 520000,
      },
      {
        name: 'Pollution Certificate PUC - Two Wheeler',
        category: 'Vehicle',
        memberId: son._id,
        documentNumber: 'PUC-KA03-882190',
        issuingAuthority: 'Certified Emission Testing Center',
        issueDate: subDays(166),
        expiryDate: addDays(14), // 🟡 EXPIRING SOON #4 (in 14 days)
        tags: ['Vehicle', 'PUC', 'Emission', 'Two Wheeler'],
        isPinned: false,
        isEmergency: false,
        fileSize: 310000,
      },
      {
        name: 'Two Wheeler RC - TVS Jupiter',
        category: 'Vehicle',
        memberId: son._id,
        documentNumber: 'RC-KA05NQ9912',
        issuingAuthority: 'Transport Department Karnataka',
        issueDate: subDays(800),
        expiryDate: addDays(3200), // 🟢 Active
        tags: ['Vehicle', 'RC', 'Scooter'],
        isPinned: false,
        isEmergency: false,
        fileSize: 480000,
      },

      // --- EDUCATION (3) ---
      {
        name: 'B.Tech Degree Certificate - Arjun',
        category: 'Education',
        memberId: son._id,
        documentNumber: 'VTU-DEG-2024-8812',
        issuingAuthority: 'Visvesvaraya Technological University',
        issueDate: subDays(400),
        expiryDate: null,
        tags: ['Education', 'Degree', 'Graduation', 'Engineering'],
        isPinned: false,
        isEmergency: false,
        fileSize: 1100000,
      },
      {
        name: 'High School Diploma - Ananya',
        category: 'Education',
        memberId: daughter._id,
        documentNumber: 'CBSE-XII-2025-9921',
        issuingAuthority: 'Central Board of Secondary Education',
        issueDate: subDays(200),
        expiryDate: null,
        tags: ['Education', 'CBSE', 'School', 'Certificate'],
        isPinned: false,
        isEmergency: false,
        fileSize: 890000,
      },
      {
        name: 'MBA Certificate - Rahul Reddy',
        category: 'Education',
        memberId: father._id,
        documentNumber: 'IIM-MBA-2008-042',
        issuingAuthority: 'Indian Institute of Management',
        issueDate: subDays(6500),
        expiryDate: null,
        tags: ['Education', 'Post Graduate', 'MBA'],
        isPinned: false,
        isEmergency: false,
        fileSize: 1400000,
      },

      // --- PROPERTY (3) ---
      {
        name: 'Apartment Sale Deed - Bangalore',
        category: 'Property',
        memberId: father._id,
        documentNumber: 'BLR-REG-2019-9941',
        issuingAuthority: 'Sub-Registrar Office Indiranagar',
        issueDate: subDays(2400),
        expiryDate: null,
        tags: ['Property', 'Sale Deed', 'Real Estate', 'Legal', 'High Value'],
        isPinned: true,
        isEmergency: false,
        fileSize: 2400000,
      },
      {
        name: 'Property Tax Receipt 2026',
        category: 'Property',
        memberId: father._id,
        documentNumber: 'BBMP-TAX-2026-8819',
        issuingAuthority: 'Bruhat Bengaluru Mahanagara Palike',
        issueDate: subDays(80),
        expiryDate: addDays(285), // 🟢 Active
        tags: ['Property', 'Tax', 'Municipal', 'Receipt'],
        isPinned: false,
        isEmergency: false,
        fileSize: 450000,
      },
      {
        name: 'Residential Lease Agreement',
        category: 'Property',
        memberId: father._id,
        documentNumber: 'LEASE-AGR-2025-01',
        issuingAuthority: 'Registered Notary Public',
        issueDate: subDays(180),
        expiryDate: addDays(185), // 🟢 Active
        tags: ['Property', 'Rental', 'Agreement'],
        isPinned: false,
        isEmergency: false,
        fileSize: 720000,
      },

      // --- BILLS (3) ---
      {
        name: 'Electricity Bill - BESCOM',
        category: 'Bills',
        memberId: father._id,
        documentNumber: 'BESCOM-99201948',
        issuingAuthority: 'Bangalore Electricity Supply Company',
        issueDate: subDays(10),
        expiryDate: null,
        tags: ['Bills', 'Electricity', 'Utilities'],
        isPinned: false,
        isEmergency: false,
        fileSize: 320000,
      },
      {
        name: 'Broadband Fiber Bill - Airtel',
        category: 'Bills',
        memberId: father._id,
        documentNumber: 'AIRTEL-FIB-77182',
        issuingAuthority: 'Bharti Airtel Limited',
        issueDate: subDays(15),
        expiryDate: null,
        tags: ['Bills', 'Internet', 'Broadband'],
        isPinned: false,
        isEmergency: false,
        fileSize: 280000,
      },
      {
        name: 'Piped Gas Bill - GAIL Gas',
        category: 'Bills',
        memberId: mother._id,
        documentNumber: 'GAIL-GAS-449102',
        issuingAuthority: 'GAIL Gas Limited',
        issueDate: subDays(25),
        expiryDate: null,
        tags: ['Bills', 'Gas', 'Kitchen'],
        isPinned: false,
        isEmergency: false,
        fileSize: 260000,
      },

      // --- WARRANTY (3) ---
      {
        name: 'Samsung Refrigerator Warranty & Invoice',
        category: 'Warranty',
        memberId: mother._id,
        documentNumber: 'WAR-SAMS-99281-NX',
        issuingAuthority: 'Samsung Electronics India',
        issueDate: subDays(320),
        expiryDate: addDays(42), // 🟢 Active (expires in 42 days)
        tags: ['Warranty', 'Appliances', 'Samsung', 'Refrigerator', 'Kitchen'],
        isPinned: false,
        isEmergency: false,
        fileSize: 620000,
      },
      {
        name: 'LG OLED 55" Smart TV Warranty',
        category: 'Warranty',
        memberId: father._id,
        documentNumber: 'LG-OLED-55-8819',
        issuingAuthority: 'LG Electronics',
        issueDate: subDays(200),
        expiryDate: addDays(530), // 🟢 Active
        tags: ['Warranty', 'Electronics', 'Television'],
        isPinned: false,
        isEmergency: false,
        fileSize: 580000,
      },
      {
        name: 'Apple MacBook Pro M3 Invoice & AppleCare',
        category: 'Warranty',
        memberId: son._id,
        documentNumber: 'APP-CARE-998201',
        issuingAuthority: 'Apple India Private Limited',
        issueDate: subDays(150),
        expiryDate: addDays(580), // 🟢 Active
        tags: ['Warranty', 'Electronics', 'Apple', 'Laptop'],
        isPinned: false,
        isEmergency: false,
        fileSize: 740000,
      },

      // --- FINANCIAL (2) ---
      {
        name: 'HDFC Savings Bank Account Passbook',
        category: 'Financial',
        memberId: father._id,
        documentNumber: 'HDFC-ACC-50100291',
        issuingAuthority: 'HDFC Bank Ltd',
        issueDate: subDays(900),
        expiryDate: null,
        tags: ['Financial', 'Bank', 'HDFC', 'Savings'],
        isPinned: false,
        isEmergency: true,
        fileSize: 510000,
      },
      {
        name: 'Home Loan Sanction Letter',
        category: 'Financial',
        memberId: father._id,
        documentNumber: 'SBI-HL-99182049',
        issuingAuthority: 'State Bank of India',
        issueDate: subDays(1800),
        expiryDate: null,
        tags: ['Financial', 'Loan', 'Home Loan', 'SBI'],
        isPinned: false,
        isEmergency: false,
        fileSize: 1350000,
      },

      // --- OTHER (1) ---
      {
        name: 'Family Medical History & Vaccinations',
        category: 'Other',
        memberId: daughter._id,
        documentNumber: 'MED-VAC-2025-09',
        issuingAuthority: 'Apollo Hospitals Clinical Records',
        issueDate: subDays(90),
        expiryDate: null,
        tags: ['Medical', 'Emergency', 'Vaccination', 'Health Record'],
        isPinned: true,
        isEmergency: true,
        fileSize: 820000,
      },
    ];

    console.log(`📄 Creating ${documentsData.length} documents...`);
    const createdDocs = [];

    for (let i = 0; i < documentsData.length; i++) {
      const doc = documentsData[i];
      const filename = `doc-${i + 1}-${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;
      const fileUrl = `/uploads/${filename}`;
      const member = members.find((m) => m._id.toString() === doc.memberId.toString());

      // Create preview file on disk
      createSampleDocFile(filename, doc.name, doc.category, doc.documentNumber, member ? member.name : 'Reddy Family');

      const newDoc = new Document({
        familyId: family._id,
        ownerId: user._id,
        memberId: doc.memberId,
        name: doc.name,
        category: doc.category,
        fileUrl,
        storageId: `LOCAL-VAULT-${1000 + i}`,
        fileType: 'image/svg+xml',
        fileSize: doc.fileSize,
        documentNumber: doc.documentNumber,
        issuingAuthority: doc.issuingAuthority,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        tags: doc.tags,
        notes: `Archived in FamilyVault on ${new Date().toLocaleDateString()}. Verified duplicate of original document.`,
        isPinned: doc.isPinned,
        isEmergency: doc.isEmergency,
        aiSummary: {
          whatIsIt: `Verified ${doc.category} record: ${doc.name}. Registered to ${member ? member.name : 'Family'}.`,
          importantDates: [
            doc.issueDate ? `Issued: ${new Date(doc.issueDate).toLocaleDateString()}` : 'Date of Issue verified',
            doc.expiryDate ? `Expires: ${new Date(doc.expiryDate).toLocaleDateString()}` : 'Validity: Permanent / No Expiration',
          ],
          importantNumbers: [
            `Identifier: ${doc.documentNumber}`,
            `Authority: ${doc.issuingAuthority}`,
          ],
          keyTerms: [
            'Legally valid record authorized for family administrative presentation.',
            'Encrypted storage index verified with active digital checksum.',
          ],
          actionsRequired: [
            doc.expiryDate ? `Monitor renewal notification window` : 'Archival status: safe and permanent',
          ],
          generatedAt: new Date(),
        },
      });

      await newDoc.save();
      createdDocs.push(newDoc);
    }

    // 5. Seed Warranties
    const samsungDoc = createdDocs.find((d) => d.name.includes('Samsung'));
    const lgDoc = createdDocs.find((d) => d.name.includes('LG'));
    const appleDoc = createdDocs.find((d) => d.name.includes('Apple'));

    await Warranty.create([
      {
        familyId: family._id,
        documentId: samsungDoc?._id,
        productName: 'Samsung Double Door Inverter Refrigerator',
        brand: 'Samsung',
        modelNumber: 'RT37T4513S8/HL',
        serialNumber: 'SN-SAMS-99281-NX',
        purchaseDate: subDays(320),
        warrantyExpiry: addDays(42),
        retailer: 'Croma Electronics Indiranagar',
        notes: '10-Year compressor warranty included in addition to standard coverage.',
      },
      {
        familyId: family._id,
        documentId: lgDoc?._id,
        productName: 'LG 55 Inch 4K Cinema OLED TV',
        brand: 'LG',
        modelNumber: 'OLED55C3PSA',
        serialNumber: 'LG-OLED-55-8819',
        purchaseDate: subDays(200),
        warrantyExpiry: addDays(530),
        retailer: 'Reliance Digital MG Road',
        notes: 'Extended panel insurance active until next year.',
      },
      {
        familyId: family._id,
        documentId: appleDoc?._id,
        productName: 'Apple MacBook Pro 14" M3 Space Black',
        brand: 'Apple',
        modelNumber: 'MRX33HN/A',
        serialNumber: 'APP-CARE-998201',
        purchaseDate: subDays(150),
        warrantyExpiry: addDays(580),
        retailer: 'Apple Store Express Avenue',
        notes: 'AppleCare+ comprehensive accidental damage protection active.',
      },
    ]);

    // 6. Seed Bills
    const eleDoc = createdDocs.find((d) => d.name.includes('Electricity'));
    const wifiDoc = createdDocs.find((d) => d.name.includes('Broadband'));
    const gasDoc = createdDocs.find((d) => d.name.includes('Piped Gas'));

    await Bill.create([
      {
        familyId: family._id,
        documentId: eleDoc?._id,
        provider: 'Bangalore Electricity Supply Company (BESCOM)',
        billType: 'electricity',
        amount: 2840,
        dueDate: addDays(6),
        status: 'due_soon',
        notes: 'Meter Account CA-99201948. Auto-debit pending.',
      },
      {
        familyId: family._id,
        documentId: wifiDoc?._id,
        provider: 'Airtel Xstream Fiber (300 Mbps)',
        billType: 'internet',
        amount: 1179,
        dueDate: addDays(12),
        status: 'due_soon',
        notes: 'Primary home broadband connection.',
      },
      {
        familyId: family._id,
        documentId: gasDoc?._id,
        provider: 'GAIL Gas Piped PNG',
        billType: 'gas',
        amount: 860,
        dueDate: subDays(2),
        status: 'paid',
        paidAt: subDays(3),
        notes: 'Bi-monthly kitchen piped gas consumption.',
      },
    ]);

    // 7. Seed Notifications for Expiring Documents & Hackathon Highlights
    await Notification.create([
      {
        userId: user._id,
        familyId: family._id,
        title: 'Car Insurance expires in 8 days',
        message: 'Car Insurance (Honda City) is due on ' + addDays(8).toLocaleDateString() + '. Review policy renewal quotes to prevent policy lapse.',
        type: 'expiry_warning',
        severity: 'danger',
        read: false,
        createdAt: subDays(1),
      },
      {
        userId: user._id,
        familyId: family._id,
        title: 'Two Wheeler PUC expires in 14 days',
        message: 'Pollution Under Control (PUC) certificate for Two Wheeler expires soon. Visit certified emission center.',
        type: 'expiry_warning',
        severity: 'warning',
        read: false,
        createdAt: subDays(2),
      },
      {
        userId: user._id,
        familyId: family._id,
        title: 'Driving License expires in 23 days',
        message: 'Rahul Reddy\'s Driving License validity ends on ' + addDays(23).toLocaleDateString() + '. Online RTO renewal form available.',
        type: 'expiry_warning',
        severity: 'warning',
        read: false,
        createdAt: subDays(3),
      },
      {
        userId: user._id,
        familyId: family._id,
        title: 'Passport expires in 27 days',
        message: 'Priya Reddy\'s Passport expires in less than 30 days. Tatkaal passport appointment recommended for international travel.',
        type: 'expiry_warning',
        severity: 'warning',
        read: false,
        createdAt: subDays(4),
      },
      {
        userId: user._id,
        familyId: family._id,
        title: 'BESCOM Electricity Bill due in 6 days',
        message: 'Statement amount of ₹2,840 is due on ' + addDays(6).toLocaleDateString() + '.',
        type: 'bill_due',
        severity: 'info',
        read: true,
        createdAt: subDays(5),
      },
    ]);

    // 8. Seed Activity Logs
    const activities = [
      {
        action: 'upload',
        documentName: 'Aadhaar Card - Rahul',
        userName: 'Rahul Reddy',
        createdAt: subDays(1),
        metadata: { category: 'Identity' },
      },
      {
        action: 'view',
        documentName: 'Family Health Insurance Policy',
        userName: 'Priya Reddy',
        createdAt: subDays(1),
        metadata: { category: 'Insurance' },
      },
      {
        action: 'update',
        documentName: 'Car Insurance - Honda City',
        userName: 'Rahul Reddy',
        createdAt: subDays(2),
        metadata: { note: 'Updated expiry date from renewal quotation' },
      },
      {
        action: 'download',
        documentName: 'Driving License - Rahul Reddy',
        userName: 'Rahul Reddy',
        createdAt: subDays(2),
        metadata: { category: 'Vehicle' },
      },
      {
        action: 'share',
        documentName: 'Apartment Sale Deed - Bangalore',
        userName: 'Rahul Reddy',
        createdAt: subDays(3),
        metadata: { permission: 'view_only', sharedWith: 'Legal Counsel' },
      },
      {
        action: 'pin',
        documentName: 'Aadhaar Card - Priya',
        userName: 'Rahul Reddy',
        createdAt: subDays(4),
        metadata: { isPinned: true },
      },
    ];

    for (const act of activities) {
      await ActivityLog.create({
        familyId: family._id,
        userId: user._id,
        userName: act.userName,
        action: act.action,
        documentName: act.documentName,
        metadata: act.metadata,
        createdAt: act.createdAt,
      });
    }

    console.log('✅ Demo Account Seeded Successfully!');
    console.log(`   User: ${demoEmail} / Demo@123`);
    console.log(`   Family: The Reddy Family`);
    console.log(`   Documents: ${documentsData.length} records`);
    console.log(`   Expiring Soon: 4 documents`);
    console.log(`   Expired: 1 document`);

    return { user, family, documentCount: documentsData.length };
  } catch (error) {
    console.error('❌ Error during demo seed:', error);
    throw error;
  }
};

// If run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  import('../config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedDemoData();
    await closeDB();
    process.exit(0);
  });
}
