// Local-first persistence layer.
// The app keeps a single `db` object in memory (owned by the Alpine root) and
// persists it here. When Supabase is wired in (backend.js), the same shapes are
// pushed/pulled from the server; this file stays the offline source of truth.

window.Storage = {
  KEY: "rlp:v1",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Storage.load failed", e);
      return null;
    }
  },

  save(db) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(db));
    } catch (e) {
      console.warn("Storage.save failed", e);
    }
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },
};

// Small id + invite-code helpers
window.uid = function () {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

window.makeInviteCode = function () {
  // 6 chars, no ambiguous 0/O/1/I
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
};

// Fresh, empty database shape.
window.emptyDb = function () {
  return {
    version: 1,
    session: null, // { userId }
    activeUserId: null, // dev: which partner we're acting as locally
    couple: null, // { id, invite_code, created_at }
    users: {}, // userId -> { id, couple_id, name, birth_year, email }
    responses: {}, // `${userId}:${module}:${exercise}` -> { answers, marked_done_at, updated_at }
    reflections: {}, // reflectionId -> { id, user_id, exercise_slug, reflection, claude_response, created_at }
    reveals: {}, // module -> { id, couple_id, module, revealed_at, claude_response }
    dismissedInspiration: {}, // `${module}:${exercise}` -> true (permanent dismiss)
    settings: { demoMode: true }, // demoMode lets one browser simulate both partners
  };
};

window.responseKey = function (userId, moduleSlug, exerciseSlug) {
  return `${userId}:${moduleSlug}:${exerciseSlug}`;
};
