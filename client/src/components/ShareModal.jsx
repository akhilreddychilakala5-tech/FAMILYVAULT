import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  QrCode,
  Copy,
  Check,
  Shield,
  Clock,
  Eye,
  Download,
  SlidersHorizontal,
  Loader2,
  Smartphone,
  Wifi,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { shareApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { downloadFromUrl } from '../utils/fileDownload';

const ShareModal = ({ isOpen, onClose, document: doc }) => {
  const { success, error } = useToast();

  const [permission, setPermission] = useState('view_download');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [maxAccesses, setMaxAccesses] = useState('20');
  const [qrTarget, setQrTarget] = useState('download'); // 'download' (default for fast scanning) or 'page'
  const [networkOptions, setNetworkOptions] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingQr, setIsUpdatingQr] = useState(false);
  const [shareResult, setShareResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load network IP options on open
  useEffect(() => {
    if (!isOpen) return;

    const loadNetwork = async () => {
      try {
        const res = await shareApi.getNetworkOptions();
        const data = res?.options ? res : (res?.data || {});
        if (data.options?.length > 0) {
          setNetworkOptions(data.options);
          setSelectedOrigin(data.defaultUrl || window.location.origin);
        } else {
          setSelectedOrigin(window.location.origin || 'http://localhost:5173');
        }
      } catch (err) {
        setSelectedOrigin(window.location.origin || 'http://localhost:5173');
      }
    };

    loadNetwork();
  }, [isOpen]);

  if (!isOpen || !doc) return null;

  const handleGenerateShare = async (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await shareApi.createShare({
        documentId: doc._id,
        permission,
        expiresInDays: Number(expiresInDays),
        maxAccesses: Number(maxAccesses),
        clientOrigin: selectedOrigin || window.location.origin,
        qrTarget,
      });

      const data = res?.share ? res : (res?.data || {});
      if (data.success && data.share) {
        setShareResult(data.share);
        success('Secure sharing QR code & link generated!', 'Ready to Scan');
      } else {
        error(data.message || 'Failed to generate share link.');
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to generate share link.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-generate QR when target or origin is switched
  const handleRegenerate = async (newTarget, newOrigin) => {
    if (!shareResult?.token) return;
    setIsUpdatingQr(true);
    try {
      const res = await shareApi.regenerateQrCode({
        token: shareResult.token,
        origin: newOrigin || selectedOrigin || window.location.origin,
        qrTarget: newTarget || qrTarget,
      });

      const data = res?.qrCodeDataUrl ? res : (res?.data || {});
      if (data.success) {
        setShareResult((prev) => ({
          ...prev,
          qrCodeDataUrl: data.qrCodeDataUrl,
          targetUrl: data.targetUrl,
          shareUrl: data.shareUrl,
          downloadUrl: data.downloadUrl,
          qrTarget: data.qrTarget,
          baseOrigin: data.baseOrigin,
        }));
        success('QR Code updated!', 'Refreshed');
      }
    } catch (err) {
      error('Failed to update QR code.');
    } finally {
      setIsUpdatingQr(false);
    }
  };

  const handleCopy = () => {
    const urlToCopy = shareResult?.targetUrl || shareResult?.shareUrl;
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    success('Link copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQrImage = () => {
    if (!shareResult?.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = shareResult.qrCodeDataUrl;
    a.download = `FamilyVault_QR_${doc.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('QR Code image saved to Downloads.');
  };

  const handleTestDownloadDoc = async () => {
    try {
      const ext = doc.fileType?.includes('png') ? '.png' : doc.fileType?.includes('svg') ? '.svg' : '';
      const fallbackName = doc.name.includes('.') ? doc.name : `${doc.name}${ext}`;
      await downloadFromUrl(doc.fileUrl, fallbackName);
      success(`Downloading ${doc.name}...`);
    } catch (err) {
      error(err.message);
    }
  };

  const handleClose = () => {
    setShareResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Share &amp; Mobile Scan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan with phone camera to download image or view document
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Document Info */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 mb-5 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {doc.name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Category: {doc.category} • Holder: {doc.memberId?.name || 'Family Member'}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
            Encrypted
          </span>
        </div>

        {!shareResult ? (
          <form onSubmit={handleGenerateShare} className="space-y-4">
            {/* Access Permission */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Access Permission Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPermission('view_download')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    permission === 'view_download'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Download className="w-4 h-4 mb-1" />
                  <div className="text-xs font-bold">View + Download</div>
                  <div className="text-[10px] text-slate-500">Allows downloading image</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPermission('view_only')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    permission === 'view_only'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Eye className="w-4 h-4 mb-1" />
                  <div className="text-xs font-bold">View Only</div>
                  <div className="text-[10px] text-slate-500">Read in browser only</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPermission('manage')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    permission === 'manage'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 mb-1" />
                  <div className="text-xs font-bold">Full Access</div>
                  <div className="text-[10px] text-slate-500">Admin manage</div>
                </button>
              </div>
            </div>

            {/* QR Code Action: Direct Download vs Web Page */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>When scanned with phone camera:</span>
                <span className="text-[10px] font-normal text-cyan-600 dark:text-cyan-400">
                  {qrTarget === 'download' ? '⚡ Instant Download Mode' : '🌐 Mobile Web Page Mode'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQrTarget('download')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    qrTarget === 'download'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Download className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
                  <div>
                    <div className="text-xs font-bold">Direct Image Download</div>
                    <div className="text-[10px] text-slate-500">Scanning immediately downloads the file</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQrTarget('page')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    qrTarget === 'page'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
                  <div>
                    <div className="text-xs font-bold">Open Web Viewer</div>
                    <div className="text-[10px] text-slate-500">Opens document view with download button</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Network / Host Selection */}
            {networkOptions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Network Access (For Mobile Phone Camera)</span>
                </label>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {networkOptions.map((opt) => (
                    <option key={opt.url} value={opt.url}>
                      {opt.label} {opt.recommended ? '— Recommended for Scanning' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <span>✨ Universal Public Access: Anyone on any phone (4G/5G or any Wi-Fi) can scan and download immediately.</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expiration Window
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="1">24 Hours (1 Day)</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days (Recommended)</option>
                  <option value="30">30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Access Limit
                </label>
                <select
                  value={maxAccesses}
                  onChange={(e) => setMaxAccesses(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="5">5 Views / Downloads</option>
                  <option value="20">20 Views / Downloads</option>
                  <option value="50">50 Views / Downloads</option>
                  <option value="100">100 Views</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guard:</strong> Never creates permanent public URLs. The share automatically terminates when the limit or expiry date is reached.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating QR Code &amp; Key...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Generate Share Link &amp; QR Code</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Live QR Target Switch */}
            <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQrTarget('download');
                  handleRegenerate('download', selectedOrigin);
                }}
                disabled={isUpdatingQr}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  qrTarget === 'download'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instant Download</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setQrTarget('page');
                  handleRegenerate('page', selectedOrigin);
                }}
                disabled={isUpdatingQr}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  qrTarget === 'page'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Web Viewer Page</span>
              </button>
            </div>

            {/* QR Code Frame */}
            <div className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-md max-w-[240px] mx-auto">
              {isUpdatingQr && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl z-10">
                  <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
                  <span className="text-[10px] font-bold text-slate-700 mt-1">Updating QR...</span>
                </div>
              )}
              {shareResult.qrCodeDataUrl && (
                <img
                  src={shareResult.qrCodeDataUrl}
                  alt="Document QR Code"
                  className="w-48 h-48 object-contain"
                />
              )}
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>{qrTarget === 'download' ? 'Scans to Download File' : 'Scans to View Document'}</span>
              </div>
            </div>

            {/* Action Buttons: Download QR & Test File Download */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleDownloadQrImage}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Download this QR code as a PNG image"
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>Download QR Code Image</span>
              </button>

              <button
                onClick={handleTestDownloadDoc}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Test downloading the actual document image now"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Test File Download</span>
              </button>
            </div>

            {/* Link Box */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <input
                type="text"
                readOnly
                value={shareResult.targetUrl || shareResult.shareUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none px-2 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shrink-0 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Network Switch dropdown if needed */}
            {networkOptions.length > 1 && (
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[11px] text-slate-400">Host / IP:</span>
                <select
                  value={selectedOrigin}
                  onChange={(e) => {
                    const newOrig = e.target.value;
                    setSelectedOrigin(newOrig);
                    handleRegenerate(qrTarget, newOrig);
                  }}
                  className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300"
                >
                  {networkOptions.map((opt) => (
                    <option key={opt.url} value={opt.url}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Permissions
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {shareResult.permission.replace('_', ' + ')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Expires On
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {new Date(shareResult.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2 text-left">
              <Smartphone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Universal Mobile Download:</strong> Any user with any phone (on cellular 4G/5G, hotspot, or any Wi-Fi) can scan the QR code above to download the file directly. No local network connection required!
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
