import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Clock,
  Car,
  Award,
  Home,
  Compass,
  ArrowRight,
  Shield,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocumentDetailModal from '../components/DocumentDetailModal';
import ShareModal from '../components/ShareModal';

const promptChips = [
  'Which documents expire this month?',
  "Show my father's vehicle documents",
  'Which warranties expire soon?',
  'Do we have the property documents?',
  'What documents should I prepare before travelling?',
];

const VaultAssistantPage = () => {
  const { user, family } = useAuth();
  const { error } = useToast();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.name || 'Rahul'}! I am your **Vault Assistant**.\n\nI have securely indexed all **28 documents** for **${family?.name || 'The Reddy Family'}**. You can ask me natural questions about document expirations, vehicle files, warranties, or travel preparations.`,
      suggestions: promptChips,
      matchedDocs: [],
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiApi.askVaultAssistant(textToSend.trim());
      if (res.success && res.result) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.result.answer,
          matchedDocs: res.result.matchedDocuments || [],
          suggestions: res.result.suggestions || [],
          provider: res.result.provider,
          isDemo: res.result.isDemo,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      error('Failed to communicate with Vault Assistant: ' + err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'I ran into an issue accessing your family records. Please verify server connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200 min-h-[85vh] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Vault AI Assistant
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Context-Aware Family Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            FamilyVault Intelligent Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
          <Shield className="w-4 h-4" />
          <span>Real Family Metadata Only</span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-h-[60vh]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`max-w-xl sm:max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-vault-600 text-white rounded-br-xs'
                  : 'glass-panel border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
              }`}
            >
              {/* Bot Icon Tag */}
              {m.sender === 'bot' && (
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    <Bot className="w-4 h-4" />
                    <span>Vault Assistant</span>
                  </div>
                  {m.provider && (
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                      {m.provider}
                    </span>
                  )}
                </div>
              )}

              {/* Message text with basic markdown formatting */}
              <div className="whitespace-pre-wrap font-normal">
                {m.text.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-sm font-bold my-1 text-slate-900 dark:text-white">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return <p key={idx} className="ml-2 my-0.5">{line}</p>;
                  }
                  return <p key={idx} className="my-0.5">{line}</p>;
                })}
              </div>

              {/* Matched Documents Grid */}
              {m.matchedDocs && m.matchedDocs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Vault Documents Found:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.matchedDocs.map((doc) => (
                      <div
                        key={doc._id}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setDetailModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {doc.category} • {doc.memberName || 'Family Member'}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-w-xl">
                {m.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700/60 transition-colors text-left"
                  >
                    💬 {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-4">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            <span>Scanning family records &amp; generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Box */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about expiries, insurance, vehicle papers, or travel..."
            className="w-full pl-4 pr-12 py-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-md"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-vault-600 text-white disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Document Action Modals */}
      <DocumentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        document={selectedDoc}
        onOpenShare={(doc) => {
          setDetailModalOpen(false);
          setShareDoc(doc);
          setShareModalOpen(true);
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

export default VaultAssistantPage;
