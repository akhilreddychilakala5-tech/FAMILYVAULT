import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Tag,
  Star,
  LifeBuoy,
  FileCheck,
  Shield,
  Loader2,
} from 'lucide-react';
import { documentApi, aiApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { members } = useAuth();
  const { success, error, info } = useToast();

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractionDone, setExtractionDone] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Identity');
  const [memberId, setMemberId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    // Validate format
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(selectedFile.type)) {
      error('Please select a PDF, JPG, JPEG, PNG, or WEBP document.');
      return;
    }

    // Validate size (15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      error('File size exceeds the 15MB limit.');
      return;
    }

    setFile(selectedFile);

    // Create preview url if image
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }

    // Default name from filename
    const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setName(cleanName);

    // Auto-select first member if empty
    if (!memberId && members.length > 0) {
      setMemberId(members[0]._id);
    }

    // Run Smart Document Extraction
    runSmartExtraction(selectedFile, cleanName);
  };

  const runSmartExtraction = async (fileObj, title) => {
    setIsAnalyzing(true);
    setExtractionDone(false);

    try {
      const formData = new FormData();
      formData.append('file', fileObj);
      const selectedMember = members.find((m) => m._id === memberId);
      if (selectedMember) {
        formData.append('memberName', selectedMember.name);
      }

      const res = await aiApi.extractMetadata(formData);

      if (res.success && res.extraction) {
        const ext = res.extraction;
        setName(ext.documentType || title);
        if (ext.category) setCategory(ext.category);
        if (ext.documentNumber) setDocumentNumber(ext.documentNumber);
        if (ext.issuingAuthority) setIssuingAuthority(ext.issuingAuthority);
        if (ext.issueDate) setIssueDate(ext.issueDate);
        if (ext.expiryDate) setExpiryDate(ext.expiryDate);
        if (ext.tags && Array.isArray(ext.tags)) setTags(ext.tags.join(', '));

        setExtractionDone(true);
        info(res.message, 'Smart Extraction Complete');
      }
    } catch (err) {
      console.warn('AI Extraction error:', err.message);
      info('AI analysis is temporarily unavailable. You can enter details manually.', 'Manual Review');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      error('Please select a document file to upload.');
      return;
    }

    if (!name.trim()) {
      error('Please enter a document title.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('category', category);
      formData.append('memberId', memberId || (members[0] ? members[0]._id : ''));
      formData.append('documentNumber', documentNumber);
      formData.append('issuingAuthority', issuingAuthority);
      if (issueDate) formData.append('issueDate', issueDate);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      formData.append('tags', tags);
      formData.append('notes', notes);
      formData.append('isPinned', isPinned);
      formData.append('isEmergency', isEmergency);

      const res = await documentApi.uploadDocument(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success) {
        success('Document uploaded and safely archived in FamilyVault!', 'Upload Successful');
        if (onUploadSuccess) onUploadSuccess(res.document);
        handleClose();
      }
    } catch (err) {
      error(err.message || 'Something went wrong while uploading your document. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFilePreview(null);
    setName('');
    setCategory('Identity');
    setDocumentNumber('');
    setIssuingAuthority('');
    setIssueDate('');
    setExpiryDate('');
    setNotes('');
    setTags('');
    setIsPinned(false);
    setIsEmergency(false);
    setExtractionDone(false);
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Upload to FamilyVault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Securely store, organize, and track your family document
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Dropzone */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-cyan-500/50 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Drag and drop your document here
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                or <span className="text-cyan-600 dark:text-cyan-400 underline font-semibold">browse files</span> from your computer
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span>PDF, JPG, JPEG, PNG, WEBP</span>
                <span>•</span>
                <span>Max 15MB</span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl p-4 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 overflow-hidden">
              {/* Scanner Line Animation while AI analyzing */}
              {isAnalyzing && <div className="scanner-beam" />}

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                  </p>
                  {isAnalyzing && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold animate-pulse mt-0.5">
                      <Sparkles className="w-3 h-3" />
                      Analyzing document &amp; extracting details...
                    </span>
                  )}
                  {extractionDone && !isAnalyzing && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      AI Extracted — Please review details below
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold p-2"
              >
                Change File
              </button>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Form Fields: Editable Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Driving License, Health Insurance"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Identity">🪪 Identity</option>
                <option value="Insurance">🏥 Insurance</option>
                <option value="Education">🎓 Education</option>
                <option value="Property">🏠 Property</option>
                <option value="Vehicle">🚗 Vehicle</option>
                <option value="Financial">💳 Financial</option>
                <option value="Bills">🧾 Bills</option>
                <option value="Warranty">🛠 Warranty</option>
                <option value="Other">📄 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Family Member *
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document / Policy Number
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. DL-042022019842"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Issuing Authority / Provider
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. RTO, HDFC ERGO, UIDAI"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Issue Date (Optional)
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Travel, Urgent, Tax"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key notes, location of physical paper, or policy conditions..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Checkboxes: Pin & Emergency */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <Star className="w-4 h-4 text-amber-500" />
              <span>Pin to Family Essentials (Top of Dashboard)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <LifeBuoy className="w-4 h-4 text-rose-500" />
              <span>Mark for Emergency Access Vault</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Document...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Save to FamilyVault</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
