import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuickSearchModal from './components/QuickSearchModal';
import DocumentDetailModal from './components/DocumentDetailModal';
import ShareModal from './components/ShareModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import FamilyPage from './pages/FamilyPage';
import WarrantyPage from './pages/WarrantyPage';
import BillsPage from './pages/BillsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VaultAssistantPage from './pages/VaultAssistantPage';
import SettingsPage from './pages/SettingsPage';
import SharedDocumentPage from './pages/SharedDocumentPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main Layout Router Content
const AppContent = () => {
  const { currentAccent } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedSearchDoc, setSelectedSearchDoc] = useState(null);
  const [searchDetailModalOpen, setSearchDetailModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const location = useLocation();
  const isSharedPage = location.pathname.startsWith('/shared/');

  return (
    <div className="flex flex-col min-h-screen relative bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Ambient Luxury Glow Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Glow Orb 1 - Top Left */}
        <div
          className="absolute -top-32 -left-32 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full blur-[140px] opacity-40 dark:opacity-30 transition-all duration-1000 animate-float-slow"
          style={{ background: currentAccent?.orb1 || 'rgba(6, 182, 212, 0.22)' }}
        />
        {/* Glow Orb 2 - Top Right */}
        <div
          className="absolute -top-24 -right-24 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full blur-[130px] opacity-35 dark:opacity-25 transition-all duration-1000 animate-pulse-slow"
          style={{ background: currentAccent?.orb2 || 'rgba(99, 102, 241, 0.22)' }}
        />
        {/* Glow Orb 3 - Bottom Center */}
        <div
          className="absolute -bottom-40 left-1/4 w-[600px] sm:w-[800px] h-[450px] rounded-full blur-[150px] opacity-25 dark:opacity-15 transition-all duration-1000"
          style={{ background: currentAccent?.orb3 || 'rgba(217, 70, 239, 0.12)' }}
        />
        {/* Micro-dot grid mesh */}
        <div className="absolute inset-0 bg-mesh-pattern opacity-50 dark:opacity-35" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
      {!isSharedPage && <Navbar onOpenSearch={() => setSearchOpen(true)} />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shared/:token" element={<SharedDocumentPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/family"
            element={
              <ProtectedRoute>
                <FamilyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranties"
            element={
              <ProtectedRoute>
                <WarrantyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <BillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <VaultAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isSharedPage && <Footer />}

      {/* Global Quick Search Modal */}
      <QuickSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectDocument={(doc) => {
          setSelectedSearchDoc(doc);
          setSearchDetailModalOpen(true);
        }}
      />

      {/* Search Result Detail Modal */}
      <DocumentDetailModal
        isOpen={searchDetailModalOpen}
        onClose={() => setSearchDetailModalOpen(false)}
        document={selectedSearchDoc}
        onOpenShare={(doc) => {
          setSearchDetailModalOpen(false);
          setShareDoc(doc);
          setShareModalOpen(true);
        }}
      />

      {/* Search Result Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        document={shareDoc}
      />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}
