import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
  User,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const DESTINATIONS = [
  { id: 'International Travel (General)', label: 'International Travel (Standard 6-Month Rule)' },
  { id: 'Schengen Area (Europe)', label: 'Schengen Area / Europe (Strict 3-Month + Insurance)' },
  { id: 'United States & Canada', label: 'United States & Canada (Passport & Visa Checklist)' },
  { id: 'Southeast Asia / Gulf', label: 'Southeast Asia & Gulf (Visa-on-Arrival / E-Visa)' },
  { id: 'Domestic Travel (India)', label: 'Domestic Travel (Aadhaar / Voter ID Only)' },
];

const TravelReadinessModal = ({ isOpen, onClose, onUploadDocument }) => {
  const { error } = useToast();
  const [destination, setDestination] = useState(DESTINATIONS[0].id);
  const [loading, setLoading] = useState(false);
  const [readiness, setReadiness] = useState(null);

  const fetchReadiness = async (dest) => {
    setLoading(true);
    try {
      const res = await aiApi.checkTravelReadiness(dest || destination);
      if (res.success && res.readiness) {
        setReadiness(res.readiness);
      }
    } catch (err) {
      error('Failed to evaluate travel readiness: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReadiness(destination);
    }
  }, [isOpen]);

  const handleDestinationChange = (newDest) => {
    setDestination(newDest);
    fetchReadiness(newDest);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  AI Travel Clearance
                </span>
                <span className="text-xs text-slate-400">• 6-Month Rule Audit</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Family Travel &amp; Mission Readiness
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="mb-5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Select Destination Protocol
          </label>
          <select
            value={destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            {DESTINATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
            <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-500">
              Evaluating family passports, validity windows, and insurance policies...
            </span>
          </div>
        )}

        {!loading && readiness && (
          <div className="space-y-6">
            {/* Score & Overview Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-850 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                    readiness.readinessPercent >= 85
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : readiness.readinessPercent >= 60
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span className="text-xl leading-none">{readiness.readinessPercent}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Ready</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Trip Status: {readiness.status}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated against international immigration standards and statutory airline carrier requirements.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onUploadDocument) onUploadDocument();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
              >
                <span>Upload Missing Docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Global Alerts */}
            {readiness.globalAlerts && readiness.globalAlerts.length > 0 && (
              <div className="space-y-2">
                {readiness.globalAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Member Evaluations */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Family Member Clearance Breakdown
              </span>

              <div className="grid grid-cols-1 gap-3">
                {readiness.memberEvaluations?.map((member) => (
                  <div
                    key={member.memberId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {member.avatar || member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {member.name}
                          </h4>
                          <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {member.relationship}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {member.checks?.map((chk, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          {chk.severity === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : chk.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">
                              {chk.name}:
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {chk.message}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelReadinessModal;
