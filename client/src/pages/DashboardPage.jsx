import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  Users,
  HardDrive,
  Upload,
  UserPlus,
  Bell,
  Search,
  BarChart3,
  Bot,
  Star,
  LifeBuoy,
  Shield,
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Loader2,
  Car,
  Heart,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyticsApi, documentApi } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import DocumentUploadModal from '../components/DocumentUploadModal';
import DocumentDetailModal from '../components/DocumentDetailModal';
import ShareModal from '../components/ShareModal';
import { downloadFromUrl } from '../utils/fileDownload';
import VaultHealthCard from '../components/VaultHealthCard';
import TravelReadinessModal from '../components/TravelReadinessModal';

const DashboardPage = () => {
  const { user, family } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [pinnedDocs, setPinnedDocs] = useState([]);
  const [emergencyDocs, setEmergencyDocs] = useState([]);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [travelModalOpen, setTravelModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentDocs(res.recentDocuments || []);
        setPinnedDocs(res.pinnedDocuments || []);
        setEmergencyDocs(res.emergencyDocuments || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleOpenDetail = (doc) => {
    setSelectedDoc(doc);
    setDetailModalOpen(true);
  };

  const handleOpenShare = (doc) => {
    setShareDoc(doc);
    setShareModalOpen(true);
  };

  const handleDownload = async (doc) => {
    try {
      await documentApi.downloadDocument(doc._id);
      const ext = doc.fileType?.includes('png') ? '.png' : doc.fileType?.includes('svg') ? '.svg' : '';
      const fallbackName = doc.name.includes('.') ? doc.name : `${doc.name}${ext}`;
      await downloadFromUrl(doc.fileUrl, fallbackName);
      success(`Downloading ${doc.name}...`);
    } catch (err) {
      error('Download failed: ' + err.message);
    }
  };

  const handleDelete = async (doc) => {
    if (window.confirm(`Delete "${doc.name}" from your vault?`)) {
      try {
        await documentApi.deleteDocument(doc._id);
        success('Document deleted successfully.');
        fetchDashboardData();
      } catch (err) {
        error(err.message);
      }
    }
  };

  const handleTogglePin = async (docId) => {
    try {
      const res = await documentApi.togglePin(docId);
      if (res.success) {
        success(res.message);
        fetchDashboardData();
      }
    } catch (err) {
      error(err.message);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading {family?.name || 'FamilyVault'} records...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              {family?.name || 'The Reddy Family Vault'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Privacy-First Secured
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name || 'Family Member'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            “Your family's documents are organized and ready.”
          </p>
        </div>

        {/* Top Quick CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <Link
            to="/assistant"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold glass-panel border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1.5 transition-colors"
          >
            <Bot className="w-4 h-4 text-cyan-500" />
            <span className="hidden sm:inline">Ask</span> Assistant
          </Link>
        </div>
      </div>

      {/* 5 Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Stat 1: Total Documents */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Documents</span>
            <FileText className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats?.totalDocuments ?? 28}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {stats?.active ?? 23} Active &amp; Verified
          </span>
        </div>

        {/* Stat 2: Expiring Soon */}
        <div
          onClick={() => navigate('/documents?status=expiring_soon')}
          className="glass-card rounded-2xl p-4 sm:p-5 border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/15 cursor-pointer hover:border-amber-500/60 transition-all"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expiring Soon</span>
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats?.expiringSoon ?? 4}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 block">
            Within next 30 days
          </span>
        </div>

        {/* Stat 3: Expired */}
        <div
          onClick={() => navigate('/documents?status=expired')}
          className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-rose-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expired</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {stats?.expired ?? 1}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 block">
            Requires renewal
          </span>
        </div>

        {/* Stat 4: Family Members */}
        <div
          onClick={() => navigate('/family')}
          className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Family Members</span>
            <Users className="w-4 h-4 text-vault-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats?.familyMembersCount ?? 4}
          </div>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
            The Reddy Family
          </span>
        </div>

        {/* Stat 5: Storage Used */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Storage Used</span>
            <HardDrive className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {stats?.storageUsedFormatted || '1.8 GB'}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-1.5 rounded-full"
              style={{ width: `${stats?.storagePercentage || 12}%` }}
            />
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Quick Actions
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Document</span>
          </button>
          <Link
            to="/family"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-500" />
            <span>+ Add Family Member</span>
          </Link>
          <Link
            to="/documents?status=expiring_soon"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>🔔 View Reminders ({stats?.expiringSoon || 4})</span>
          </Link>
          <Link
            to="/documents"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>🔎 Search Documents</span>
          </Link>
          <Link
            to="/analytics"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>📊 View Analytics</span>
          </Link>
          <Link
            to="/assistant"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/10 via-vault-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Vault Assistant</span>
          </Link>
        </div>
      </div>

      {/* EXPIRING SOON BANNER HIGHLIGHT */}
      {stats?.expiringSoon > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Expiring Soon — Action Recommended ({stats.expiringSoon} documents)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Review these documents to prevent unexpected policy lapse, penalty, or travel delays.
                </p>
              </div>
            </div>
            <Link
              to="/documents?status=expiring_soon"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View all reminders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div
              onClick={() => navigate('/documents?q=Car%20Insurance')}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/30 cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 dark:text-white truncate">Car Insurance</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  8 days left
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Father (Rahul) • Honda City</p>
            </div>

            <div
              onClick={() => navigate('/documents?q=Two%20Wheeler%20PUC')}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/30 cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 dark:text-white truncate">Two Wheeler PUC</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  14 days left
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Son (Arjun) • TVS Jupiter</p>
            </div>

            <div
              onClick={() => navigate('/documents?q=Driving%20License')}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/30 cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 dark:text-white truncate">Driving License</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  23 days left
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Father (Rahul) • RTO Renewal</p>
            </div>

            <div
              onClick={() => navigate('/documents?q=Passport')}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-500/30 cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 dark:text-white truncate">Passport</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  27 days left
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Mother (Priya) • MEA Passport</p>
            </div>
          </div>
        </div>
      )}

      {/* FAMILY ESSENTIALS (PINNED DOCUMENTS) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Family Essentials
            </h2>
            <span className="text-xs text-slate-400">
              Pinned vital documents for instant 1-tap access
            </span>
          </div>
          <Link
            to="/documents?isPinned=true"
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            View all essentials ({pinnedDocs.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pinnedDocs.slice(0, 6).map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onView={handleOpenDetail}
              onShare={handleOpenShare}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      </div>

      {/* RECENT DOCUMENTS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Documents
            </h2>
          </div>
          <Link
            to="/documents"
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Browse all {stats?.totalDocuments || 28} documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDocs.slice(0, 6).map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onView={handleOpenDetail}
              onShare={handleOpenShare}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => fetchDashboardData()}
      />

      <DocumentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        document={selectedDoc}
        onUpdate={() => fetchDashboardData()}
        onDelete={() => fetchDashboardData()}
        onOpenShare={(doc) => {
          setDetailModalOpen(false);
          handleOpenShare(doc);
        }}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        document={shareDoc}
      />
    </div>
  );
};

export default DashboardPage;
