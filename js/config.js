// Public runtime config. Safe to commit:
//  - The Supabase anon key is a PUBLIC key (protected by Row Level Security).
//  - The Anthropic API key is NEVER here — it lives only as a Supabase secret,
//    used inside the Edge Function (see SETUP.md).
//
// Leave these blank to run in DEMO MODE (localStorage only, no auth, no Claude).
// Fill them in to enable Supabase auth, sync, and Claude observations.

window.RLP_CONFIG = {
  supabaseUrl: "", // e.g. "https://abcd1234.supabase.co"
  supabaseAnonKey: "", // public anon key from Supabase project settings
  edgeFunctionUrl: "", // e.g. "https://abcd1234.supabase.co/functions/v1/claude"
};
