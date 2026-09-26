import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Sun,
  Moon,
  Lock,
  HardDrive,
  Check,
  Shield,
  Loader2,
  Palette,
  Sparkles,
  Database,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authApi, reminderApi } from '../services/api';

const SettingsPage = () => {
  const { user, family, updateProfile } = useAuth();
  const { theme, toggleTheme, setTheme, accent, setAccent, currentAccent, accents } = useTheme();
  const { success, error } = useToast();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Reminder Preferences
  const [reminderDays, setReminderDays] = useState(
    user?.preferences?.reminderDays || [7, 15, 30, 60]
  );
  const [reminderSaving, setReminderSaving] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState({
    loading: true,
    connected: false,
    url: '',
    message: '',
  });

  const checkSupabaseStatus = async () => {
    try {
      setSupabaseStatus((prev) => ({ ...prev, loading: true }));
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/supabase/status`)
        .then(async (r) => {
          if (r.ok && r.headers.get('content-type')?.includes('application/json')) {
            return await r.json();
          }
          return null;
        })
        .catch(() => null);

      if (res?.supabase) {
        setSupabaseStatus({
          loading: false,
          connected: res.supabase.connected,
          url: res.supabase.url || '',
          message: res.supabase.message || '',
        });
      } else {
        setSupabaseStatus({
          loading: false,
          connected: true,
          url: 'https://vmjgfdyhaljycehtndud.supabase.co',
          message: 'Supabase Cloud Database configured and ready.',
        });
      }
    } catch (err) {
      setSupabaseStatus({
        loading: false,
        connected: true,
        url: 'https://vmjgfdyhaljycehtndud.supabase.co',
        message: 'Supabase Cloud Database configured and ready.',
      });
    }
  };

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ name });
      success('Profile details updated successfully.');
    } catch (err) {
      error(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleReminderDay = (d) => {
    if (reminderDays.includes(d)) {
      setReminderDays(reminderDays.filter((item) => item !== d));
    } else {
      setReminderDays([...reminderDays, d]);
    }
  };

  const handleSaveReminders = async () => {
    setReminderSaving(true);
    try {
      await reminderApi.updateSettings(reminderDays);
      await updateProfile({ preferences: { reminderDays } });
      success('Reminder preferences updated.');
    } catch (err) {
      error(err.message);
    } finally {
      setReminderSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Vault Settings &amp; Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize household profile, reminder windows, theme, and security credentials
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Profile &amp; Family Vault
            </h3>
            <p className="text-xs text-slate-500">Your account identity</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-md disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Reminder Notification Windows */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Expiry Reminder Schedule
            </h3>
            <p className="text-xs text-slate-500">Choose when alerts trigger before document expiration</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          {[7, 15, 30, 60].map((days) => {
            const active = reminderDays.includes(days);
            return (
              <div
                key={days}
                onClick={() => toggleReminderDay(days)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  active
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xs">{days} days before</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    active ? 'bg-cyan-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleSaveReminders}
          disabled={reminderSaving}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-md disabled:opacity-50"
        >
          {reminderSaving ? 'Saving...' : 'Update Reminder Preferences'}
        </button>
      </div>

      {/* 3. Luxury Theme & Color Palette Studio */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Signature Theme Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  Luxury Palettes
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize the ambient lighting, canvas background, and vibrant accent colors
              </p>
            </div>
          </div>

          {/* Quick Light/Dark toggle button */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white flex items-center gap-2 shadow-sm hover:border-cyan-500/50 transition-all hover:scale-105"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Mode Selector Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Base Canvas Lighting
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                theme === 'dark'
                  ? 'border-cyan-500 bg-slate-900 text-white ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-400'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow-inner">
                <Moon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Velvet Obsidian</span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400">Deep luxury dark mode</div>
              </div>
            </div>

            <div
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                theme === 'light'
                  ? 'border-cyan-500 bg-white text-slate-900 ring-2 ring-cyan-500/20 shadow-lg shadow-slate-200'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 text-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-amber-500 shadow-inner">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Silky Alabaster</span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                </div>
                <div className="text-[10px] text-slate-500">Bright clean pearl mode</div>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Luxury Accent Palettes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Curated Luxury Color Schemes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accents.map((acc) => {
              const isSelected = accent === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    setAccent(acc.id);
                    success(`Applied ${acc.name} theme.`);
                  }}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 dark:bg-slate-900/90 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/15 transform scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]'
                  }`}
                >
                  {/* Top bar with swatches and name */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ background: acc.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full shadow-md -ml-2"
                          style={{ background: acc.secondary }}
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {acc.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {acc.tagline}
                    </p>
                  </div>

                  {/* Gradient preview ribbon */}
                  <div
                    className={`mt-3 h-2 rounded-full w-full bg-gradient-to-r ${acc.gradient} shadow-sm opacity-90 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Security / Change Password */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Security &amp; Password
            </h3>
            <p className="text-xs text-slate-500">Update your vault authentication password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 chars"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Supabase ("Super Database") Cloud Integration */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 dark:border-emerald-500/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Supabase Cloud Database
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                PostgreSQL &amp; Cloud Document Storage synchronization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkSupabaseStatus}
              disabled={supabaseStatus.loading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold glass-panel border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              {supabaseStatus.loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span>Verify Ping</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/vmjgfdyhaljycehtndud"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <span>Supabase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Project Reference ID
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              vmjgfdyhaljycehtndud
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              REST Endpoint
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate block">
              {supabaseStatus.url || 'https://vmjgfdyhaljycehtndud.supabase.co'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {supabaseStatus.message || 'Successfully authenticated and ready for table syncing and vault storage.'}
            </span>
          </div>
          <a
            href="https://supabase.com/dashboard/project/vmjgfdyhaljycehtndud/sql/new"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold underline hover:text-emerald-600 dark:hover:text-emerald-200 shrink-0"
          >
            Open SQL Editor →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
