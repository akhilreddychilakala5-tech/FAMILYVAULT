import React from 'react';
import {
  FileText,
  Shield,
  Heart,
  Car,
  Home,
  GraduationCap,
  Receipt,
  Award,
  CreditCard,
  FileCheck,
  Star,
  AlertTriangle,
  Clock,
  Share2,
  Download,
  Trash2,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

const categoryMeta = {
  Identity: { icon: Shield, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  Insurance: { icon: Heart, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  Vehicle: { icon: Car, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  Property: { icon: Home, bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  Education: { icon: GraduationCap, bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  Bills: { icon: Receipt, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  Warranty: { icon: Award, bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  Financial: { icon: CreditCard, bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  Other: { icon: FileCheck, bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
};

const DocumentCard = ({
  document,
  onView,
  onShare,
  onDownload,
  onDelete,
  onTogglePin,
}) => {
  const cat = categoryMeta[document.category] || categoryMeta.Other;
  const CategoryIcon = cat.icon;

  const now = new Date();
  let daysRemaining = null;
  if (document.expiryDate) {
    daysRemaining = Math.ceil((new Date(document.expiryDate) - now) / (1000 * 60 * 60 * 24));
  }

  const getStatusBadge = () => {
    if (!document.expiryDate) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          ⚪ No Expiry
        </span>
      );
    }
    if (daysRemaining < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          🔴 Expired ({Math.abs(daysRemaining)}d ago)
        </span>
      );
    }
    if (daysRemaining <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
          🟡 Expiring Soon ({daysRemaining}d left)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        🟢 Active
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '450 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden">
      {/* Top badges bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cat.bg}`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{document.category}</span>
          </span>

          <div className="flex items-center gap-1">
            {document.isEmergency && (
              <span
                title="Marked for Emergency Access Vault"
                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1"
              >
                <LifeBuoy className="w-3 h-3 text-rose-500" />
                <span className="hidden sm:inline">Emergency</span>
              </span>
            )}
            <button
              onClick={() => onTogglePin && onTogglePin(document._id)}
              className={`p-1.5 rounded-lg transition-colors ${
                document.isPinned
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={document.isPinned ? 'Pinned to Essentials' : 'Pin to Essentials'}
            >
              <Star className={`w-4 h-4 ${document.isPinned ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Document Number */}
        <h3
          onClick={() => onView(document)}
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer transition-colors leading-snug line-clamp-1 mb-1"
        >
          {document.name}
        </h3>

        {document.documentNumber ? (
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 truncate">
            {document.documentNumber}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 italic">
            Official Family Record
          </p>
        )}

        {/* Member and status pill */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-vault-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {document.memberId?.avatar ? (
                <img
                  src={document.memberId.avatar}
                  alt={document.memberId.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                document.memberId?.name?.charAt(0) || 'F'
              )}
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {document.memberId?.name || 'Family Member'}
            </span>
          </div>

          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {/* Footer Info & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="text-[11px] font-medium">
          {formatFileSize(document.fileSize)}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onShare(document)}
            title="Generate Temporary Access QR / Link"
            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDownload(document)}
            title="Download Document"
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onView(document)}
            title="Inspect Details"
            className="p-1.5 rounded-lg text-slate-500 hover:text-vault-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(document)}
            title="Delete Document"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
