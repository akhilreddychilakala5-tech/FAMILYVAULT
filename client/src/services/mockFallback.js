// Client-side fallback storage when running on static hosting (e.g. Netlify/Vercel) without a live backend

export const sampleDocuments = [
  {
    _id: 'doc_aadhaar_suresh',
    id: 'doc_aadhaar_suresh',
    name: 'Aadhaar Card — Suresh Reddy',
    category: 'ID',
    documentNumber: 'XXXX-XXXX-8912',
    issuingAuthority: 'UIDAI',
    issueDate: '2016-08-15',
    expiryDate: null,
    memberId: '1',
    holderName: 'Suresh Reddy',
    fileType: 'image/svg+xml',
    fileUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 380'><rect width='600' height='380' rx='16' fill='%23ffffff' stroke='%230284c7' stroke-width='4'/><rect width='600' height='70' fill='%230284c7'/><text x='300' y='45' fill='%23ffffff' font-size='22' font-weight='bold' text-anchor='middle'>GOVERNMENT OF INDIA - UNIQUE IDENTIFICATION</text><text x='40' y='140' font-size='18' font-weight='bold' fill='%230f172a'>Name: Suresh Reddy</text><text x='40' y='175' font-size='16' fill='%23475569'>DOB: 14/05/1982 | Gender: Male</text><text x='40' y='210' font-size='16' fill='%23475569'>Aadhaar No: XXXX-XXXX-8912</text><text x='40' y='320' font-size='14' fill='%230284c7' font-weight='bold'>Mera Aadhaar, Meri Pehchan</text></svg>",
    tags: ['Identity', 'National ID', 'Verified'],
    isPinned: true,
    isEmergency: true,
    aiSummary: 'Official Government of India Aadhaar identity card issued to Suresh Reddy.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    _id: 'doc_passport_suresh',
    id: 'doc_passport_suresh',
    name: 'Indian Passport — Suresh Reddy',
    category: 'ID',
    documentNumber: 'Z6192847',
    issuingAuthority: 'Ministry of External Affairs',
    issueDate: '2019-03-10',
    expiryDate: new Date(Date.now() + 22 * 86400000).toISOString(), // 22 days left -> Expiring soon!
    memberId: '1',
    holderName: 'Suresh Reddy',
    fileType: 'image/svg+xml',
    fileUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 380'><rect width='600' height='380' rx='16' fill='%230f172a' stroke='%2338bdf8' stroke-width='4'/><text x='300' y='60' fill='%23fbbf24' font-size='24' font-weight='bold' text-anchor='middle'>REPUBLIC OF INDIA - PASSPORT</text><text x='40' y='140' font-size='18' font-weight='bold' fill='%23ffffff'>Name: Suresh Reddy</text><text x='40' y='175' font-size='16' fill='%2394a3b8'>Passport No: Z6192847</text><text x='40' y='210' font-size='16' fill='%23f59e0b'>EXPIRING SOON: 22 Days Left</text></svg>",
    tags: ['Travel', 'Passport', 'Renewal Required'],
    isPinned: true,
    isEmergency: true,
    aiSummary: 'Indian international passport for Suresh Reddy expiring in less than 30 days. Renewal strongly recommended prior to foreign travel.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    _id: 'doc_health_insurance',
    id: 'doc_health_insurance',
    name: 'Family Floater Health Insurance (HDFC Ergo)',
    category: 'Insurance',
    documentNumber: 'HDFC-HLTH-994821',
    issuingAuthority: 'HDFC ERGO General Insurance',
    issueDate: '2025-04-01',
    expiryDate: new Date(Date.now() + 185 * 86400000).toISOString(),
    memberId: '1',
    holderName: 'The Reddy Family',
    fileType: 'image/svg+xml',
    fileUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 380'><rect width='600' height='380' rx='16' fill='%23ffffff' stroke='%2310b981' stroke-width='4'/><rect width='600' height='70' fill='%2310b981'/><text x='300' y='45' fill='%23ffffff' font-size='20' font-weight='bold' text-anchor='middle'>HDFC ERGO HEALTH SURAKSHA - FAMILY FLOATER</text><text x='40' y='130' font-size='18' font-weight='bold' fill='%230f172a'>Sum Insured: ₹25,00,000</text><text x='40' y='170' font-size='16' fill='%23475569'>Policy No: HDFC-HLTH-994821</text><text x='40' y='210' font-size='16' fill='%2310b981' font-weight='bold'>Status: Active Cashless Network</text></svg>",
    tags: ['Health', 'Cashless', 'Floater', 'Emergency'],
    isPinned: true,
    isEmergency: true,
    aiSummary: 'Comprehensive cashless family health insurance coverage of ₹25 Lakhs covering hospitalizations, surgeries, and critical illness across all network hospitals.',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    _id: 'doc_car_insurance',
    id: 'doc_car_insurance',
    name: 'Car Comprehensive Policy (Tata AIG)',
    category: 'Insurance',
    documentNumber: 'TATA-MOT-8839210',
    issuingAuthority: 'Tata AIG General Insurance',
    issueDate: '2025-10-10',
    expiryDate: new Date(Date.now() + 8 * 86400000).toISOString(), // 8 days left -> Urgent!
    memberId: '1',
    holderName: 'Suresh Reddy',
    fileType: 'image/svg+xml',
    fileUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 380'><rect width='600' height='380' rx='16' fill='%23ffffff' stroke='%23f59e0b' stroke-width='4'/><rect width='600' height='70' fill='%23f59e0b'/><text x='300' y='45' fill='%23ffffff' font-size='20' font-weight='bold' text-anchor='middle'>TATA AIG AUTO SECURE - VEHICLE INSURANCE</text><text x='40' y='130' font-size='18' font-weight='bold' fill='%230f172a'>Vehicle: Hyundai Creta (KA-01-MJ-4491)</text><text x='40' y='170' font-size='16' fill='%23475569'>Policy No: TATA-MOT-8839210</text><text x='40' y='210' font-size='16' fill='%23d97706' font-weight='bold'>EXPIRING IN 8 DAYS — RENEWAL DUE</text></svg>",
    tags: ['Vehicle', 'Auto', 'Renewal Urgent'],
    isPinned: false,
    isEmergency: false,
    aiSummary: 'Motor insurance policy covering vehicle damage and third-party liabilities. Expiring within 8 days. Renewal required to avoid traffic fines and lapse.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    _id: 'doc_property_deed',
    id: 'doc_property_deed',
    name: 'Apartment Sale Deed & Registration Certificate',
    category: 'Property',
    documentNumber: 'BLR-REG-2021-7789',
    issuingAuthority: 'Department of Stamps and Registration, Karnataka',
    issueDate: '2021-11-20',
    expiryDate: null,
    memberId: '1',
    holderName: 'Suresh Reddy & Lakshmi Reddy',
    fileType: 'image/svg+xml',
    fileUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 380'><rect width='600' height='380' rx='16' fill='%23ffffff' stroke='%236366f1' stroke-width='4'/><rect width='600' height='70' fill='%236366f1'/><text x='300' y='45' fill='%23ffffff' font-size='20' font-weight='bold' text-anchor='middle'>GOVERNMENT OF KARNATAKA - SALE DEED REGISTRY</text><text x='40' y='130' font-size='18' font-weight='bold' fill='%230f172a'>Property: Flat 402, Prestige Lakeside Habitat</text><text x='40' y='170' font-size='16' fill='%23475569'>Owners: Suresh Reddy &amp; Lakshmi Reddy</text><text x='40' y='210' font-size='16' fill='%236366f1' font-weight='bold'>Encumbrance-Free Title Document</text></svg>",
    tags: ['Property', 'Real Estate', 'Title Deed', 'Permanent'],
    isPinned: true,
    isEmergency: false,
    aiSummary: 'Registered sale deed confirming absolute freehold ownership of residential apartment Unit 402 with joint title held by Suresh and Lakshmi Reddy.',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    _id: 'doc_refrigerator_warranty',
    id: 'doc_refrigerator_warranty',
    name: 'LG Double Door Refrigerator — 10 Yr Compressor Warranty',
    category: 'Warranty',
    documentNumber: 'LG-INV-WAR-448102',
    issuingAuthority: 'LG Electronics India',
    issueDate: '2023-06-15',
    expiryDate: new Date(Date.now() + 7 * 365 * 86400000).toISOString(),
    memberId: '1',
    holderName: 'Suresh Reddy',
    fileType: 'image/svg+xml',
    fileUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 380'><rect width='600' height='380' rx='16' fill='%23ffffff' stroke='%23ec4899' stroke-width='4'/><rect width='600' height='70' fill='%23ec4899'/><text x='300' y='45' fill='%23ffffff' font-size='20' font-weight='bold' text-anchor='middle'>LG ELECTRONICS - EXTENDED APPLIANCE WARRANTY</text><text x='40' y='130' font-size='18' font-weight='bold' fill='%230f172a'>Product: Smart Inverter Refrigerator 437L</text><text x='40' y='170' font-size='16' fill='%23475569'>Warranty Period: 10 Years Smart Inverter Compressor</text><text x='40' y='210' font-size='16' fill='%2310b981' font-weight='bold'>Covered: Labor &amp; Compressor Replacement</text></svg>",
    tags: ['Appliances', 'Warranty', 'LG', 'Invoice'],
    isPinned: false,
    isEmergency: false,
    aiSummary: 'Manufacturer warranty covering smart inverter compressor parts and authorized technician service visits until 2033.',
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
];

export const sampleWarranties = [
  {
    _id: 'war_1',
    productName: 'MacBook Pro 16" M3 Max',
    brand: 'Apple',
    purchaseDate: '2024-01-10',
    expiryDate: new Date(Date.now() + 320 * 86400000).toISOString(),
    category: 'Electronics',
    status: 'active',
  },
  {
    _id: 'war_2',
    productName: 'Sony Bravia 65" 4K OLED',
    brand: 'Sony',
    purchaseDate: '2023-11-20',
    expiryDate: new Date(Date.now() + 450 * 86400000).toISOString(),
    category: 'Electronics',
    status: 'active',
  },
  {
    _id: 'war_3',
    productName: 'Dyson V15 Detect Vacuum',
    brand: 'Dyson',
    purchaseDate: '2024-03-01',
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(),
    category: 'Home Appliances',
    status: 'active',
  },
];

export const sampleBills = [
  {
    _id: 'bill_1',
    title: 'BESCOM Electricity Bill',
    category: 'Electricity',
    billerName: 'Bangalore Electricity Supply Company',
    amount: 3450,
    dueDate: new Date(Date.now() + 6 * 86400000).toISOString(),
    status: 'pending',
  },
  {
    _id: 'bill_2',
    title: 'Airtel Xstream Fiber Broadband',
    category: 'Internet',
    billerName: 'Airtel Telecommunications',
    amount: 1179,
    dueDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    status: 'pending',
  },
  {
    _id: 'bill_3',
    title: 'BWSSB Water & Sanitation',
    category: 'Water',
    billerName: 'BWSSB Bangalore',
    amount: 820,
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'paid',
  },
];

export const sampleNotifications = [
  {
    _id: 'notif_1',
    title: 'Car Insurance Expiring Soon',
    message: 'Your Tata AIG Car Insurance policy expires in 8 days. Renew to avoid disruption.',
    type: 'expiry_warning',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'notif_2',
    title: 'Passport Renewal Reminder',
    message: 'Suresh Reddy passport expires in 22 days.',
    type: 'expiry_warning',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'notif_3',
    title: 'BESCOM Electricity Bill Due',
    message: 'Payment of ₹3,450 due in 6 days.',
    type: 'bill_due',
    read: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const getFallbackDashboardStats = (docs = sampleDocuments) => {
  const totalDocuments = docs.length;
  const now = new Date();
  let expiringSoon = 0;
  let expired = 0;
  let active = 0;

  docs.forEach((d) => {
    if (!d.expiryDate) {
      active++;
      return;
    }
    const days = Math.ceil((new Date(d.expiryDate) - now) / 86400000);
    if (days < 0) expired++;
    else if (days <= 30) expiringSoon++;
    else active++;
  });

  return {
    success: true,
    stats: {
      totalDocuments,
      active,
      expiringSoon,
      expired,
      familyMembers: 4,
      totalWarranties: 3,
      pendingBills: 2,
    },
    recentDocuments: docs.slice(0, 4),
    pinnedDocuments: docs.filter((d) => d.isPinned),
    emergencyDocuments: docs.filter((d) => d.isEmergency),
  };
};

// Safe storage getters & setters
export const getStoredDocs = () => {
  try {
    const raw = localStorage.getItem('familyvault_custom_docs');
    if (!raw) return sampleDocuments;
    return JSON.parse(raw);
  } catch {
    return sampleDocuments;
  }
};

export const saveStoredDoc = (newDoc) => {
  const current = getStoredDocs();
  const updated = [newDoc, ...current];
  try {
    localStorage.setItem('familyvault_custom_docs', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
  return updated;
};
