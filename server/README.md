# 🔐 FamilyVault — Premium Full-Stack Family Document Management Platform

> **“Your family documents. Safe, organized, always ready.”**  
> *“One secure place for everything your family needs.”*

---

## 🌟 Executive Overview

**FamilyVault** is a production-quality, security-first full-stack SaaS application built to solve the universal problem: **“Where is that document?”**

Instead of scattering sensitive files across random folders, WhatsApp chats, photo galleries, and forgotten email attachments, FamilyVault gives families a unified, encrypted vault with smart categories, automated expiry tracking, real-time reminders, and controlled household access.

### 🛡️ Privacy Statement
> **“Your documents belong to you.”**  
> FamilyVault is engineered with privacy-first access controls so users decide who can view their documents. No permanent public document links exist. Temporary sharing is gated with cryptographically secure, time-limited tokens and dynamic QR codes.

---

## 🚀 Instant Demo Credentials

For hackathon demonstration and evaluation:

* **Demo URL:** [http://localhost:5173](http://localhost:5173)
* **Demo Email:** `demo@familyvault.app`
* **Demo Password:** `Demo@123`
* **1-Click Login:** Available directly on the Landing Page and Login Page

### 📦 Pre-Seeded Dataset
The platform starts pre-populated with **The Reddy Family**:
* **4 Family Members:** Rahul Reddy (Father), Priya Reddy (Mother), Arjun Reddy (Son), Ananya Reddy (Daughter)
* **28 Verified Documents** across all categories:
  * 🪪 **Identity:** Aadhaar Cards, PAN Card, Passports, Voter ID
  * 🏥 **Insurance:** Family Health Insurance, Car Insurance, Term Life Policy
  * 🚗 **Vehicle:** Driving License, Car RC, Two-Wheeler RC, Pollution Certificate (PUC)
  * 🎓 **Education:** B.Tech Degree, High School Diploma, MBA Certificate
  * 🏠 **Property:** Apartment Sale Deed, Property Tax Receipt, Rental Lease
  * 🧾 **Bills:** BESCOM Electricity, Airtel Fiber, GAIL Piped Gas
  * 🛠 **Warranties:** Samsung Refrigerator, LG OLED TV, Apple MacBook Pro
  * 💳 **Financial:** HDFC Passbook, SBI Home Loan Sanction
  * 📄 **Other:** Family Clinical Vaccinations & Medical Records
* **Real Calculated Statuses:**
  * 🟢 **Active:** 9 documents
  * 🟡 **Expiring Soon (&le;30 days):** 4 documents (Car Insurance - 8d, Two-Wheeler PUC - 14d, Driving License - 23d, Passport - 27d)
  * 🔴 **Expired:** 1 document (Past 2025 Health Policy - 15d ago)
  * ⚪ **No Expiry:** 14 documents (Permanent government IDs, property deeds, degrees)

---

## 🛠 Technology Stack

### Frontend
* **React 18** with **Vite 6**
* **Tailwind CSS** with custom dark navy palette, glassmorphism tokens, and scanner beam animations
* **React Router v7** for single-page routing and protected route guards
* **Recharts** for interactive category donuts, member volume bars, and expiry forecasts
* **Lucide React** for clean iconography
* **Axios** with JWT request/response interceptors
* **Canvas-Confetti** for onboarding celebrations

### Backend
* **Node.js** & **Express.js** REST API
* **MongoDB** with **Mongoose** (Seamless zero-config fallback to `mongodb-memory-server` when local MongoDB service is not pre-installed)
* **JWT** (JSON Web Tokens) with 30-day persistence
* **bcryptjs** for secure salted password hashing
* **Multer** with MIME type inspection and 15MB file size limits
* **QRCode** library for dynamic SVG/data-URL QR code generation
* **Helmet** and **CORS** security headers with relaxed cross-origin policies for preview files

---

## 📁 Project Structure

```text
familyvault/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation, search trigger, notification dropdown, theme toggle
│   │   │   ├── Footer.jsx               # Security statement & branding
│   │   │   ├── DocumentCard.jsx         # Card with status badge, pin, emergency, download, share
│   │   │   ├── DocumentUploadModal.jsx  # Drag & drop, animated scanner, AI metadata review
│   │   │   ├── DocumentDetailModal.jsx  # Full preview, metadata, AI summary, actions
│   │   │   ├── ShareModal.jsx           # Temporary tokenized links & QR code generator
│   │   │   └── QuickSearchModal.jsx     # Cmd/Ctrl+K global real-time search
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Hero, trust cards, preview, 1-click demo login
│   │   │   ├── LoginPage.jsx            # Authentication + forgot password modal
│   │   │   ├── RegisterPage.jsx         # Account creation
│   │   │   ├── OnboardingPage.jsx       # 4-step wizard: family name, members, categories, alerts
│   │   │   ├── DashboardPage.jsx        # 5 real KPI stats, expiring alert, essentials, recent docs
│   │   │   ├── DocumentsPage.jsx        # Full catalog with search, category tabs, status filters
│   │   │   ├── FamilyPage.jsx           # Member cards + individual "Member's Vault" view
│   │   │   ├── WarrantyPage.jsx         # WarrantyVault tracking appliances & invoices
│   │   │   ├── BillsPage.jsx            # Utility organizer with due dates & status tracking
│   │   │   ├── AnalyticsPage.jsx        # Recharts visual analytics & expiry timelines
│   │   │   ├── VaultAssistantPage.jsx   # Natural language AI chat querying real documents
│   │   │   ├── SettingsPage.jsx         # Profile, reminder schedule, dark/light theme, password
│   │   │   └── SharedDocumentPage.jsx   # Public tokenized document view
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── services/
│   │   │   └── api.js                   # REST client for all server endpoints
│   │   ├── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js                        # Connects to MongoDB / In-Memory MongoDB engine
│   ├── models/
│   │   ├── User.js
│   │   ├── Family.js
│   │   ├── FamilyMember.js
│   │   ├── Document.js
│   │   ├── Reminder.js
│   │   ├── Notification.js
│   │   ├── Warranty.js
│   │   ├── Bill.js
│   │   ├── Share.js
│   │   └── ActivityLog.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── documentExtractor.js         # Intelligent OCR extraction & Demo AI Mode
│   │   ├── documentSummarizer.js        # Executive summary, key dates, numbers & actions
│   │   └── vaultAssistant.js            # Context-aware query assistant
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── familyController.js
│   │   ├── reminderController.js
│   │   ├── notificationController.js
│   │   ├── shareController.js
│   │   ├── warrantyController.js
│   │   ├── billController.js
│   │   ├── activityController.js
│   │   ├── analyticsController.js
│   │   └── aiController.js
│   ├── routes/                          # Express REST API routes
│   ├── seed/
│   │   └── seedData.js                  # Complete 28-document demo seed generator
│   └── server.js
│
├── uploads/                             # Secure local storage for uploaded & generated files
└── README.md
```

---

## 🎯 Complete Hackathon Demonstration Walkthrough

1. **Landing Page:** Open `http://localhost:5173`. Notice the hero headline, the animated preview card with live status badges, trust cards, and 4-step workflow.
2. **1-Click Demo Login:** Click the `1-Click Demo Login` button to authenticate as `demo@familyvault.app` (`The Reddy Family`).
3. **Dashboard:**
   * View live statistics: **28 Total Documents**, **4 Expiring Soon**, **1 Expired**, **4 Family Members**, **1.8 GB Storage**.
   * Inspect the **Expiring Soon Alert Banner** highlighting Car Insurance (8 days), Two-Wheeler PUC (14 days), Driving License (23 days), and Passport (27 days).
   * Notice **Family Essentials** pinned at the top.
4. **Instant Search & Filters:**
   * Navigate to `Documents` or press `⌘K` / `Ctrl+K`.
   * Search `Insurance` — instantly retrieves the 4 insurance records.
   * Switch between status filters: *Active*, *Expiring Soon*, *Expired*, and *No Expiry*.
5. **Smart Document Extraction (AI / OCR):**
   * Click `+ Upload Document`.
   * Choose any sample file (PDF/Image) or click to browse.
   * Watch the animated scanning beam analyze the file and prefill Document Type, Person Name, Policy Number, Issue Date, Expiry Date, and Tags.
   * Review and edit the fields before saving to the vault.
6. **AI Document Summary:**
   * Click on any document card (e.g. *Car Insurance* or *Aadhaar Card*).
   * Switch to the **AI Summary** tab and click `Summarize Document`.
   * Review the structured breakdown: What this is, Important Dates, Key Numbers, Legal Terms, and Actions Required.
7. **Secure QR Code Sharing:**
   * Click the `Share` button on any document.
   * Choose permission level: *View Only*, *View + Download*, or *Manage*.
   * Set expiration window and view limit.
   * Generate an encrypted temporary link with a dynamic QR code.
8. **Family Access & Member Vaults:**
   * Open the `Family` page to see the 4 members with document counts.
   * Click on **Rahul Reddy** to open his individual vault with his personal documents and stats.
9. **Vault Assistant AI:**
   * Open the `Vault Assistant` page.
   * Click prompt chips like *“Which documents expire this month?”* or *“Show my father's vehicle documents”*.
   * Watch the assistant return contextual answers and link direct document cards.
10. **WarrantyVault & Bill Organizer:**
    * Open `Warranties` to inspect appliance invoices (Samsung refrigerator, LG TV, MacBook Pro).
    * Open `Bills` to view utility balances and toggle payment statuses.
11. **Visual Analytics:**
    * Open `Analytics` to view Recharts donut charts, bar graphs, and expiry timelines.

---

## 🏃 Local Setup & Running

### Prerequisites
* Node.js v18+ and npm installed

### 1. Backend Server
```bash
cd server
npm install
npm start
```
* Backend runs on `http://localhost:5000`
* Automatically spins up the MongoDB engine and seeds the demo account on first run!

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
* Frontend runs on `http://localhost:5173` with proxying to backend on port 5000.

### 3. Supabase ("Super Database") Cloud Integration
* **Project Reference**: `vmjgfdyhaljycehtndud`
* **Project URL**: `https://vmjgfdyhaljycehtndud.supabase.co`
* **Schema File**: `server/config/supabase_schema.sql`
* **Status**: Authenticated & Connected via `@supabase/supabase-js`
* Run the schema in your [Supabase SQL Editor](https://supabase.com/dashboard/project/vmjgfdyhaljycehtndud/sql/new) to initialize Postgres tables (`documents`, `families`, `shares`, `notifications`) and vault storage buckets.
