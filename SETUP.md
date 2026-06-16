# Setup guide — Rich Life Planner

The app runs in two modes:

- **Demo mode** (default, zero setup): open `index.html` or serve the folder statically. Everything lives in `localStorage`. Use "Continue in demo mode" and "Add a simulated partner" to try the full flow including the reveal. Claude observations show the graceful fallback (no API).
- **Live mode**: fill in `js/config.js` and complete the four steps below to enable Google sign-in, cross-device sync, and Claude observations.

These four steps are **manual** — they can't be automated from code.

---

## 1. Supabase database (SQL + Row Level Security)

Open your Supabase project → **SQL Editor** → paste and run the following.

```sql
-- ---------- Tables ----------
create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key,                         -- matches auth.users.id
  couple_id uuid references couples(id),
  name text,
  birth_year int,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists exercise_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  couple_id uuid not null references couples(id),
  module text not null,                         -- 'transitions' | 'vision'
  exercise_slug text not null,
  answers jsonb not null default '{}'::jsonb,
  marked_done_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, module, exercise_slug)
);

create table if not exists post_reveal_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  couple_id uuid not null references couples(id),
  exercise_slug text not null,
  reflection text not null,
  claude_response text,
  created_at timestamptz not null default now()
);

create table if not exists reveals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id),
  module text not null,
  revealed_at timestamptz not null default now(),
  claude_response text,
  unique (couple_id, module)
);

-- ---------- Indexes ----------
create index if not exists idx_responses_couple_module on exercise_responses(couple_id, module);
create index if not exists idx_reflections_couple_ex on post_reveal_reflections(couple_id, exercise_slug);
create index if not exists idx_users_couple on users(couple_id);

-- ---------- Helper: my couple_id ----------
create or replace function my_couple_id() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from users where id = auth.uid();
$$;

-- ---------- Enable RLS ----------
alter table couples enable row level security;
alter table users enable row level security;
alter table exercise_responses enable row level security;
alter table post_reveal_reflections enable row level security;
alter table reveals enable row level security;

-- ---------- couples ----------
-- Read only your own couple. (Joining by code uses the RPC below, not direct select.)
create policy couples_select on couples
  for select using (id = my_couple_id());
create policy couples_insert on couples
  for insert with check (true);   -- creator inserts, then links their user row

-- ---------- users ----------
create policy users_select_self_or_partner on users
  for select using (id = auth.uid() or couple_id = my_couple_id());
create policy users_insert_self on users
  for insert with check (id = auth.uid());
create policy users_update_self on users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- exercise_responses ----------
-- Own answers: full access.
create policy responses_rw_own on exercise_responses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Partner's answers: readable ONLY after a reveal exists for that couple+module
-- (this enforces "private until reveal" server-side, not just in the UI).
create policy responses_read_partner_after_reveal on exercise_responses
  for select using (
    couple_id = my_couple_id()
    and exists (
      select 1 from reveals r
      where r.couple_id = exercise_responses.couple_id
        and r.module = exercise_responses.module
    )
  );

-- ---------- post_reveal_reflections ----------
-- Both partners see each other's reflections immediately.
create policy reflections_select_couple on post_reveal_reflections
  for select using (couple_id = my_couple_id());
create policy reflections_insert_own on post_reveal_reflections
  for insert with check (user_id = auth.uid() and couple_id = my_couple_id());
create policy reflections_update_own on post_reveal_reflections
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- reveals ----------
create policy reveals_select_couple on reveals
  for select using (couple_id = my_couple_id());
create policy reveals_insert_couple on reveals
  for insert with check (couple_id = my_couple_id());
create policy reveals_update_couple on reveals
  for update using (couple_id = my_couple_id()) with check (couple_id = my_couple_id());

-- ---------- Join-by-code RPC (avoids exposing all couples) ----------
create or replace function join_couple(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select id into cid from couples where invite_code = upper(code);
  if cid is null then raise exception 'invalid invite code'; end if;
  update users set couple_id = cid where id = auth.uid();
  return cid;
end;
$$;
```

