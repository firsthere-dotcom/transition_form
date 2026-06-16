// Backend interface — Supabase auth, DB sync, and Claude (via Edge Function).
//
// FRONTEND-FIRST PHASE: this is a stub. isConfigured() returns false, so the app
// runs entirely on localStorage and the reveal shows the graceful "unavailable"
// fallback for Claude observations. When you fill in config.js with your Supabase
// URL + anon key and deploy the Edge Function, flip these methods to real calls.
//
// The shapes here intentionally match storage.js so swapping in real persistence
// is a drop-in change, not a rewrite.

window.Backend = {
  _client: null,

  isConfigured() {
    return !!(window.RLP_CONFIG && window.RLP_CONFIG.supabaseUrl && window.RLP_CONFIG.supabaseAnonKey);
  },

  // Lazily create the Supabase client once @supabase/supabase-js is loaded and
  // config is present. Returns null in demo mode.
  client() {
    if (!this.isConfigured()) return null;
    if (this._client) return this._client;
    if (!window.supabase || !window.supabase.createClient) {
      console.warn("supabase-js not loaded");
      return null;
    }
    this._client = window.supabase.createClient(
      window.RLP_CONFIG.supabaseUrl,
      window.RLP_CONFIG.supabaseAnonKey
    );
    return this._client;
  },

  async signInWithGoogle() {
    const c = this.client();
    if (!c) return;
    await c.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href.split("#")[0] },
    });
  },

  async signOut() {
    const c = this.client();
    if (c) await c.auth.signOut();
  },

  // ---- DB sync (no-ops until configured) ----
  async syncResponses(/* db */) {
    if (!this.isConfigured()) return; // demo: localStorage already persisted
    // TODO (backend phase): upsert exercise_responses rows for the current user.
  },

  // ---- Claude via Edge Function ----
  async _callEdge(action, payload) {
    if (!this.isConfigured() || !window.RLP_CONFIG.edgeFunctionUrl) return null;
    const res = await fetch(window.RLP_CONFIG.edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.RLP_CONFIG.supabaseAnonKey}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) throw new Error("Edge function error " + res.status);
    const data = await res.json();
    return data.text || null;
  },

  // Returns a string of 3-4 observations, or null on failure (-> graceful fallback).
  async revealObservations(moduleSlug, payload) {
    try {
      return await this._callEdge("reveal", { moduleSlug, ...payload });
    } catch (e) {
      console.warn("revealObservations failed", e);
      return null;
    }
  },

  async reflectionObservations(exerciseSlug, payload) {
    try {
      return await this._callEdge("reflection", { exerciseSlug, ...payload });
    } catch (e) {
      console.warn("reflectionObservations failed", e);
      return null;
    }
  },
};
