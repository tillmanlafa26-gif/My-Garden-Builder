import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const hasSupabaseConfig = Boolean(
    supabaseUrl &&
    supabaseAnonKey
);

const supabase = hasSupabaseConfig
    ? createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    )
    : null;

export function getSupabase() {
    if (!supabase) {
        throw new Error(
            "Cloud sync is not configured. Add VITE_SUPABASE_URL and " +
            "VITE_SUPABASE_PUBLISHABLE_KEY to the environment."
        );
    }

    return supabase;
}

export { supabase };
