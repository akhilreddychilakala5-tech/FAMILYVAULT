import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  Shield,
  Download,
  Share2,
  Trash2,
  Star,
  LifeBuoy,
  Sparkles,
  ExternalLink,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCode,
  MessageSquare,
  Send,
  Copy,
  Check,
  FileSignature,
  HelpCircle,
} from 'lucide-react';
import { documentApi, aiApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { downloadFromUrl } from '../utils/fileDownload';

const DocumentDetailModal = ({
  isOpen,
  onClose,
  document: doc,
  onUpdate,
  onDelete,
  onOpenShare,
}) => {
  const { success, error, info } = useToast();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState(doc?.aiSummary || null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'preview' | 'summary' | 'qa' | 'drafter'

  // Q&A State
  const [qaInput, setQaInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  // AI Drafter State
  const [letterType, setLetterType] = useState(
    doc?.category === 'Warranty'
      ? 'warranty_claim'
      : doc?.category === 'Insurance'
      ? 'insurance_renewal'
      : 'address_change'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  if (!isOpen || !doc) return null;

  const now = new Date();
  let daysRemaining = null;
  if (doc.expiryDate) {
    daysRemaining = Math.ceil((new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24));
  }

  const getStatusBadge = () => {
    if (!doc.expiryDate) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          ⚪ No Expiry
        </span>
      );
    }
    if (daysRemaining < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          🔴 Expired ({Math.abs(daysRemaining)} days ago)
        </span>
      );
    }
    if (daysRemaining <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
          🟡 Expiring Soon ({daysRemaining} days left)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        🟢 Active
      </span>
    );
  };

  const handleDownload = async () => {
    try {
      await documentApi.downloadDocument(doc._id);
      const ext = doc.fileType?.includes('png') ? '.png' : doc.fileType?.includes('svg') ? '.svg' : '';
      const fallbackName = doc.name.includes('.') ? doc.name : `${doc.name}${ext}`;
      await downloadFromUrl(doc.fileUrl, fallbackName);
      success(`Downloading ${doc.name}...`);
    } catch (err) {
      error('Failed to download document: ' + err.message);
    }
  };

  const handleTogglePin = async () => {
    try {
      const res = await documentApi.togglePin(doc._id);
      if (res.success) {
        success(res.message);
        if (onUpdate) onUpdate({ ...doc, isPinned: res.isPinned });
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleToggleEmergency = async () => {
    try {
      const res = await documentApi.toggleEmergency(doc._id);
      if (res.success) {
        success(res.message);
        if (onUpdate) onUpdate({ ...doc, isEmergency: res.isEmergency });
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await aiApi.summarizeDocument(doc._id);
      if (res.success && res.summary) {
        setSummary(res.summary);
        setActiveTab('summary');
        success('AI Document Summary generated successfully!', 'Summary Ready');
      }
    } catch (err) {
      error('Failed to generate AI summary: ' + err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAskQuestion = async (q) => {
    const questionText = q || qaInput;
    if (!questionText || !questionText.trim()) return;

    setIsAsking(true);
    try {
      const res = await aiApi.askDocument(doc._id, questionText.trim());
      if (res.success && res.answer) {
        setQaHistory((prev) => [
          ...prev,
          {
            question: questionText.trim(),
            answer: res.answer.answer,
            snippet: res.answer.keySnippet,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setQaInput('');
      }
    } catch (err) {
      error('Failed to get answer: ' + err.message);
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsDrafting(true);
    try {
      const res = await aiApi.draftLetter(doc._id, letterType, customNotes);
      if (res.success && res.draft) {
        setDraftResult(res.draft);
        success('Official letter draft created!', 'AI Drafter');
      }
    } catch (err) {
      error('Failed to draft letter: ' + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyDraft = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(`${draftResult.subject}\n\n${draftResult.content}`);
    setCopiedDraft(true);
    success('Letter draft copied to clipboard!');
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[94vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {doc.category}
                </span>
                {getStatusBadge()}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug truncate">
                {doc.name}
              </h2>
              {doc.documentNumber && (
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Ref: {doc.documentNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTogglePin}
              title={doc.isPinned ? 'Remove from Essentials' : 'Pin to Essentials'}
              className={`p-2 rounded-xl transition-colors ${
                doc.isPinned
                  ? 'text-amber-500 bg-amber-500/15'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-5 h-5 ${doc.isPinned ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={handleToggleEmergency}
              title={doc.isEmergency ? 'Remove from Emergency Vault' : 'Mark for Emergency Vault'}
              className={`p-2 rounded-xl transition-colors ${
                doc.isEmergency
                  ? 'text-rose-500 bg-rose-500/15'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LifeBuoy className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'details'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'preview'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Digital Preview
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>AI Summary</span>
            {summary && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
            <span>Ask Document</span>
          </button>
          <button
            onClick={() => setActiveTab('drafter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'drafter'
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5 text-vault-500" />
            <span>AI Drafter</span>
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Family Member
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {doc.memberId?.name?.charAt(0) || 'F'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {doc.memberId?.name || 'Family Member'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Issuing Authority
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {doc.issuingAuthority || 'Government / Verified Entity'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Expiry Date
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'Permanent / No Expiry'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Issue Date
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Vault Storage ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {doc.storageId || 'LOCAL-VAULT-' + doc._id.toString().slice(-6)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Archived On
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Document Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {doc.notes && (
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Notes &amp; Physical Location
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {doc.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Digital Preview */}
        {activeTab === 'preview' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 min-h-[380px] flex flex-col items-center justify-center p-2 relative">
            {doc.fileUrl.endsWith('.svg') || doc.fileType?.includes('svg') || doc.fileType?.includes('image') ? (
              <img
                src={doc.fileUrl}
                alt={doc.name}
                className="max-h-[460px] w-auto object-contain rounded-xl shadow-md"
              />
            ) : (
              <iframe
                src={doc.fileUrl}
                title={doc.name}
                className="w-full h-[460px] rounded-xl border-0"
              />
            )}
          </div>
        )}

        {/* Tab 3: AI Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {!summary ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5">
                <Sparkles className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Generate Intelligent AI Document Summary
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  Extracts an executive overview, vital dates, policy numbers, legal terms, and actionable reminders from this document.
                </p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-md shadow-cyan-500/20 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Summarize Document</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">
                    What This Document Is
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {summary.whatIsIt}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                      Important Dates
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {summary.importantDates?.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-cyan-500" />
                      Important Numbers
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
                      {summary.importantNumbers?.map((n, i) => (
                        <li key={i}>• {n}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {summary.keyTerms && summary.keyTerms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Terms &amp; Conditions
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {summary.keyTerms.map((term, i) => (
                        <li key={i}>• {term}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.actionsRequired && summary.actionsRequired.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Actions Required
                    </span>
                    <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      {summary.actionsRequired.map((act, i) => (
                        <li key={i}>• {act}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 italic text-center">
                  ⚠️ AI-generated summary — verify important information against the original document.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Ask This Document */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  Single-Document Intelligence Q&amp;A
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ask targeted questions directly about <span className="font-semibold text-slate-700 dark:text-slate-300">"{doc.name}"</span>. The AI analyzes its category, validity, extracted text, and claim protocols.
                </p>
              </div>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center mr-1">
                Suggested:
              </span>
              {[
                'When does this expire or need renewal?',
                doc.category === 'Insurance' ? 'How to make a cashless claim?' : 'How to file a warranty claim?',
                'What is the policy or registration number?',
                'Who is the registered owner of this record?',
                'What coverage or damage terms apply?',
              ].map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskQuestion(pill)}
                  disabled={isAsking}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700/60 transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Q&A Chat Feed */}
            <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80">
              {qaHistory.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <HelpCircle className="w-8 h-8 mb-2 opacity-40 text-cyan-500" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    No questions asked yet for this document.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click a suggested prompt above or type your question below.
                  </p>
                </div>
              ) : (
                qaHistory.map((item, i) => (
                  <div key={i} className="space-y-2">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-tr-sm bg-gradient-to-r from-cyan-500 to-vault-600 text-white text-xs font-medium shadow-sm">
                        {item.question}
                      </div>
                    </div>
                    {/* AI Answer */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" />
                          <span>Vault AI Analysis</span>
                          <span className="text-slate-400 ml-auto font-normal">{item.time}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed">
                          {item.answer}
                        </div>
                        {item.snippet && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">VERIFIED FIELD</span>
                            <span>{item.snippet}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isAsking && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                    <span>Analyzing document records...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                placeholder="Ask about deductible, expiry, coverage, claim steps..."
                disabled={isAsking}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                type="submit"
                disabled={isAsking || !qaInput.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white disabled:opacity-40 flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: AI Document Drafter */}
        {activeTab === 'drafter' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-vault-500/10 border border-vault-500/20 flex items-start gap-3">
              <FileSignature className="w-5 h-5 text-vault-600 dark:text-vault-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  Automated Formal Correspondence Drafter
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Generate ready-to-dispatch letters for warranty repairs, policy renewal inquiries, or residential KYC address changes using this document's metadata.
                </p>
              </div>
            </div>

            {/* Letter Type Selection */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Correspondence Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'warranty_claim', label: '🛠 Warranty Repair Claim', desc: 'Manufacturer service request' },
                  { id: 'insurance_renewal', label: '🛡 Insurance Renewal & NCB', desc: 'Preserve NCB & query terms' },
                  { id: 'address_change', label: '📍 Address Update (KYC)', desc: 'Official residency amendment' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLetterType(type.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      letterType === type.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-slate-900 dark:text-white ring-1 ring-cyan-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-0.5">{type.label}</span>
                    <span className="text-[10px] text-slate-400 block">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes / Specific Defect */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Custom Details or Defect Description (Optional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={
                  letterType === 'warranty_claim'
                    ? 'e.g. Device display flickering intermittently after 20 minutes of usage...'
                    : letterType === 'insurance_renewal'
                    ? 'e.g. Requesting quote for increasing sum insured to 10 Lakhs...'
                    : 'e.g. New address: Flat 402, Green Valley Apartments, Mumbai 400001...'
                }
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
              />
            </div>

            {/* Draft Trigger */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={isDrafting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-vault-600 to-cyan-600 hover:from-vault-500 hover:to-cyan-500 text-white shadow-md shadow-vault-600/20 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Constructing Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Official Correspondence</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Draft Display */}
            {draftResult && (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Official Document Draft
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyDraft}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1 transition-colors"
                      >
                        {copiedDraft ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Letter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject:</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{draftResult.subject}</p>
                  </div>

                  <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {draftResult.content}
                  </pre>

                  {draftResult.checklist && draftResult.checklist.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                        Dispatch Checklist:
                      </span>
                      <ul className="space-y-1">
                        {draftResult.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenShare(doc)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share (QR Code)</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete "${doc.name}" from your vault?`)) {
                  onDelete(doc);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailModal;
