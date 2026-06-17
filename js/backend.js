// Backend interface — Supabase auth, DB sync, and Claude (via Edge Function).
//
// Demo mode (config blank): isConfigured() is false, the app runs entirely on
// localStorage, and Claude observations show the graceful fallback.
//
// Live mode (config filled in js/config.js): real Google auth, data synced to
// Supabase, partner data loaded under the RLS policies in SETUP.md, and Claude
// observations via the Edge Function.
//
// Data shapes here mirror storage.js so the in-memory `db` is identical in both
// modes — app.js logic does not branch on mode except where noted.

window.Backend = {
  _client: null,

  isConfigured() {
    return !!(window.RLP_CONFIG && window.RLP_CONFIG.supabaseUrl && window.RLP_CONFIG.supabaseAnonKey);
  },

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

  // ---------------------------------------------------------------
  // AUTH + INITIAL LOAD
  // Called once from app.init(). Wires the auth listener and, if a session
  // already exists (e.g. after the OAuth redirect), loads everything into db.
  // Returns true if a live session is active, false otherwise (-> demo/signin).
  async initAuth(appCtx) {
    const c = this.client();
    if (!c) return false;

    c.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await this.onSignedIn(appCtx, session);
      } else if (event === "SIGNED_OUT") {
        appCtx.db = window.emptyDb();
        appCtx.db.settings.demoMode = false;
        appCtx.view = "signin";
      }
    });

    const { data } = await c.auth.getSession();
    if (data && data.session) {
      await this.onSignedIn(appCtx, data.session);
      return true;
    }
    return false;
  },

  async onSignedIn(appCtx, session) {
    const c = this.client();
    const authUser = session.user;
    // Start from a clean slate so any prior demo data can't leak into live mode.
    appCtx.db = window.emptyDb();
    appCtx.db.settings.demoMode = false;
    appCtx.db.session = { userId: authUser.id };
    appCtx.db.activeUserId = authUser.id;

    // Ensure a users row exists for this auth user.
    let me = await this._getUser(authUser.id);
    if (!me) {
      const { data, error } = await c
        .from("users")
        .insert({ id: authUser.id, email: authUser.email })
        .select()
        .single();
      if (error) console.warn("create user row failed", error);
      me = data || { id: authUser.id, email: authUser.email, couple_id: null, name: null };
    }
    appCtx.db.users = {};
    appCtx.db.users[me.id] = me;

    if (me.couple_id) {
      await this.loadAll(appCtx);
      appCtx.view = "dashboard";
    } else {
      appCtx.view = "onboarding";
    }
  },

  async _getUser(id) {
    const c = this.client();
    const { data } = await c.from("users").select("*").eq("id", id).maybeSingle();
    return data || null;
  },

  // Load couple, partner, responses, reveals, reflections, and partner done-flags
  // into appCtx.db. Safe to call repeatedly (full refresh).
  async loadAll(appCtx) {
    const c = this.client();
    const meId = appCtx.db.activeUserId;
    const me = appCtx.db.users[meId];
    if (!me || !me.couple_id) return;

    // couple
    const { data: couple } = await c.from("couples").select("*").eq("id", me.couple_id).maybeSingle();
    appCtx.db.couple = couple || null;

    // users in couple (me + partner)
    const { data: users } = await c.from("users").select("*").eq("couple_id", me.couple_id);
    appCtx.db.users = {};
    (users || []).forEach((u) => (appCtx.db.users[u.id] = u));

    // my + (post-reveal) partner responses
    appCtx.db.responses = {};
    const { data: responses } = await c.from("exercise_responses").select("*");
    (responses || []).forEach((r) => {
      appCtx.db.responses[window.responseKey(r.user_id, r.module, r.exercise_slug)] = {
        user_id: r.user_id,
        module: r.module,
        exercise_slug: r.exercise_slug,
        answers: r.answers || { required: {}, optional: {} },
        marked_done_at: r.marked_done_at,
        updated_at: r.updated_at,
      };
    });

    // partner done-flags (no answer text) for pre-reveal dashboard gating
    const { data: pstatus } = await c.rpc("partner_done_status");
    const partner = Object.values(appCtx.db.users).find((u) => u.id !== meId);
    if (partner && pstatus) {
      pstatus.forEach((row) => {
        const key = window.responseKey(partner.id, row.module, row.exercise_slug);
        if (!appCtx.db.responses[key]) {
          // stub: marks done without exposing answers
          appCtx.db.responses[key] = {
            user_id: partner.id,
            module: row.module,
            exercise_slug: row.exercise_slug,
            answers: { required: {}, optional: {} },
            marked_done_at: row.marked_done ? "pending" : null,
            updated_at: null,
          };
        }
      });
    }

    // reveals
    appCtx.db.reveals = {};
    const { data: reveals } = await c.from("reveals").select("*");
    (reveals || []).forEach((rv) => (appCtx.db.reveals[rv.module] = rv));

    // reflections
    appCtx.db.reflections = {};
    const { data: refls } = await c.from("post_reveal_reflections").select("*");
    (refls || []).forEach((rf) => (appCtx.db.reflections[rf.id] = rf));
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

  // ---------------------------------------------------------------
  // WRITES
  async createCouple(appCtx, name) {
    const c = this.client();
    // Atomic via RPC: inserts the couple and links the user in one step,
    // sidestepping the RLS chicken-and-egg (can't read a couple you don't yet belong to).
    const { error } = await c.rpc("create_couple", { p_name: name, p_birth_year: null });
    if (error) {
      console.warn("createCouple failed", error);
      throw error;
    }
    await this.loadAll(appCtx);
  },

  async joinCouple(appCtx, name, code) {
    const c = this.client();
    const meId = appCtx.db.activeUserId;
    await c.from("users").update({ name }).eq("id", meId);
    const { error } = await c.rpc("join_couple", { code: code });
    if (error) {
      console.warn("joinCouple failed", error);
      throw error;
    }
    await this.loadAll(appCtx);
  },

  async upsertResponse(appCtx, moduleSlug, exerciseSlug) {
    const c = this.client();
    const meId = appCtx.db.activeUserId;
    const r = appCtx.db.responses[window.responseKey(meId, moduleSlug, exerciseSlug)];
    if (!r) return;
    const { error } = await c.from("exercise_responses").upsert(
      {
        user_id: meId,
        couple_id: appCtx.db.couple.id,
        module: moduleSlug,
        exercise_slug: exerciseSlug,
        answers: r.answers,
        marked_done_at: r.marked_done_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module,exercise_slug" }
    );
    if (error) console.warn("upsertResponse failed", error);
  },

  async createReveal(appCtx, moduleSlug) {
    const c = this.client();
    const { data, error } = await c
      .from("reveals")
      .upsert(
        { couple_id: appCtx.db.couple.id, module: moduleSlug, revealed_at: new Date().toISOString() },
        { onConflict: "couple_id,module" }
      )
      .select()
      .single();
    if (error) console.warn("createReveal failed", error);
    return data;
  },

  async saveRevealObservation(appCtx, moduleSlug, text) {
    const c = this.client();
    await c.from("reveals").update({ claude_response: text }).eq("couple_id", appCtx.db.couple.id).eq("module", moduleSlug);
  },

  async insertReflection(appCtx, exerciseSlug, text) {
    const c = this.client();
    const { data, error } = await c
      .from("post_reveal_reflections")
      .insert({
        user_id: appCtx.db.activeUserId,
        couple_id: appCtx.db.couple.id,
        exercise_slug: exerciseSlug,
        reflection: text,
      })
      .select()
      .single();
    if (error) console.warn("insertReflection failed", error);
    return data;
  },

  async saveReflectionObservation(reflectionId, text) {
    const c = this.client();
    await c.from("post_reveal_reflections").update({ claude_response: text }).eq("id", reflectionId);
  },

  // Legacy hook from autosave; live writes go through upsertResponse per-exercise.
  async syncResponses() {
    /* no-op: per-exercise upsert is used instead */
  },

  // ---------------------------------------------------------------
  // CLAUDE via Edge Function
  async _callEdge(action, payload) {
    if (!this.isConfigured() || !window.RLP_CONFIG.edgeFunctionUrl) return null;
    const res = await fetch(window.RLP_CONFIG.edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.RLP_CONFIG.supabaseAnonKey}`,
        apikey: window.RLP_CONFIG.supabaseAnonKey,
      },
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) throw new Error("Edge function error " + res.status);
    const data = await res.json();
    return data.text || null;
  },

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
