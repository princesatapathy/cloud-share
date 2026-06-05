import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    // Don't crash the whole app (white screen) when env vars are missing —
    // e.g. on a preview deploy without Supabase vars configured.
    console.error(
        'Supabase env vars missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
        'Uploads will not work until these are set for this environment.'
    );
}

// Fall back to a harmless placeholder so createClient() doesn't throw at import time.
export const supabase = createClient(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder-anon-key'
);
