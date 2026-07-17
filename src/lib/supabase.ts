import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabaseKey = supabasePublishableKey || supabaseAnonKey;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

export const supabase =
  hasSupabaseConfig
    ? createClient(supabaseUrl, supabaseKey)
    : null;
