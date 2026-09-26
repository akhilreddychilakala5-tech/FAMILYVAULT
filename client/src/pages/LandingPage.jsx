import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  FolderOpen,
  Clock,
  Users,
  Search,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  FileText,
  Star,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LandingPage = () => {
  const { demoLogin, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await demoLogin();
      success('Welcome to The Reddy Family Vault Demo!', 'Demo Login Successful');
      navigate('/dashboard');
    } catch (err) {
      error('Demo login failed: ' + err.message);
    }
  };

  const trustCards = [
    {
      icon: Lock,
      title: 'Privacy-first access',
      desc: 'Users decide who can view or download each document with strict family-level boundaries.',
    },
    {
      icon: FolderOpen,
      title: 'Organized documents',
      desc: 'Automatically grouped by smart categories: IDs, Insurance, Bills, Warranties, Property, and Vehicle.',
    },
    {
      icon: Clock,
      title: 'Expiry reminders',
      desc: 'Automated 7, 15, 30, and 60-day alerts so your family never misses a critical renewal or deadline.',
    },
    {
      icon: Users,
      title: 'Family sharing',
      desc: 'Granular permissions: View-only, View+Download, or Manage with temporary QR access tokens.',
    },
    {
      icon: Search,
      title: 'Instant search',
      desc: 'Answer “Where is that document?” in seconds across names, policy numbers, categories, and tags.',
    },
    {
      icon: BarChart3,
      title: 'Document overview',
      desc: 'Real-time charts, storage tracking, and document health analytics for the whole family.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Create Your Vault',
      desc: 'Set up your secure family account in under a minute and invite your household members.',
    },
    {
      num: '02',
      title: 'Add Documents',
      desc: 'Upload IDs, insurance policies, certificates, property deeds, bills, and warranties via drag & drop.',
    },
    {
      num: '03',
      title: 'Organize Automatically',
      desc: 'Intelligent AI extracts document numbers, authorities, and expiration dates for your review.',
    },
    {
      num: '04',
      title: 'Stay Prepared',
      desc: 'Receive proactive alerts before documents expire and access emergency records anytime.',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-vault-600/10 to-indigo-600/15 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Brand Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 mb-6 animate-pulse-slow">
          <Shield className="w-3.5 h-3.5 text-cyan-500" />
          <span>FamilyVault — “Your family documents. Safe, organized, always ready.”</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Your Family’s Important Documents.{' '}
          <span className="bg-gradient-to-r from-cyan-500 via-vault-500 to-indigo-500 bg-clip-text text-transparent">
            One Secure Place.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Store, organize, search and track your family's important documents with expiry reminders and controlled family access.
        </p>

        {/* Call to Actions */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Go to Your Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Create Your Family Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500" />
                <span>Explore Live Vault</span>
              </button>
            </>
          )}
        </div>

        {/* Animated Dashboard Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto relative group">
          <div className="p-3 sm:p-5 rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-bold text-slate-400">
                  The Reddy Family Vault • 28 Verified Documents
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  🟢 23 Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  🟡 4 Expiring Soon
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  🔴 1 Expired
                </span>
              </div>
            </div>

            {/* Mock Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Documents</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">28</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Expiring Soon</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">4</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Family Members</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">4</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Storage Used</span>
                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">1.8 GB</div>
              </div>
            </div>

            {/* Mock Document Row Preview */}
            <div className="space-y-2 text-left">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    🏥
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Family Health Insurance Policy
                    </h5>
                    <p className="text-[10px] text-slate-400">Father (Rahul) • HDFC ERGO Cashless</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Active (185d)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                    🚗
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Car Insurance - Honda City
                    </h5>
                    <p className="text-[10px] text-slate-400">Father (Rahul) • ICICI Lombard</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 animate-pulse">
                  Expires in 8 days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                    🪪
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Aadhaar Card - Priya Reddy
                    </h5>
                    <p className="text-[10px] text-slate-400">Mother (Priya) • Government ID</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  No Expiry
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-100/60 dark:bg-navy-950/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
              Built for everyday family organization
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              “Never lose an important family document again.”
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Replace chaotic WhatsApp chats, messy camera rolls, and forgotten drawers with structured peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">
            Simple 4-Step Process
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How FamilyVault Works
          </h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            From chaos to instant family readiness in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div
              key={i}
              className="relative glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="text-3xl font-black text-cyan-500/20 dark:text-cyan-400/20 mb-3">
                {st.num}
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {st.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-vault-900 via-navy-850 to-vault-950 border border-cyan-500/30 shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to organize your family's records?
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Join thousands of families who never scramble looking for a passport, bill, or insurance document again.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
              >
                Create Your Free Vault
              </Link>
              <button
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>Explore Live Vault</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
