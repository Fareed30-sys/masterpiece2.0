import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && supabaseKey.length > 20) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(`[Supabase] Client initialized successfully for ${supabaseUrl}`);
  } catch (err) {
    console.warn(`[Supabase] Client init failed: ${err.message}`);
    supabase = null;
  }
} else {
  console.log('[Supabase] Ready for credentials. Add SUPABASE_URL and SUPABASE_KEY to server/.env to sync.');
}

export const isSupabaseConfigured = () => Boolean(supabase);

export const getSupabase = () => supabase;

export default supabase;
