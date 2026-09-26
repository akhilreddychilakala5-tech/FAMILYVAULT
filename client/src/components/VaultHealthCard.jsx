import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plane,
  Upload,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { aiApi } from '../services/api';

const VaultHealthCard = ({ onOpenUpload, onOpenTravelChecker }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);

  const fetchHealthAudit = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getVaultHealth();
      if (res.success && res.audit) {
        setAudit(res.audit);
      }
    } catch (err) {
      console.error('Failed to load vault health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAudit();
  }, []);

  if (loading && !audit) {
    return (
      <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Auditing vault resilience &amp; coverage gaps...</span>
      </div>
    );
  }

  if (!audit) return null;

  const isExcellent = audit.score >= 85;
  const isWarning = audit.score >= 60 && audit.score < 85;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
      {/* Background ambient glow */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isExcellent ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
        }`}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isExcellent
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : isWarning
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}
          >
            {isExcellent ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Vault Intelligence Doctor
              </span>
              <span className="text-[11px] text-slate-400">• Continuous AI Audit</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Family Vault Resilience &amp; Gap Analysis
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTravelChecker && onOpenTravelChecker()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Plane className="w-4 h-4" />
            <span>Check Travel Readiness</span>
          </button>
          <button
            onClick={fetchHealthAudit}
            title="Re-audit Vault"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Score Gauge + Gap Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Score Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-center">
          <div className="relative flex items-center justify-center w-28 h-28 mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  isExcellent
                    ? 'text-emerald-500'
                    : isWarning
                    ? 'text-amber-500'
                    : 'text-rose-500'
                }
                strokeDasharray={`${audit.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {audit.score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">/ 100</span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isExcellent
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : isWarning
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            {audit.grade}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Audited {audit.totalDocumentsEvaluated} documents across {audit.totalMembersEvaluated} family members.
          </p>
        </div>

        {/* Right Column: Identified Gaps & Protective Strengths */}
        <div className="lg:col-span-8 space-y-3">
          {/* Critical Gaps */}
          {audit.criticalGaps && audit.criticalGaps.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Actionable Coverage Gaps ({audit.criticalGaps.length})
              </span>
              <div className="space-y-2">
                {audit.criticalGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-rose-200/80 dark:border-rose-900/30 flex items-center justify-between gap-3 shadow-sm hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {gap.title}
                        </span>
                        <span className="text-[10px] font-bold text-rose-500">
                          {gap.impact} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {gap.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (gap.id === 'expired-docs') {
                          navigate('/documents?status=expired');
                        } else if (onOpenUpload) {
                          onOpenUpload();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <span>{gap.action}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Warnings */}
          {audit.warnings && audit.warnings.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Recommended Improvements ({audit.warnings.length})
              </span>
              <div className="space-y-2">
                {audit.warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                        {warn.title}:
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{warn.description}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (warn.id === 'expiring-soon') {
                          navigate('/documents?status=expiring_soon');
                        } else if (onOpenUpload) {
                          onOpenUpload();
                        }
                      }}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Fix</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positive notes */}
          {audit.positiveNotes && audit.positiveNotes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {audit.positiveNotes.map((note, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultHealthCard;
