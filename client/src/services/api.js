import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// Response interceptor for auth expiration
api.interceptors.response.use(
  (response) => response.data,
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

// Document Endpoints
export const documentApi = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData, onProgress) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  togglePin: (id) => api.patch(`/documents/${id}/pin`),
  toggleEmergency: (id) => api.patch(`/documents/${id}/emergency`),
  downloadDocument: (id) => api.get(`/documents/${id}/download`),
  downloadFileUrl: (id) => `/api/documents/${id}/file`,
};

// Family Endpoints
export const familyApi = {
  getFamily: () => api.get('/family'),
  updateFamily: (name) => api.put('/family', { name }),
  getMemberById: (id) => api.get(`/family/members/${id}`),
  addMember: (data) => api.post('/family/members', data),
  updateMember: (id, data) => api.put(`/family/members/${id}`, data),
  deleteMember: (id) => api.delete(`/family/members/${id}`),
};

// Reminder Endpoints
export const reminderApi = {
  getReminders: () => api.get('/reminders'),
  updateSettings: (reminderDays) => api.put('/reminders/settings', { reminderDays }),
};

// Notification Endpoints
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

// Share Endpoints
export const shareApi = {
  createShare: (data) => api.post('/shares', data),
  getShareByToken: (token) => api.get(`/shares/token/${token}`),
  listShares: () => api.get('/shares'),
  revokeShare: (id) => api.delete(`/shares/${id}`),
  getNetworkOptions: () => api.get('/shares/network-options'),
  regenerateQrCode: (data) => api.post('/shares/regenerate-qr', data),
};

// Warranty Endpoints
export const warrantyApi = {
  getWarranties: () => api.get('/warranties'),
  createWarranty: (data) => api.post('/warranties', data),
  deleteWarranty: (id) => api.delete(`/warranties/${id}`),
};

// Bill Endpoints
export const billApi = {
  getBills: () => api.get('/bills'),
  createBill: (data) => api.post('/bills', data),
  updateStatus: (id, status) => api.patch(`/bills/${id}/status`, { status }),
  deleteBill: (id) => api.delete(`/bills/${id}`),
};

// Activity Endpoints
export const activityApi = {
  getActivityLogs: () => api.get('/activities'),
};

// Analytics Endpoints
export const analyticsApi = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
};

// AI Endpoints
export const aiApi = {
  extractMetadata: (formData) =>
    api.post('/ai/document-extraction', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  summarizeDocument: (documentId, document) =>
    api.post('/ai/document-summary', { documentId, document }),
  askVaultAssistant: (query) => api.post('/ai/vault-assistant', { query }),
  getVaultHealth: () => api.get('/ai/vault-health'),
  draftLetter: (documentId, letterType, customNotes) =>
    api.post('/ai/draft-letter', { documentId, letterType, customNotes }),
  askDocument: (documentId, question) =>
    api.post('/ai/ask-document', { documentId, question }),
  checkTravelReadiness: (destination) =>
    api.post('/ai/travel-readiness', { destination }),
};

export default api;
