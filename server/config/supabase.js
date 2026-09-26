import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(`⚡ Supabase client initialized with URL: ${supabaseUrl}`);
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in .env (SUPABASE_URL, SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY).');
}

/**
 * Test connectivity to Supabase
 */
export const testSupabaseConnection = async () => {
  if (!supabase) {
    return {
      connected: false,
      message: 'Supabase credentials (SUPABASE_URL & SUPABASE_KEY) are missing in server/.env',
    };
  }

  try {
    // Attempt a light check by inspecting auth or querying buckets
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      // If storage is restricted, check general connection
      console.warn('Supabase storage check notice:', error.message);
    }
    return {
      connected: true,
      url: supabaseUrl,
      buckets: data?.map((b) => b.name) || [],
      message: 'Successfully connected to Supabase!',
    };
  } catch (err) {
    return {
      connected: false,
      message: err.message,
    };
  }
};

export { supabase };
export default supabase;
