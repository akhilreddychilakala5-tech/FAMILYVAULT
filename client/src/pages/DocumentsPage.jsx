import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Upload,
  Grid,
  List,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Star,
  LifeBuoy,
  Users,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Plus,
} from 'lucide-react';
import { documentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocumentCard from '../components/DocumentCard';
import DocumentUploadModal from '../components/DocumentUploadModal';
import DocumentDetailModal from '../components/DocumentDetailModal';
import ShareModal from '../components/ShareModal';
import { downloadFromUrl } from '../utils/fileDownload';

const categories = [
  'All',
  'Identity',
  'Insurance',
  'Education',
  'Property',
  'Vehicle',
  'Financial',
  'Bills',
  'Warranty',
  'Other',
];

const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { members } = useAuth();
  const { success, error } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter States from URL or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedMember, setSelectedMember] = useState(searchParams.get('memberId') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [isPinnedOnly, setIsPinnedOnly] = useState(searchParams.get('isPinned') === 'true');
  const [isEmergencyOnly, setIsEmergencyOnly] = useState(searchParams.get('isEmergency') === 'true');
  const [sortBy, setSortBy] = useState('-createdAt');

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    if (searchParams.get('status')) setSelectedStatus(searchParams.get('status'));
    if (searchParams.get('q')) setSearchQuery(searchParams.get('q'));
    if (searchParams.get('isPinned')) setIsPinnedOnly(searchParams.get('isPinned') === 'true');
    if (searchParams.get('isEmergency')) setIsEmergencyOnly(searchParams.get('isEmergency') === 'true');
  }, [searchParams]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedMember !== 'All') params.memberId = selectedMember;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (isPinnedOnly) params.isPinned = 'true';
      if (isEmergencyOnly) params.isEmergency = 'true';
      if (sortBy) params.sort = sortBy;

      const res = await documentApi.getDocuments(params);
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      error('Failed to load documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, selectedMember, selectedStatus, isPinnedOnly, isEmergencyOnly, sortBy]);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      error(err.message);
    }
  };

  const handleDelete = async (doc) => {
    if (window.confirm(`Are you sure you want to permanently delete "${doc.name}"?`)) {
      try {
        await documentApi.deleteDocument(doc._id);
        success('Document deleted successfully.');
        fetchDocuments();
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
        fetchDocuments();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMember('All');
    setSelectedStatus('All');
    setIsPinnedOnly(false);
    setIsEmergencyOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Family Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and manage all records stored in your vault
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Upload className="w-4 h-4" />
          <span>+ Upload Document</span>
        </button>
      </div>

      {/* Search & Quick Filter Controls */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Real Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, document number, authority, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Member Filter Dropdown */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Family Members</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.relationship})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="-createdAt">Recently Uploaded</option>
              <option value="expiryDate">Expiry: Soonest First</option>
              <option value="-expiryDate">Expiry: Furthest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? '📁 All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status & Flag Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedStatus('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'All'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'active'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              🟢 Active
            </button>
            <button
              onClick={() => setSelectedStatus('expiring_soon')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'expiring_soon'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              🟡 Expiring Soon
            </button>
            <button
              onClick={() => setSelectedStatus('expired')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'expired'
                  ? 'bg-rose-500 text-white'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              🔴 Expired
            </button>
            <button
              onClick={() => setSelectedStatus('no_expiry')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'no_expiry'
                  ? 'bg-slate-500 text-white'
                  : 'text-slate-500 hover:bg-slate-500/10'
              }`}
            >
              ⚪ No Expiry
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinnedOnly((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                isPinnedOnly
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isPinnedOnly ? 'fill-amber-500' : ''}`} />
              <span>Essentials Only</span>
            </button>

            <button
              onClick={() => setIsEmergencyOnly((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                isEmergencyOnly
                  ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
              <span>Emergency Vault</span>
            </button>

            {(searchQuery ||
              selectedCategory !== 'All' ||
              selectedMember !== 'All' ||
              selectedStatus !== 'All' ||
              isPinnedOnly ||
              isEmergencyOnly) && (
              <button
                onClick={clearFilters}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline px-2"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Documents Grid / List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No Documents Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            No documents matched your current search filters. Try clearing filters or upload a new record.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white"
            >
              Upload Document
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
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
      ) : (
        /* List View */
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div
                onClick={() => handleOpenDetail(doc)}
                className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-cyan-500 transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {doc.category} • {doc.memberId?.name || 'Family'} • {doc.documentNumber || 'No Ref Number'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="text-slate-500 dark:text-slate-400">
                  {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'No Expiry'}
                </span>
                <button
                  onClick={() => handleOpenShare(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => fetchDocuments()}
      />

      <DocumentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        document={selectedDoc}
        onUpdate={() => fetchDocuments()}
        onDelete={() => fetchDocuments()}
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

export default DocumentsPage;
