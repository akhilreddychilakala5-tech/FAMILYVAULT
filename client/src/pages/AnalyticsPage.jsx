import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  HardDrive,
  Shield,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const COLORS = [
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#64748b', // slate
];

const AnalyticsPage = () => {
  const { error } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        error('Failed to load analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading FamilyVault analytics...</p>
      </div>
    );
  }

  const { stats, categoryBreakdown = [], memberBreakdown = [], expiryTimeline = [] } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            Vault Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Document Analytics &amp; Health Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics, category distribution, member volume, and expiry forecast
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Vault Records
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalDocuments}
          </div>
          <span className="text-xs text-emerald-500 font-semibold mt-1 block">
            100% indexed in MongoDB
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
            Expiring in &le;30 Days
          </span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats.expiringSoon}
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 block">
            Automated alerts active
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Household Members
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.familyMembersCount}
          </div>
          <span className="text-xs text-cyan-500 font-semibold mt-1 block">
            4 individual vaults
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Storage Consumed
          </span>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {stats.storageUsedFormatted}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-1.5 rounded-full"
              style={{ width: `${stats.storagePercentage || 12}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Category Breakdown (Donut) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Documents by Category
              </h3>
              <p className="text-xs text-slate-500">Distribution across 9 vault classifications</p>
            </div>
            <PieIcon className="w-5 h-5 text-cyan-500" />
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            {categoryBreakdown.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600 dark:text-slate-300 truncate">
                  {c.name} ({c.count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Documents by Family Member (Bar Chart) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Documents by Family Member
              </h3>
              <p className="text-xs text-slate-500">Record volume held per household member</p>
            </div>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {memberBreakdown.map((m) => (
              <div key={m.name} className="text-center">
                <span className="font-bold text-slate-900 dark:text-white block">{m.count}</span>
                <span className="text-[10px] text-slate-400 capitalize">{m.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHART 3: Expiry Timeline Area Chart */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Expiry &amp; Renewal Timeline Forecast
            </h3>
            <p className="text-xs text-slate-500">Upcoming document expiration windows over the next cycles</p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-500" />
        </div>

        <div className="h-64 sm:h-80 w-full">
          {expiryTimeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No document expirations recorded in timeline window.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expiryTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="expiryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expiryGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
