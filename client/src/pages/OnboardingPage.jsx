import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  FolderOpen,
  Bell,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OnboardingPage = () => {
  const { user, family, completeOnboarding } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Family Name
  const [familyName, setFamilyName] = useState(family?.name || 'The Reddy Family');

  // Step 2: Family Members
  const [members, setMembers] = useState([
    { name: user?.name || 'Rahul Reddy', relationship: 'Father', role: 'owner' },
    { name: 'Priya Reddy', relationship: 'Mother', role: 'member' },
    { name: 'Arjun Reddy', relationship: 'Son', role: 'member' },
    { name: 'Ananya Reddy', relationship: 'Daughter', role: 'viewer' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Son');

  // Step 3: Commonly Managed Documents
  const [selectedDocTypes, setSelectedDocTypes] = useState([
    'IDs',
    'Insurance',
    'Education',
    'Property',
    'Vehicle',
    'Bills',
    'Warranties',
  ]);

  // Step 4: Reminder Preference
  const [reminderDays, setReminderDays] = useState([7, 15, 30, 60]);

  const docOptions = [
    { id: 'IDs', label: '🪪 Government IDs', desc: 'Aadhaar, Passport, PAN, Driving License' },
    { id: 'Insurance', label: '🏥 Insurance Policies', desc: 'Health, Life, Motor, Home' },
    { id: 'Education', label: '🎓 Educational Records', desc: 'Degrees, Diplomas, Marksheets' },
    { id: 'Property', label: '🏠 Property Deeds', desc: 'Sale deeds, Tax receipts, Agreements' },
    { id: 'Vehicle', label: '🚗 Vehicle Documents', desc: 'RC, Insurance, PUC' },
    { id: 'Bills', label: '🧾 Utility Bills', desc: 'Electricity, Gas, Broadband' },
    { id: 'Warranties', label: '🛠 Product Warranties', desc: 'Appliances, Electronics, Invoices' },
  ];

  const reminderOptions = [
    { days: 7, label: '7 days before' },
    { days: 15, label: '15 days before' },
    { days: 30, label: '30 days before' },
    { days: 60, label: '60 days before' },
  ];

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    setMembers([
      ...members,
      { name: newMemberName.trim(), relationship: newMemberRelation, role: 'member' },
    ]);
    setNewMemberName('');
  };

  const handleRemoveMember = (idx) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const toggleDocType = (id) => {
    if (selectedDocTypes.includes(id)) {
      setSelectedDocTypes(selectedDocTypes.filter((d) => d !== id));
    } else {
      setSelectedDocTypes([...selectedDocTypes, id]);
    }
  };

  const toggleReminder = (days) => {
    if (reminderDays.includes(days)) {
      setReminderDays(reminderDays.filter((d) => d !== days));
    } else {
      setReminderDays([...reminderDays, days]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        familyName,
        members,
        reminderDays,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      success('FamilyVault configured successfully! Enjoy complete peace of mind.', 'Setup Complete');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                  step < currentStep
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : step === currentStep
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-4 ring-cyan-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-1 mx-1.5 rounded-full transition-colors ${
                    step < currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Step {currentStep} of 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              “Let's build your FamilyVault.”
            </h2>
          </div>

          {/* STEP 1: Family Name */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-md mx-auto">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  What would you like to call your family vault? This organizes all members and shared records.
                </p>
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Family Vault Name
                  </label>
                  <input
                    type="text"
                    required
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. The Reddy Family"
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    Example: <span className="text-cyan-500 font-medium">The Reddy Family</span> or <span className="text-cyan-500 font-medium">Sharma Household Vault</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Family Members */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md mx-auto">
                Add household members so documents can be neatly organized by owner.
              </p>

              {/* Members List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {members.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {m.relationship} • {m.role}
                        </span>
                      </div>
                    </div>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Member Row */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Member Name (e.g. Priya)"
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <select
                  value={newMemberRelation}
                  onChange={(e) => setNewMemberRelation(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Commonly Managed Documents */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md mx-auto">
                Select document types your family frequently manages to preconfigure your dashboard filters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {docOptions.map((doc) => {
                  const selected = selectedDocTypes.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocType(doc.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selected
                          ? 'border-cyan-500 bg-cyan-500/10 text-slate-900 dark:text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs mt-0.5 shrink-0 transition-colors ${
                          selected
                            ? 'bg-cyan-500 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold">{doc.label}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {doc.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Reminder Preference */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200 text-center max-w-md mx-auto">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When should FamilyVault notify you before a document expires?
              </p>

              <div className="grid grid-cols-2 gap-3">
                {reminderOptions.map((opt) => {
                  const selected = reminderDays.includes(opt.days);
                  return (
                    <div
                      key={opt.days}
                      onClick={() => toggleReminder(opt.days)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selected
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          selected ? 'bg-cyan-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-700 dark:text-cyan-300 text-left flex items-start gap-2">
                <Bell className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>
                  Reminders appear automatically in your notification center and dashboard alert pills.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-200/80 dark:border-slate-800/80 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-7 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Family Vault</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
