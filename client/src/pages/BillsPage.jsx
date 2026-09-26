import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Trash2,
  IndianRupee,
  X,
  Loader2,
} from 'lucide-react';
import { billApi, documentApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const BillsPage = () => {
  const { success, error } = useToast();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Form Fields
  const [provider, setProvider] = useState('');
  const [billType, setBillType] = useState('electricity');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await billApi.getBills();
      if (res.success) {
        setBills(res.bills || []);
      }
    } catch (err) {
      error('Failed to load bills: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    documentApi.getDocuments({ category: 'Bills' }).then((res) => {
      if (res.success) setDocuments(res.documents || []);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!provider || !amount || !dueDate) {
      error('Please provide provider, amount, and due date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await billApi.createBill({
        provider,
        billType,
        amount: Number(amount),
        dueDate,
        notes,
        documentId: documentId || null,
      });

      if (res.success) {
        success('Bill registered successfully!');
        setAddModalOpen(false);
        setProvider('');
        setAmount('');
        setDueDate('');
        setNotes('');
        setDocumentId('');
        fetchBills();
      }
    } catch (err) {
      error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (bill) => {
    const nextStatus = bill.status === 'paid' ? 'due_soon' : 'paid';
    try {
      const res = await billApi.updateStatus(bill._id, nextStatus);
      if (res.success) {
        success(res.message);
        fetchBills();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this bill record?')) {
      try {
        await billApi.deleteBill(id);
        success('Bill record removed.');
        fetchBills();
      } catch (err) {
        error(err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          🟢 Paid
        </span>
      );
    }
    if (status === 'overdue') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30">
          🔴 Overdue
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30 animate-pulse">
        🟡 Due Soon
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Utility Manager
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Family Bill Organizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track electricity, water, gas, broadband, and recurring family utility obligations
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-vault-600 hover:from-rose-400 hover:to-vault-500 text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Bill</span>
        </button>
      </div>

      {/* Bills Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading bills...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No Bills Tracked Yet
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Track due dates, monthly statement amounts, and archive payment receipts in FamilyVault.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white"
          >
            Add Your First Bill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((b) => (
            <div
              key={b._id}
              className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 capitalize">
                    {b.billType}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
                  {b.provider}
                </h3>

                <div className="text-2xl font-black text-slate-900 dark:text-white my-3 flex items-center">
                  <span>₹{b.amount.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Due Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(b.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {b.notes && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {b.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    b.status === 'paid'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{b.status === 'paid' ? 'Mark Due' : 'Mark as Paid'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {b.documentId?.fileUrl && (
                    <a
                      href={b.documentId.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-cyan-500 p-1"
                      title="View Bill"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bill Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add Utility Bill
                  </h3>
                  <p className="text-xs text-slate-500">Track amount &amp; due dates</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service Provider *
                </label>
                <input
                  type="text"
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. BESCOM Electricity, Airtel Fiber"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bill Type *
                  </label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="electricity">Electricity</option>
                    <option value="internet">Internet / WiFi</option>
                    <option value="mobile">Mobile Postpaid</option>
                    <option value="gas">Piped Gas / PNG</option>
                    <option value="water">Water Utility</option>
                    <option value="maintenance">Society Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="2840"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link Vault Bill Document
                </label>
                <select
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">None / Attach later</option>
                  {documents.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Auto-pay configured via credit card..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