Notes:
- Partner answers are hidden until a `reveals` row exists for that couple+module — privacy is enforced by the database, not just the UI.
- Creating a couple: call `supabase.rpc('create_couple', { p_name, p_birth_year })` (see RPC below).
- Joining: call `supabase.rpc('join_couple', { code })`.

### Extra RPC — partner progress (run this too)

So the dashboard can show "your partner has finished this" / "you're both ready"
*without* leaking partner answers before the reveal, add this function that
returns only done-flags (no answer text):

```sql
create or replace function partner_done_status()
returns table(module text, exercise_slug text, marked_done boolean)
language sql stable security definer set search_path = public as $$
  select er.module, er.exercise_slug, (er.marked_done_at is not null)
  from exercise_responses er
  join users me on me.id = auth.uid()
  where er.couple_id = me.couple_id
    and er.user_id <> auth.uid();
$$;
```

### Extra RPC — create a couple (run this too)

RLS only lets you read a couple you already belong to, so the creator can't read
back the row they just inserted. This function creates the couple and links the
creator in one atomic step, returning the invite code:

```sql
create or replace function create_couple(p_name text, p_birth_year int)
returns text
language plpgsql security definer set search_path = public as $$
declare
  new_code text;
  cid uuid;
begin
  loop
    new_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from couples where invite_code = new_code);
  end loop;
  insert into couples (invite_code) values (new_code) returning id into cid;
  update users set couple_id = cid, name = p_name, birth_year = p_birth_year
    where id = auth.uid();
  return new_code;
end;
$$;
```

---

## 2. Supabase Edge Function (Claude proxy)

The Anthropic key never touches the browser — it lives as a Supabase secret used inside the function. The function code is in `supabase/functions/claude/index.ts`.

Using the Supabase CLI (recommended):

```bash
# from the project root, once:
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # find ref in Project Settings → General

# store the Anthropic key as a secret (NEVER commit this):
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# deploy:
supabase functions deploy claude --no-verify-jwt
```

After deploy, the function URL is:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/claude
```

Put that URL in `js/config.js` as `edgeFunctionUrl`.

The model is `claude-haiku-4-5` (set in the function). The client sends `{ action: "reveal" | "reflection", payload }` and receives `{ text }`. If the call fails, the app shows the graceful fallback and nothing is lost.

---

## 3. Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create a project (or reuse one).
2. **APIs & Services → OAuth consent screen** → configure (External, add your email as a test user while in testing).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application**.
4. **Authorised redirect URIs** — add your Supabase callback:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
5. **Authorised JavaScript origins** — add where the app is served:
   ```
   https://YOUR_GITHUB_USERNAME.github.io
   http://localhost:4321        (for local testing)
   ```
6. Copy the **Client ID** and **Client secret**.
7. In Supabase → **Authentication → Providers → Google** → enable, paste the Client ID and secret, save.

---

## 4. GitHub Pages deployment

The site is fully static with no build step and uses **relative paths**, so it works at a subdirectory like `username.github.io/transition_form/`.

1. Push the repo to GitHub.
2. Repo **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder: `/ (root)` → Save.
3. Your app will be live at `https://YOUR_GITHUB_USERNAME.github.io/transition_form/`.
4. Edit `js/config.js` and commit it with your real values:
   ```js
   window.RLP_CONFIG = {
     supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
     supabaseAnonKey: "YOUR_PUBLIC_ANON_KEY",
     edgeFunctionUrl: "https://YOUR_PROJECT_REF.supabase.co/functions/v1/claude",
   };
   ```
   The **anon key is public by design** (protected by the RLS policies above) and is safe to commit. The **Anthropic key is never here** — only in the Supabase secret from step 2.
5. Add your Pages origin to Google's authorised origins (step 3) and to Supabase **Authentication → URL Configuration → Site URL / Redirect URLs**.

---

## Quick local run

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

With `js/config.js` left blank, this runs in demo mode — no backend needed.
