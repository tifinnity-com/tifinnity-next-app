import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if both values are available
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase environment variables are missing. Authentication will not work in production.');
  
  // Create a mock client for development that doesn't throw errors
  supabase = {
    auth: {
      signInWithPassword: async () => {
        return { error: null, data: { user: null, session: null } };
      },
      signUp: async () => {
        return { error: null, data: { user: null, session: null } };
      }
    }
  };
}

export { supabase }