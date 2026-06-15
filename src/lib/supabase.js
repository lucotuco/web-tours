import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Usamos el cliente preparado para SSR (Server-Side Rendering)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);