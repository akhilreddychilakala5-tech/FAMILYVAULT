import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { familyApi, documentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocumentCard from '../components/DocumentCard';
import DocumentDetailModal from '../components/DocumentDetailModal';
import ShareModal from '../components/ShareModal';

const FamilyPage = () => {
  const { family, refreshFamily } = useAuth();
  const { success, error } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Member for "Member's Vault" View
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDocs, setMemberDocs] = useState([]);
  const [memberStats, setMemberStats] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Add Member Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Son');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Document action modals
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const res = await familyApi.getFamily();
      if (res.success) {
        setMembers(res.members || []);
      }
    } catch (err) {
      error('Failed to load family members: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const openMemberVault = async (member) => {
    setSelectedMember(member);
    setMemberLoading(true);
    try {
      const res = await familyApi.getMemberById(member._id);
      if (res.success) {
        setMemberDocs(res.documents || []);
        setMemberStats(res.stats || {});
      }
    } catch (err) {
      error('Failed to open member vault: ' + err.message);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      error('Please enter the family member’s name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await familyApi.addMember({
        name: newMemberName.trim(),
        relationship: newMemberRelation,
        role: newMemberRole,
        email: newMemberEmail.trim(),
        permissions: {
          canUpload: newMemberRole !== 'viewer',
          canDownload: true,
          canDelete: newMemberRole === 'owner',
        },
      });

      if (res.success) {
        success(`${newMemberName} has been added to the family vault!`);
        setNewMemberName('');
        setNewMemberEmail('');
        setAddModalOpen(false);
        fetchFamilyMembers();
        refreshFamily();
      }
    } catch (err) {
      error(err.message || 'Failed to add family member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (member, e) => {
    e.stopPropagation();
    if (member.relationship === 'Self') {
      error('Cannot remove the primary vault owner.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to remove ${member.name}? Their documents will be safely transferred to the primary vault owner.`
      )
    ) {
      try {
        await familyApi.deleteMember(member._id);
        success(`${member.name} removed. Documents safely retained.`);
        if (selectedMember?._id === member._id) {
          setSelectedMember(null);
        }
        fetchFamilyMembers();
        refreshFamily();
      } catch (err) {
        error(err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Household Access Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {family?.name || 'The Reddy Family'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage family members, individual vaults, and privacy-first sharing permissions
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-vault-600 hover:from-cyan-400 hover:to-vault-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Family Member</span>
        </button>
      </div>

      {/* MEMBER'S VAULT DETAIL VIEW (If a member was clicked) */}
      {selectedMember ? (
        <div className="space-y-6 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMember(null)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Members</span>
            </button>
            <span className="text-xs text-slate-400">
              Viewing Individual Vault
            </span>
          </div>

          {/* Member Banner Card */}
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-vault-700 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-cyan-500/20">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedMember.name}’s Vault
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 capitalize">
                    {selectedMember.relationship}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Access Role: <strong className="capitalize">{selectedMember.role}</strong> • {selectedMember.email || 'No separate email assigned'}
                </p>
              </div>
            </div>

            {/* Member Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {memberStats?.totalDocuments ?? memberDocs.length}
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block">Expiring</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {memberStats?.expiringSoon ?? 0}
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Active</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {memberStats?.active ?? memberDocs.length}
                </span>
              </div>
            </div>
          </div>

          {/* Member's Documents List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Documents Registered to {selectedMember.name}
            </h3>

            {memberLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading documents...</div>
            ) : memberDocs.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-xs text-slate-400">
                No documents currently registered under {selectedMember.name}. Upload a new document to assign it to them.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {memberDocs.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onView={(d) => {
                      setSelectedDoc(d);
                      setDetailModalOpen(true);
                    }}
                    onShare={(d) => {
                      setShareDoc(d);
                      setShareModalOpen(true);
                    }}
                    onDownload={async (d) => {
                      await documentApi.downloadDocument(d._id);
                      window.open(d.fileUrl, '_blank');
                    }}
                    onDelete={async (d) => {
                      if (window.confirm(`Delete "${d.name}"?`)) {
                        await documentApi.deleteDocument(d._id);
                        openMemberVault(selectedMember);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL FAMILY MEMBERS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <div
              key={member._id}
              onClick={() => openMemberVault(member)}
              className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-cyan-500/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 capitalize">
                    {member.relationship}
                  </span>
                  {member.relationship !== 'Self' && (
                    <button
                      onClick={(e) => handleDeleteMember(member, e)}
                      title="Remove Member"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-vault-700 text-white flex items-center justify-center text-xl font-black mb-4 shadow-md group-hover:scale-105 transition-transform">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                  {member.relationship} • {member.role}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {member.documentCount ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Documents</span>
                </div>

                {member.expiringSoonCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {member.expiringSoonCount} expiring
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Up-to-date
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add Family Member
                  </h3>
                  <p className="text-xs text-slate-500">Assign document ownership</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Priya Reddy"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship *
                  </label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vault Role *
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="member">Member (View &amp; Upload)</option>
                    <option value="viewer">Viewer (View Only)</option>
                    <option value="owner">Co-Owner (Full Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@family.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Action Modals */}
      <DocumentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        document={selectedDoc}
        onUpdate={() => {
          if (selectedMember) openMemberVault(selectedMember);
          fetchFamilyMembers();
        }}
        onDelete={() => {
          if (selectedMember) openMemberVault(selectedMember);
          fetchFamilyMembers();
        }}
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

export default FamilyPage;
