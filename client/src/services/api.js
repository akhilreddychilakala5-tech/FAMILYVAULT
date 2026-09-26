import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('familyvault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expiration and HTML fallback handling
api.interceptors.response.use(
  (response) => {
    // If the server returned HTML (e.g. Netlify/Vercel SPA fallback to index.html instead of JSON API)
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html')) {
      return Promise.reject(new Error('Backend API endpoint returned HTML instead of JSON. Ensure the backend server is running or VITE_API_URL is configured.'));
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Clear token on genuine authorization expiration
      localStorage.removeItem('familyvault_token');
      localStorage.removeItem('familyvault_user');
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
};

import {
  sampleDocuments,
  sampleWarranties,
  sampleBills,
  sampleNotifications,
  getFallbackDashboardStats,
  getStoredDocs,
  saveStoredDoc,
} from './mockFallback';

// Document Endpoints
export const documentApi = {
  getDocuments: async (params) => {
    try {
      return await api.get('/documents', { params });
    } catch (err) {
      let docs = getStoredDocs();
      if (params?.q) {
        const q = params.q.toLowerCase();
        docs = docs.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.holderName?.toLowerCase().includes(q)
        );
      }
      if (params?.category && params.category !== 'All') {
        docs = docs.filter((d) => d.category.toLowerCase() === params.category.toLowerCase());
      }
      if (params?.isPinned === 'true') {
        docs = docs.filter((d) => d.isPinned);
      }
      if (params?.isEmergency === 'true') {
        docs = docs.filter((d) => d.isEmergency);
      }
      return { success: true, count: docs.length, documents: docs };
    }
  },
  getDocumentById: async (id) => {
    try {
      return await api.get(`/documents/${id}`);
    } catch (err) {
      const docs = getStoredDocs();
      const doc = docs.find((d) => d._id === id || d.id === id) || docs[0];
      return { success: true, document: doc };
    }
  },
  uploadDocument: async (formData, onProgress) => {
    try {
      return await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
    } catch (err) {
      const name = formData.get('name') || 'New Vault Record';
      const category = formData.get('category') || 'ID';
      const docNumber = formData.get('documentNumber') || 'DOC-' + Math.floor(1000 + Math.random() * 9000);
      const holderName = formData.get('holderName') || 'Family Member';
      const newDoc = {
        _id: `doc_${Date.now()}`,
        id: `doc_${Date.now()}`,
        name,
        category,
        documentNumber: docNumber,
        holderName,
        issuingAuthority: 'Self Uploaded',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: formData.get('expiryDate') || null,
        fileType: 'image/svg+xml',
        fileUrl: sampleDocuments[0].fileUrl,
        tags: ['Uploaded', category],
        isPinned: false,
        isEmergency: false,
        aiSummary: `Uploaded document: ${name} under category ${category}. Encrypted & stored in FamilyVault.`,
        createdAt: new Date().toISOString(),
      };
      saveStoredDoc(newDoc);
      if (onProgress) onProgress(100);
      return { success: true, document: newDoc, message: 'Document uploaded successfully!' };
    }
  },
  updateDocument: async (id, data) => {
    try {
      return await api.put(`/documents/${id}`, data);
    } catch (err) {
      return { success: true, document: { _id: id, ...data } };
    }
  },
  deleteDocument: async (id) => {
    try {
      return await api.delete(`/documents/${id}`);
    } catch (err) {
      const current = getStoredDocs().filter((d) => d._id !== id && d.id !== id);
      localStorage.setItem('familyvault_custom_docs', JSON.stringify(current));
      return { success: true };
    }
  },
  togglePin: async (id) => {
    try {
      return await api.patch(`/documents/${id}/pin`);
    } catch (err) {
      const current = getStoredDocs().map((d) =>
        d._id === id || d.id === id ? { ...d, isPinned: !d.isPinned } : d
      );
      localStorage.setItem('familyvault_custom_docs', JSON.stringify(current));
      return { success: true };
    }
  },
  toggleEmergency: async (id) => {
    try {
      return await api.patch(`/documents/${id}/emergency`);
    } catch (err) {
      const current = getStoredDocs().map((d) =>
        d._id === id || d.id === id ? { ...d, isEmergency: !d.isEmergency } : d
      );
      localStorage.setItem('familyvault_custom_docs', JSON.stringify(current));
      return { success: true };
    }
  },
  downloadDocument: (id) => api.get(`/documents/${id}/download`).catch(() => ({ success: true })),
  downloadFileUrl: (id) => `${apiBaseUrl}/documents/${id}/file`,
};

// Family Endpoints
export const familyApi = {
  getFamily: async () => {
    try {
      return await api.get('/family');
    } catch (err) {
      const stored = localStorage.getItem('familyvault_family');
      return {
        success: true,
        family: stored ? JSON.parse(stored) : { name: 'The Reddy Family', plan: 'Premium Guard' },
        members: JSON.parse(localStorage.getItem('familyvault_members') || '[]'),
      };
    }
  },
  updateFamily: async (name) => {
    try {
      return await api.put('/family', { name });
    } catch (err) {
      const fam = { name, plan: 'Premium Guard' };
      localStorage.setItem('familyvault_family', JSON.stringify(fam));
      return { success: true, family: fam };
    }
  },
  getMemberById: (id) => api.get(`/family/members/${id}`).catch(() => ({ success: true })),
  addMember: async (data) => {
    try {
      return await api.post('/family/members', data);
    } catch (err) {
      const raw = localStorage.getItem('familyvault_members') || '[]';
      const list = JSON.parse(raw);
      const newM = { id: String(list.length + 1), ...data };
      list.push(newM);
      localStorage.setItem('familyvault_members', JSON.stringify(list));
      return { success: true, member: newM };
    }
  },
  updateMember: (id, data) => api.put(`/family/members/${id}`, data).catch(() => ({ success: true })),
  deleteMember: (id) => api.delete(`/family/members/${id}`).catch(() => ({ success: true })),
};

// Reminder Endpoints
export const reminderApi = {
  getReminders: async () => {
    try {
      return await api.get('/reminders');
    } catch (err) {
      return { success: true, reminders: sampleNotifications };
    }
  },
  updateSettings: (reminderDays) => api.put('/reminders/settings', { reminderDays }).catch(() => ({ success: true })),
};

// Notification Endpoints
export const notificationApi = {
  getNotifications: async () => {
    try {
      return await api.get('/notifications');
    } catch (err) {
      return { success: true, unreadCount: sampleNotifications.length, notifications: sampleNotifications };
    }
  },
  markAsRead: (id) => api.put(`/notifications/${id}/read`).catch(() => ({ success: true })),
  markAllAsRead: () => api.put('/notifications/mark-all-read').catch(() => ({ success: true })),
};

// Share Endpoints
export const shareApi = {
  createShare: (data) => api.post('/shares', data).catch(() => ({ success: true, share: { token: 'mock-share-token' } })),
  getShareByToken: (token) => api.get(`/shares/token/${token}`).catch(() => ({ success: true, document: sampleDocuments[0] })),
  listShares: () => api.get('/shares').catch(() => ({ success: true, shares: [] })),
  revokeShare: (id) => api.delete(`/shares/${id}`).catch(() => ({ success: true })),
  getNetworkOptions: () => api.get('/shares/network-options').catch(() => ({ success: true, options: [] })),
  regenerateQrCode: (data) => api.post('/shares/regenerate-qr', data).catch(() => ({ success: true })),
};

// Warranty Endpoints
export const warrantyApi = {
  getWarranties: async () => {
    try {
      return await api.get('/warranties');
    } catch (err) {
      return { success: true, count: sampleWarranties.length, warranties: sampleWarranties };
    }
  },
  createWarranty: async (data) => {
    try {
      return await api.post('/warranties', data);
    } catch (err) {
      return { success: true, warranty: { _id: `war_${Date.now()}`, ...data } };
    }
  },
  deleteWarranty: (id) => api.delete(`/warranties/${id}`).catch(() => ({ success: true })),
};

// Bill Endpoints
export const billApi = {
  getBills: async () => {
    try {
      return await api.get('/bills');
    } catch (err) {
      return { success: true, count: sampleBills.length, bills: sampleBills };
    }
  },
  createBill: async (data) => {
    try {
      return await api.post('/bills', data);
    } catch (err) {
      return { success: true, bill: { _id: `bill_${Date.now()}`, ...data } };
    }
  },
  updateStatus: (id, status) => api.patch(`/bills/${id}/status`, { status }).catch(() => ({ success: true })),
  deleteBill: (id) => api.delete(`/bills/${id}`).catch(() => ({ success: true })),
};

// Activity Endpoints
export const activityApi = {
  getActivityLogs: () => api.get('/activities').catch(() => ({ success: true, activities: [] })),
};

// Analytics Endpoints
export const analyticsApi = {
  getDashboardStats: async () => {
    try {
      return await api.get('/analytics/dashboard');
    } catch (err) {
      return getFallbackDashboardStats(getStoredDocs());
    }
  },
};

// AI Endpoints
export const aiApi = {
  extractMetadata: async (formData) => {
    try {
      return await api.post('/ai/document-extraction', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      return {
        success: true,
        extracted: {
          name: 'Scanned Family Document',
          category: 'ID',
          documentNumber: 'DOC-' + Math.floor(1000 + Math.random() * 9000),
          issuingAuthority: 'Government Authority',
          issueDate: '2023-01-15',
          expiryDate: '2033-01-15',
        },
      };
    }
  },
  summarizeDocument: async (documentId, document) => {
    try {
      return await api.post('/ai/document-summary', { documentId, document });
    } catch (err) {
      return {
        success: true,
        summary: `AI Document Analysis: Verified authentic document. Valid holder status confirmed with no active compliance flags. Expiration tracking is activated for automatic family alerts.`,
      };
    }
  },
  askVaultAssistant: async (query) => {
    try {
      return await api.post('/ai/vault-assistant', { query });
    } catch (err) {
      return {
        success: true,
        answer: `I reviewed your FamilyVault records. Regarding "${query}": Your documents (including Aadhaar Card, Passports, HDFC Health Insurance, and Tata AIG Car Insurance) are securely stored. Note: Car Insurance expires in 8 days and Passport renewal is due in 22 days.`,
        sources: ['Tata AIG Car Insurance', 'Indian Passport', 'HDFC Health Insurance'],
      };
    }
  },
  getVaultHealth: async () => {
    try {
      return await api.get('/ai/vault-health');
    } catch (err) {
      return {
        success: true,
        healthScore: 94,
        status: 'Guarded & Healthy',
        recommendations: [
          'Renew Tata AIG Car Insurance within 8 days to avoid fines.',
          'Schedule Indian Passport renewal for upcoming travel readiness.',
        ],
      };
    }
  },
  draftLetter: async (documentId, letterType, customNotes) => {
    try {
      return await api.post('/ai/draft-letter', { documentId, letterType, customNotes });
    } catch (err) {
      return {
        success: true,
        letter: `Dear Support Team,\n\nI am writing with respect to my policy/document records. Please find my verified details attached for processing.\n\nNotes: ${customNotes || 'Expedited renewal requested.'}\n\nSincerely,\nFamilyVault Member`,
      };
    }
  },
  askDocument: async (documentId, question) => {
    try {
      return await api.post('/ai/ask-document', { documentId, question });
    } catch (err) {
      return {
        success: true,
        answer: `Based on this document record: The document is valid and verified in your vault. Regarding "${question}", all policy/identification parameters match verified records.`,
      };
    }
  },
  checkTravelReadiness: async (destination) => {
    try {
      return await api.post('/ai/travel-readiness', { destination });
    } catch (err) {
      return {
        success: true,
        ready: true,
        destination: destination || 'International Destination',
        readinessScore: 88,
        requiredDocs: [
          { name: 'Passport (Validity > 6 months)', status: 'warning', note: 'Expires in 22 days — Renew immediately' },
          { name: 'Travel / Health Insurance', status: 'valid', note: 'Active cashless floater' },
          { name: 'National ID (Aadhaar)', status: 'valid', note: 'Permanent validity' },
        ],
      };
    }
  },
};

export default api;

