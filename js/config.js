// Public runtime config. Safe to commit:
//  - The Supabase anon key is a PUBLIC key (protected by Row Level Security).
//  - The Anthropic API key is NEVER here — it lives only as a Supabase secret,
//    used inside the Edge Function (see SETUP.md).
//
// Leave these blank to run in DEMO MODE (localStorage only, no auth, no Claude).
// Fill them in to enable Supabase auth, sync, and Claude observations.

window.RLP_CONFIG = {
  supabaseUrl: "https://zsviczmjbclyvwrwrrsz.supabase.co",
  supabaseAnonKey: "sb_publishable_WjEmqf6Ey9pTO7LVLnQSuQ_D2NNuW9d", // public publishable key
  edgeFunctionUrl: "https://zsviczmjbclyvwrwrrsz.supabase.co/functions/v1/claude",
};
