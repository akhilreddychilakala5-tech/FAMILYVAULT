import React from 'react';
import { Shield, Lock, Heart, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-navy-950/60 backdrop-blur-md transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Security & Privacy Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-vault-500/5 to-indigo-500/10 border border-cyan-500/20 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  “Your documents belong to you.”
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  FamilyVault is designed with privacy-first access controls so users can decide who can view their documents.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-cyan-500/30">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span>Family-Controlled Permissions</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">FamilyVault</span>
            <span>— “One secure place for everything your family needs.”</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/documents" className="hover:text-cyan-500 transition-colors">
              Vault Documents
            </Link>
            <span>•</span>
            <Link to="/warranties" className="hover:text-cyan-500 transition-colors">
              WarrantyTracker
            </Link>
            <span>•</span>
            <Link to="/bills" className="hover:text-cyan-500 transition-colors">
              Bill Organizer
            </Link>
            <span>•</span>
            <span>© 2026 FamilyVault. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
