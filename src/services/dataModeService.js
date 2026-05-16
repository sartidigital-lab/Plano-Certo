import { getDataMode, hasSupabaseConfig, supabase } from '../lib/supabaseClient.js';

export function getRuntimeDataMode() {
  return {
    mode: getDataMode(),
    hasSupabaseConfig,
    supabase,
  };
}
