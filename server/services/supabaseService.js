import { supabase } from '../config/supabase.js';

/**
 * Supabase Real-Time Vault Synchronization Service
 */
export const supabaseSyncService = {
  /**
   * Sync a document record to Supabase
   */
  async syncDocument(doc) {
    if (!supabase) return;
    try {
      const payload = {
        id: String(doc._id),
        family_id: String(doc.familyId?._id || doc.familyId || 'fam-1'),
        owner_id: String(doc.ownerId?._id || doc.ownerId || 'usr-1'),
        member_name: doc.memberId?.name || 'Family',
        name: doc.name,
        category: doc.category,
        document_number: doc.documentNumber || '',
        file_url: doc.fileUrl,
        file_type: doc.fileType || '',
        file_size: doc.fileSize || 0,
        tags: doc.tags || [],
        is_pinned: !!doc.isPinned,
        is_emergency: !!doc.isEmergency,
        status: doc.status || 'active',
        expiry_date: doc.expiryDate || null,
        created_at: doc.createdAt || new Date(),
      };

      const { data, error } = await supabase.from('documents').upsert(payload);
      if (error) {
        console.warn('⚠️ Supabase document sync notice:', error.message);
      } else {
        console.log(`✅ Synced document "${doc.name}" to Supabase`);
      }
    } catch (err) {
      console.warn('⚠️ Supabase document sync exception:', err.message);
    }
  },

  /**
   * Delete a document from Supabase
   */
  async deleteDocument(docId) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', String(docId));
      if (error) console.warn('⚠️ Supabase document delete notice:', error.message);
      else console.log(`🗑️ Removed document ${docId} from Supabase`);
    } catch (err) {
      console.warn('⚠️ Supabase document delete exception:', err.message);
    }
  },

  /**
   * Sync a share to Supabase
   */
  async syncShare(share) {
    if (!supabase) return;
    try {
      const payload = {
        id: String(share._id),
        document_id: String(share.documentId?._id || share.documentId),
        document_name: share.documentId?.name || 'Document',
        token: share.token,
        permission: share.permission || 'view_download',
        share_url: share.shareUrl,
        download_url: share.downloadUrl,
        expires_at: share.expiresAt,
        access_count: share.accessCount || 0,
        max_accesses: share.maxAccesses || 50,
      };

      const { error } = await supabase.from('shares').upsert(payload);
      if (error) console.warn('⚠️ Supabase share sync notice:', error.message);
      else console.log(`✅ Synced share ${share.token} to Supabase`);
    } catch (err) {
      console.warn('⚠️ Supabase share sync exception:', err.message);
    }
  },
};

export default supabaseSyncService;
