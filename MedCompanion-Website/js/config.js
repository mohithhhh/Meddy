// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., https://xxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// AI Backend Configuration
const AI_BACKEND_URL = 'http://localhost:8000';

// Initialize Supabase client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// Export for use in other files
window.supabaseClient = supabase;
window.AI_BACKEND_URL = AI_BACKEND_URL;
