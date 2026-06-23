import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Add it to your .env file: NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Add it to your .env file: NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
