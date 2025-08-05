import { createClient } from '@supabase/supabase-js';

/**
 * Initialise a browser‑side Supabase client.  The anonymous key only
 * grants access to the tables/functions that you expose through RLS.  Do not
 * include the service role key on the client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);