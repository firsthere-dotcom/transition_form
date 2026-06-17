// Alpine root component for the Rich Life Planner.
// Frontend-first: all state persists to localStorage via Storage. A "demo mode"
// lets a single browser simulate both partners so the reveal flow is testable
// before Supabase auth/DB exist. Backend calls (Claude, sync) go through window.Backend.

function app() {
  return {
    db: window.emptyDb(),

    // ---- view state ----
    view: "signin", // signin | onboarding | dashboard | exercise | reveal | archive
    currentModuleSlug: null,
    currentExerciseSlug: null,

    // ---- transient ui ----
    showDeeper: false,
    saveHint: "",
    saveTimer: null,
    joinCode: "",
    onboard: { name: "", mode: "create", code: "" },
    rankError: "",
    dragIndex: null,
    observationsLoading: false,
    reflectionDrafts: {}, // exerciseSlug -> text
    sessionDismissed: {}, // `${module}:${exercise}` -> true (this session only)

    modules: window.MODULES,

    // ---------------------------------------------------------------
    async init() {
      const loaded = window.Storage.load();
      if (loaded) this.db = Object.assign(window.emptyDb(), loaded);

      if (window.Backend && window.Backend.isConfigured()) {
        let live = false;
        try {
          live = await window.Backend.initAuth(this);
        } catch (e) {
          console.warn("initAuth failed", e);
        }
        if (!live) {
          // No live session. Keep a local demo session if present, else sign in.
          if (this.db.settings.demoMode && this.db.session) {
            this.route();
          } else {
            this.db.session = null;
            this.db.activeUserId = null;
            this.view = "signin";
          }
        }
      } else {
        this.route();
      }
    },

    get isLive() {
      return !!(window.Backend && window.Backend.isConfigured()) && !this.db.settings.demoMode;
    },

    persist() {
      window.Storage.save(this.db);
    },

    route() {
      if (!this.db.session || !this.db.activeUserId) {
        this.view = "signin";
      } else if (!this.me || !this.me.couple_id) {
        this.view = "onboarding";
      } else {
        if (this.view === "signin" || this.view === "onboarding") this.view = "dashboard";
      }
    },

    // ---------------- identity ----------------
    get me() {
      return this.db.users[this.db.activeUserId] || null;
    },
    get couple() {
      return this.db.couple;
    },
    get partner() {
      if (!this.me || !this.me.couple_id) return null;
      const others = Object.values(this.db.users).filter(
        (u) => u.couple_id === this.me.couple_id && u.id !== this.me.id
      );
      return others[0] || null;
    },
    initials(user) {
      if (!user || !user.name) return "?";
      return user.name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    },

    // ---------------- auth (demo + real stub) ----------------
    signInDemo() {
      // Create a local user with no couple yet -> onboarding.
      this.db.settings.demoMode = true;
      const id = window.uid();
      this.db.users[id] = {
        id,
        couple_id: null,
        name: "",
        birth_year: null,
        email: "you@demo.local",
      };
      this.db.session = { userId: id };
      this.db.activeUserId = id;
      this.persist();
      this.route();
    },

    async signInGoogle() {
      if (window.Backend && window.Backend.isConfigured && window.Backend.isConfigured()) {
        await window.Backend.signInWithGoogle();
      } else {
        alert(
          "Google sign-in needs Supabase configured (see SETUP.md). Use 'Continue in demo mode' to try the app now."
        );
      }
    },

    async completeOnboarding() {
      const me = this.me;
      if (!me) return;
      const name = this.onboard.name.trim();

      if (this.isLive) {
        try {
          if (this.onboard.mode === "create") {
            await window.Backend.createCouple(this, name);
          } else {
            await window.Backend.joinCouple(this, name, this.onboard.code.trim().toUpperCase());
          }
          this.view = "dashboard";
        } catch (e) {
          alert(
            this.onboard.mode === "join"
              ? "Couldn't join — check the invite code and try again."
              : "Couldn't create your couple. Please try again."
          );
        }
        return;
      }

      me.name = name;
      if (this.onboard.mode === "create") {
        const couple = {
          id: window.uid(),
          invite_code: window.makeInviteCode(),
          created_at: new Date().toISOString(),
        };
        this.db.couple = couple;
        me.couple_id = couple.id;
      } else {
        const code = this.onboard.code.trim().toUpperCase();
        if (this.db.couple && this.db.couple.invite_code === code) {
          me.couple_id = this.db.couple.id;
        } else {
          alert(
            "In demo mode there's only one local couple. Use 'Create couple', then 'Add a simulated partner' to test the reveal."
          );
          return;
        }
      }
      this.persist();
      this.view = "dashboard";
    },

    // ---------------- demo helpers ----------------
    get isDemo() {
      return this.db.settings.demoMode;
    },
    addDemoPartner() {
      if (!this.couple) return;
      const name = prompt("Partner's name (demo):", "Partner");
      if (name === null) return;
      const id = window.uid();
      this.db.users[id] = {
        id,
        couple_id: this.couple.id,
        name: name.trim() || "Partner",
        birth_year: null,
        email: "partner@demo.local",
      };
      this.persist();
      alert(
        "Simulated partner added. Use the 'Acting as' switcher (top right) to answer as them, then come back to reveal."
      );
    },
    coupleMembers() {
      if (!this.couple) return [];
      return Object.values(this.db.users).filter((u) => u.couple_id === this.couple.id);
    },
    switchActiveUser(userId) {
      this.db.activeUserId = userId;
      this.persist();
      this.goDashboard();
    },

    // ---------------- navigation ----------------
    goDashboard() {
      this.view = "dashboard";
      this.currentModuleSlug = null;
      this.currentExerciseSlug = null;
    },
    goArchive() {
      this.view = "archive";
    },
    openExercise(moduleSlug, exerciseSlug) {
      this.currentModuleSlug = moduleSlug;
      this.currentExerciseSlug = exerciseSlug;
      this.showDeeper = false;
      this.rankError = "";
      this.view = "exercise";
      window.scrollTo(0, 0);
    },
    openReveal(moduleSlug) {
      this.currentModuleSlug = moduleSlug;
      this.view = "reveal";
      window.scrollTo(0, 0);
      this.ensureReveal(moduleSlug);
    },

    // ---------------- current context getters ----------------
    get currentModule() {
      return window.getModule(this.currentModuleSlug);
    },
    get currentExercise() {
      return window.getExercise(this.currentModuleSlug, this.currentExerciseSlug);
    },
    get isFirstExerciseInModule() {
      const mod = this.currentModule;
      return mod && mod.exercises[0].slug === this.currentExerciseSlug;
    },

    // ---------------- responses ----------------
    responseFor(userId, moduleSlug, exerciseSlug) {
      return this.db.responses[window.responseKey(userId, moduleSlug, exerciseSlug)] || null;
    },
    ensureResponse(userId, moduleSlug, exerciseSlug) {
      const key = window.responseKey(userId, moduleSlug, exerciseSlug);
      if (!this.db.responses[key]) {
        this.db.responses[key] = {
          user_id: userId,
          module: moduleSlug,
          exercise_slug: exerciseSlug,
          answers: { required: {}, optional: {} },
          marked_done_at: null,
          updated_at: new Date().toISOString(),
        };
      }
      return this.db.responses[key];
    },

    // text answers
    answerValue(qid, group) {
      const r = this.responseFor(this.db.activeUserId, this.currentModuleSlug, this.currentExerciseSlug);
      if (!r) return "";
      return (r.answers[group] && r.answers[group][qid]) || "";
    },
    setAnswer(qid, group, value) {
      const r = this.ensureResponse(this.db.activeUserId, this.currentModuleSlug, this.currentExerciseSlug);
      if (!r.answers[group]) r.answers[group] = {};
      r.answers[group][qid] = value;
      r.updated_at = new Date().toISOString();
      this.autosave();
    },
    autosave() {
      this.saveHint = "Saving…";
      const moduleSlug = this.currentModuleSlug;
      const exerciseSlug = this.currentExerciseSlug;
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(async () => {
        this.persist();
        if (this.isLive) {
          await window.Backend.upsertResponse(this, moduleSlug, exerciseSlug);
        }
        this.saveHint = "Saved";
        setTimeout(() => {
          if (this.saveHint === "Saved") this.saveHint = "";
        }, 1500);
      }, 600);
    },

    // ranking answers (Money Dials): answers.required.order = [category,...]
    rankOrder() {
      const ex = this.currentExercise;
      const r = this.responseFor(this.db.activeUserId, this.currentModuleSlug, this.currentExerciseSlug);
      if (r && r.answers.required && Array.isArray(r.answers.required.order)) {
        return r.answers.required.order;
      }
      return ex.categories.slice();
    },
    setRankOrder(order) {
      const r = this.ensureResponse(this.db.activeUserId, this.currentModuleSlug, this.currentExerciseSlug);
      r.answers.required = { order: order.slice(), touched: true };
      r.updated_at = new Date().toISOString();
      this.autosave();
    },
    moveRank(index, dir) {
      const order = this.rankOrder();
      const j = index + dir;
      if (j < 0 || j >= order.length) return;
      const tmp = order[index];
      order[index] = order[j];
      order[j] = tmp;
      this.setRankOrder(order);
    },
    // drag and drop (desktop)
    onDragStart(index) {
      this.dragIndex = index;
    },
    onDrop(index) {
      if (this.dragIndex === null || this.dragIndex === index) return;
      const order = this.rankOrder();
      const [moved] = order.splice(this.dragIndex, 1);
      order.splice(index, 0, moved);
      this.dragIndex = null;
      this.setRankOrder(order);
    },
    // mobile numeric input -> reorder by chosen numbers, validate uniqueness
    rankNumber(category) {
      return this.rankOrder().indexOf(category) + 1;
    },
    setRankNumber(category, value) {
      const n = parseInt(value, 10);
      const order = this.rankOrder();
      if (!n || n < 1 || n > order.length) return;
      const from = order.indexOf(category);
      order.splice(from, 1);
      order.splice(n - 1, 0, category);
      this.setRankOrder(order);
    },

    // ---------------- completion logic ----------------
    requiredComplete(userId, moduleSlug, exerciseSlug) {
      const ex = window.getExercise(moduleSlug, exerciseSlug);
      const r = this.responseFor(userId, moduleSlug, exerciseSlug);
      if (ex.kind === "ranking") {
        return !!(r && r.answers.required && r.answers.required.touched);
      }
      if (!r) return false;
      return ex.required.every((q) => {
        const v = r.answers.required && r.answers.required[q.id];
        return v && v.trim().length > 0;
      });
    },
    canMarkDone() {
      return this.requiredComplete(this.db.activeUserId, this.currentModuleSlug, this.currentExerciseSlug);
    },
    isDone(userId, moduleSlug, exerciseSlug) {
      const r = this.responseFor(userId, moduleSlug, exerciseSlug);
      return !!(r && r.marked_done_at);
    },
    hasContent(userId, moduleSlug, exerciseSlug) {
      const r = this.responseFor(userId, moduleSlug, exerciseSlug);
      if (!r) return false;
      const req = r.answers.required || {};
      if (req.touched) return true; // ranking
      const opt = r.answers.optional || {};
      return [...Object.values(req), ...Object.values(opt)].some(
        (v) => typeof v === "string" && v.trim().length > 0
      );
    },
    exerciseStatus(moduleSlug, exerciseSlug) {
      // status for the active user
      const uid = this.db.activeUserId;
      if (this.isRevealed(moduleSlug)) return "revealed";
      if (this.isDone(uid, moduleSlug, exerciseSlug)) return "done";
      if (this.hasContent(uid, moduleSlug, exerciseSlug)) return "progress";
      return "notstarted";
    },
    statusLabel(status) {
      return {
        done: "Done",
        progress: "In progress",
        ready: "Ready to reveal",
        revealed: "Revealed",
        notstarted: "Not started",
      }[status];
    },
    async markDone() {
      const moduleSlug = this.currentModuleSlug;
      const exerciseSlug = this.currentExerciseSlug;
      const r = this.ensureResponse(this.db.activeUserId, moduleSlug, exerciseSlug);
      r.marked_done_at = new Date().toISOString();
      this.persist();
      if (this.isLive) {
        await window.Backend.upsertResponse(this, moduleSlug, exerciseSlug);
        await window.Backend.loadAll(this); // refresh partner done-flags
      }
      this.goDashboard();
    },
    async unmarkDone() {
      const r = this.responseFor(this.db.activeUserId, this.currentModuleSlug, this.currentExerciseSlug);
      if (r) {
        r.marked_done_at = null;
        this.persist();
        if (this.isLive) await window.Backend.upsertResponse(this, this.currentModuleSlug, this.currentExerciseSlug);
      }
    },

    // module-level
    moduleDoneBy(userId, moduleSlug) {
      const mod = window.getModule(moduleSlug);
      return mod.exercises.every((e) => this.isDone(userId, moduleSlug, e.slug));
    },
    bothDone(moduleSlug) {
      if (!this.partner) return false;
      return this.moduleDoneBy(this.me.id, moduleSlug) && this.moduleDoneBy(this.partner.id, moduleSlug);
    },
    isRevealed(moduleSlug) {
      return !!this.db.reveals[moduleSlug];
    },
    moduleStatus(moduleSlug) {
      if (this.isRevealed(moduleSlug)) return "revealed";
      if (this.bothDone(moduleSlug)) return "ready";
      const mine = window.getModule(moduleSlug).exercises;
      const anyContent = mine.some((e) => this.hasContent(this.db.activeUserId, moduleSlug, e.slug));
      return anyContent ? "progress" : "notstarted";
    },
    moduleProgressCount(moduleSlug) {
      const mod = window.getModule(moduleSlug);
      const done = mod.exercises.filter((e) => this.isDone(this.db.activeUserId, moduleSlug, e.slug)).length;
      return `${done}/${mod.exercises.length}`;
    },
    partnerDoneExercise(moduleSlug, exerciseSlug) {
      return this.partner && this.isDone(this.partner.id, moduleSlug, exerciseSlug);
    },

    // ---------------- reveal ----------------
    triggerReveal(moduleSlug) {
      if (!this.bothDone(moduleSlug)) return;
      this.openReveal(moduleSlug);
    },
    async ensureReveal(moduleSlug) {
      if (this.isLive) {
        if (!this.db.reveals[moduleSlug]) {
          const rev = await window.Backend.createReveal(this, moduleSlug);
          if (rev) this.db.reveals[moduleSlug] = rev;
          await window.Backend.loadAll(this); // partner answers now readable post-reveal
        }
        if (this.db.reveals[moduleSlug] && !this.db.reveals[moduleSlug].claude_response) {
          await this.loadModuleObservations(moduleSlug);
        }
        return;
      }
      // demo
      if (!this.db.reveals[moduleSlug]) {
        this.db.reveals[moduleSlug] = {
          id: window.uid(),
          couple_id: this.couple.id,
          module: moduleSlug,
          revealed_at: new Date().toISOString(),
          claude_response: null,
        };
        this.persist();
        this.loadModuleObservations(moduleSlug);
      } else if (!this.db.reveals[moduleSlug].claude_response) {
        // refresh retry (plan: no auto-retry, but a manual reopen may try again)
        this.loadModuleObservations(moduleSlug);
      }
    },
    async loadModuleObservations(moduleSlug) {
      this.observationsLoading = true;
      try {
        const payload = this.buildRevealPayload(moduleSlug);
        const text =
          window.Backend && window.Backend.revealObservations
            ? await window.Backend.revealObservations(moduleSlug, payload)
            : null;
        this.db.reveals[moduleSlug].claude_response = text || null;
        if (this.isLive && text) {
          await window.Backend.saveRevealObservation(this, moduleSlug, text);
        }
      } catch (e) {
        console.warn("observations failed", e);
        this.db.reveals[moduleSlug].claude_response = null;
      } finally {
        this.observationsLoading = false;
        this.persist();
      }
    },
    // Pair each answered question with its prompt text so Claude has full
    // context (rather than a bare list of answers with no questions).
    exerciseQA(userId, moduleSlug, ex) {
      const pairs = [];
      if (ex.kind === "ranking") {
        const a = this.revealAnswerText(userId, moduleSlug, ex, "required", "required");
        if (a) pairs.push({ q: ex.rankingPrompt, a });
      } else {
        (ex.required || []).forEach((q) => {
          const a = this.revealAnswerText(userId, moduleSlug, ex, q.id, "required");
          if (a) pairs.push({ q: q.prompt, a });
        });
      }
      (ex.optional || []).forEach((q) => {
        const a = this.revealAnswerText(userId, moduleSlug, ex, q.id, "optional");
        if (a) pairs.push({ q: q.prompt, a });
      });
      return pairs;
    },
    buildRevealPayload(moduleSlug) {
      const mod = window.getModule(moduleSlug);
      const pack = (userId) =>
        mod.exercises.map((ex) => ({
          exercise: ex.title,
          qa: this.exerciseQA(userId, moduleSlug, ex),
        }));
      return {
        moduleName: mod.name,
        partner1: { name: this.me.name, answers: pack(this.me.id) },
        partner2: { name: this.partner.name, answers: pack(this.partner.id) },
      };
    },
    observationLines(moduleSlug) {
      const rev = this.db.reveals[moduleSlug];
      if (!rev || !rev.claude_response) return [];
      return rev.claude_response
        .split(/\n+/)
        .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
        .filter((l) => l.length > 0);
    },

    // reveal display helpers
    revealAnswerText(userId, moduleSlug, ex, qid, group) {
      const r = this.responseFor(userId, moduleSlug, ex.slug);
      if (!r) return "";
      if (ex.kind === "ranking" && group === "required") {
        const order = (r.answers.required && r.answers.required.order) || ex.categories;
        return order.map((c, i) => `${i + 1}. ${c}`).join("\n");
      }
      return (r.answers[group] && r.answers[group][qid]) || "";
    },
    answersDiffer(moduleSlug, ex, qid, group) {
      if (!this.partner) return false;
      const a = (this.revealAnswerText(this.me.id, moduleSlug, ex, qid, group) || "").trim().toLowerCase();
      const b = (this.revealAnswerText(this.partner.id, moduleSlug, ex, qid, group) || "")
        .trim()
        .toLowerCase();
      if (!a || !b) return false;
      return a !== b;
    },

    // ---------------- reflections ----------------
    reflectionsFor(exerciseSlug) {
      return Object.values(this.db.reflections)
        .filter((r) => r.exercise_slug === exerciseSlug)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
    },
    async addReflection(moduleSlug, exerciseSlug) {
      const text = (this.reflectionDrafts[exerciseSlug] || "").trim();
      if (!text) return;
      let id = window.uid();
      this.db.reflections[id] = {
        id,
        user_id: this.db.activeUserId,
        couple_id: this.couple.id,
        exercise_slug: exerciseSlug,
        reflection: text,
        claude_response: null,
        created_at: new Date().toISOString(),
      };
      this.reflectionDrafts[exerciseSlug] = "";
      this.persist();

      if (this.isLive) {
        const row = await window.Backend.insertReflection(this, exerciseSlug, text);
        if (row) {
          delete this.db.reflections[id];
          this.db.reflections[row.id] = row;
          id = row.id;
        }
      }

      // fire Claude reflection observation (graceful if unavailable)
      try {
        if (window.Backend && window.Backend.reflectionObservations) {
          const payload = this.buildReflectionPayload(moduleSlug, exerciseSlug);
          const text2 = await window.Backend.reflectionObservations(exerciseSlug, payload);
          if (text2 && this.db.reflections[id]) {
            this.db.reflections[id].claude_response = text2;
            this.persist();
            if (this.isLive) await window.Backend.saveReflectionObservation(id, text2);
          }
        }
      } catch (e) {
        console.warn("reflection observation failed", e);
      }
    },
    buildReflectionPayload(moduleSlug, exerciseSlug) {
      const ex = window.getExercise(moduleSlug, exerciseSlug);
      return {
        exerciseName: ex.title,
        partner1: { name: this.me.name, qa: this.exerciseQA(this.me.id, moduleSlug, ex) },
        partner2: this.partner
          ? { name: this.partner.name, qa: this.exerciseQA(this.partner.id, moduleSlug, ex) }
          : { name: "Partner", qa: [] },
        reflections: this.reflectionsFor(exerciseSlug).map((r) => ({
          who: this.db.users[r.user_id] ? this.db.users[r.user_id].name : "Partner",
          text: r.reflection,
        })),
      };
    },
    userName(userId) {
      return this.db.users[userId] ? this.db.users[userId].name : "Partner";
    },

    // ---------------- inspiration prompts ----------------
    inspirationVisible(moduleSlug, exerciseSlug) {
      const ex = window.getExercise(moduleSlug, exerciseSlug);
      if (!ex.inspiration || ex.inspiration.length === 0) return false;
      const key = `${moduleSlug}:${exerciseSlug}`;
      if (this.db.dismissedInspiration[key]) return false; // permanent
      if (this.sessionDismissed[key]) return false; // this session
      return true;
    },
    dismissInspiration(moduleSlug, exerciseSlug, permanent) {
      const key = `${moduleSlug}:${exerciseSlug}`;
      if (permanent) {
        this.db.dismissedInspiration[key] = true;
        this.persist();
      } else {
        this.sessionDismissed[key] = true;
      }
    },

    // ---------------- sign out / reset ----------------
    async signOut() {
      if (this.isLive && window.Backend.signOut) {
        await window.Backend.signOut();
      }
      window.Storage.clear();
      this.db = window.emptyDb();
      this.db.session = null;
      this.db.activeUserId = null;
      this.view = "signin";
    },
    resetAll() {
      if (!confirm("This clears all local data (demo only). Continue?")) return;
      window.Storage.clear();
      this.db = window.emptyDb();
      this.view = "signin";
    },
  };
}

window.app = app;
