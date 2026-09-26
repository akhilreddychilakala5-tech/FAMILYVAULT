import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Download,
  Clock,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Smartphone,
  Eye,
} from 'lucide-react';
import { shareApi } from '../services/api';
import { downloadFromUrl } from '../utils/fileDownload';

const SharedDocumentPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedDoc = async () => {
      try {
        setLoading(true);
        const res = await shareApi.getShareByToken(token);
        if (res.success) {
          setShareData(res);
        } else {
          setErrorMsg(res.message || 'Unable to open document.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'This share link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDoc();
  }, [token]);

  const handleDownload = async () => {
    if (!shareData?.document) return;
    try {
      setDownloading(true);
      const doc = shareData.document;
      const downloadEndpoint = `/api/shares/token/${token}/download`;
      const ext = doc.fileType?.includes('png') ? '.png' : doc.fileType?.includes('svg') ? '.svg' : '';
      const fallbackName = doc.name.includes('.') ? doc.name : `${doc.name}${ext}`;
      await downloadFromUrl(downloadEndpoint, fallbackName);
    } catch (err) {
      console.warn('Direct fallback download:', err);
      window.location.href = `/api/shares/token/${token}/download`;
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-xs text-slate-400">Verifying secure token access...</p>
      </div>
    );
  }

  if (errorMsg || !shareData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-8 max-w-md w-full text-center border border-rose-500/30">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
            Link Unavailable or Expired
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {errorMsg || 'This secure link is either invalid, reached its maximum allowed accesses, or has expired.'}
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 inline-block"
          >
            Go to FamilyVault Home
          </Link>
        </div>
      </div>
    );
  }

  const { document: doc, permission, expiresAt, accessCount, maxAccesses, sharedBy } = shareData;
  const canDownload = permission === 'view_download' || permission === 'manage';
  const isImage =
    doc.fileUrl?.endsWith('.svg') ||
    doc.fileUrl?.match(/\.(png|jpe?g|webp|gif)$/i) ||
    doc.fileType?.includes('svg') ||
    doc.fileType?.includes('image');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-vault-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              FamilyVault
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Secure Temporary Share
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Access</span>
        </div>
      </div>

      {/* Document Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                {doc.category}
              </span>
              <span className="text-xs text-slate-400">
                Shared by: <strong className="text-slate-700 dark:text-slate-300">{sharedBy}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {doc.name}
            </h1>
            {doc.documentNumber && (
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Reference: {doc.documentNumber}
              </p>
            )}
          </div>

          {canDownload && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Download File</span>
            </button>
          )}
        </div>

        {/* Security / Expiration Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Access Type
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
              {permission.replace('_', ' + ')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Expires On
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {new Date(expiresAt).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Access Count
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {accessCount} of {maxAccesses} views
            </span>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 p-3 sm:p-4 min-h-[360px] flex items-center justify-center">
          {isImage ? (
            <div className="flex flex-col items-center justify-center gap-4 py-2 w-full">
              <img
                src={doc.fileUrl}
                alt={doc.name}
                className="max-h-[500px] w-auto max-w-full object-contain rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2"
              />
              {canDownload && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>Save Full Resolution Image</span>
                  </button>
                  <a
                    href={`/api/shares/token/${token}/download`}
                    download
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    title="Direct browser download link"
                  >
                    Direct Link
                  </a>
                </div>
              )}
            </div>
          ) : (
            <iframe
              src={doc.fileUrl}
              title={doc.name}
              className="w-full h-[500px] rounded-xl border-0"
            />
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          🔐 This view link was issued securely via FamilyVault with cryptographic validation. No public files are permanently indexed.
        </p>
      </div>
    </div>
  );
};

export default SharedDocumentPage;
