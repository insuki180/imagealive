import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Add type assertions to avoid TS errors if they are somehow missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Check your .env.local file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
