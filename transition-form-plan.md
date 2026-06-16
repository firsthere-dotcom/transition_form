# Rich Life Planner — Product Plan
*A couples' web app for designing the second half of life together*

---

## What it is

A web app where two partners independently answer a series of reflective exercises about their vision for the future, the transitions ahead, and the inner work of change. When both partners complete a module, they trigger a reveal and see each other's answers side by side. A Claude API call (via Supabase Edge Function) then generates tailored observations based on what they actually wrote.

This is not a financial tracker or a goal-setting tool. It is a life design and transition tool, grounded in two bodies of work: Ramit Sethi's *I Will Teach You to Be Rich* (vision and values exercises) and William Bridges' *Transitions* (psychological exercises for navigating change).

---

## Who it is for

Two partners, both in their 40s–50s, who broadly know what they want but are navigating the transition to get there. The tone is mature, expansive, and honest — not aspirational in a generic way, but genuinely exploratory. Questions are framed for people who have already built one version of their lives and are designing the next one.

---

## Design principles

- Questions never assume what the transition looks like — they help surface it
- Language acknowledges that identities and priorities have already evolved once and will again
- Prompts actively push against "realistic" thinking — the tool's job is to surface desires, not filter them
- Answers are private until both partners complete a full module and trigger the reveal
- No scoring, no right answers — the tool facilitates conversation, not judgment
- Web-first responsive design, comfortable at 1024px+ and gracefully degrading to mobile
- The app must work fully without the Claude API — the API is an enhancement, not a dependency
- All answers save locally first (localStorage/IndexedDB) and sync to Supabase when connection allows
- No push notifications — keep it simple

---

## Two independent modules

The app has two modules, each with its own independent reveal. They are not sequential — partners choose when and whether to do each one.

### Module 1 — Transitions *(primary, do this first)*
Exercises drawn from William Bridges' *Transitions*. Most relevant for partners currently navigating a life change. Contains: Endings, Neutral Zone, Not ready to let go, What is beginning, Rich Life challenge.

### Module 2 — Vision *(optional, do when ready)*
Exercises drawn from Ramit Sethi's *I Will Teach You to Be Rich*. Useful once the transition is underway or when partners want to design the longer arc. Contains: The transition years, Future state, Life chapters, Money Dials, Windfall.

Each module has its own reveal. Completing Module 2 is entirely optional — the app does not prompt or pressure.

---

## Question structure

Each exercise has:
- **1 required question** — the essential one; completing this counts as completing the exercise
- **Optional "Go deeper" questions** — clearly marked, available if partners want to go further

This means the minimum investment per exercise is one honest answer. The door is always open for more.

---

## Reveal mechanic

The reveal happens at module level, not exercise by exercise.

1. Each exercise has an **"I'm done"** button (not "submit")
2. Partners complete exercises independently, in any order, at any time
3. When both partners have marked all exercises in a module as done, both see a **"Reveal"** button
4. Either partner can tap it — no synchronized countdown, no real-time dependency
5. Answers appear side by side for each exercise
6. Differences are gently highlighted (visual contrast, no judgment)
7. A Claude API call generates 3–4 observations/conversation starters based on all answers across the full module at once
8. If the Claude API call fails (low connectivity, timeout), the reveal still works — answers appear as normal, the observation section shows a graceful "not available right now" message

---

## Post-reveal reflections

After the reveal, either partner can add a reflection to any exercise at any time — there is no deadline and no coordination needed.

- Reflections are **additions**, not edits — the original answer is preserved exactly as written and shown alongside the reflection
- Both partners can see each other's reflections immediately when added
- When a reflection is saved, a new Claude API call is triggered automatically using: both original answers + the new reflection + any reflections already added by either partner on that exercise
- The Claude response at this stage is observational rather than prompt-based — it notices what has shifted, what is converging, what remains unresolved
- If the API call fails, the reflection is still saved and visible — no data is lost

---

## Exercises

### Module 1 — Transitions

---

**Exercise 1.1 — Endings**

*Section intro (shown at top of module):*
William Bridges spent decades studying how people navigate major life changes. His central finding was counterintuitive: most transitions don't fail because people can't reach the new thing — they fail because people haven't fully left the old one. Bridges identified three phases every transition moves through: an Ending, a Neutral Zone, and a New Beginning. These aren't always sequential, and they're never neat. But naming them makes them navigable. The exercises in this module are more inward-looking than most. They ask harder questions. Answer them slowly.

*Exercise intro:*
Every transition begins with an ending — not just of a situation, but of an identity, a role, a way of seeing yourself. This is true even when you're the one choosing to leave. Bridges found that people who skip the work of acknowledging what is ending often find it following them into the new life, unfinished. This exercise asks you to look clearly at what is ending for you — including the parts that are a relief, and the parts that are a quiet grief.

*Required:*
- What is ending in your life right now — not just practically, but in terms of who you've been?

*Optional — Go deeper:*
- What role or version of yourself is completing its time?
- What will you genuinely miss?
- What are you relieved to leave behind?
- What do you want to acknowledge or honour about this chapter before it closes?

---

**Exercise 1.2 — The Neutral Zone**

*Exercise intro:*
Between the old life and the new one, there is a gap. Bridges called it the Neutral Zone — a period of not-yet, of disorientation, of not knowing who you are in the new context. It's uncomfortable, and most people rush through it or try to fill it with activity and plans. But Bridges found that the Neutral Zone is where the most important inner work happens — where old identities dissolve and new ones begin to form. You can't think your way through it. You have to live in it. This exercise helps you prepare for that, not by planning your way out of it, but by understanding what it's for.

*Required:*
- What does "not knowing yet" feel like for you — exciting, terrifying, both?

*Optional — Go deeper:*
- What do you typically do when you feel disoriented or unmoored? Does that serve you?
- What would you need in order to feel okay without a plan for a while?
- What might become possible during a period of not-knowing that couldn't happen otherwise?
- What do you want to protect yourself from during this phase?

---

**Exercise 1.3 — What you're not ready to let go of**

*Exercise intro:*
The hardest part of any transition isn't the leap forward — it's the invisible thread that pulls you back. Most people are aware of what they're excited to leave behind. Fewer are honest about what they're secretly hoping to recreate in the new life, or what they'll miss in ways they haven't yet admitted to themselves. Bridges found this is what most often derails a transition: not external obstacles, but the unlived grief of leaving. This exercise asks the harder question. Answering it honestly is what separates a genuine transition from moving your current life to a new location.

*Required:*
- What from your current life are you secretly hoping to bring with you or recreate?

*Optional — Go deeper:*
- What habit, comfort, or identity marker will be hardest to release?
- Is there a person, relationship dynamic, or community you're afraid of losing?
- What would you need to grieve in order to move forward cleanly?

---

**Exercise 1.4 — What is beginning**

*Exercise intro:*
Bridges distinguished a New Beginning from a mere fresh start. A fresh start is a blank slate — you wipe everything and start over. A New Beginning grows out of what ended. It carries something forward, transformed. It often can't be planned in advance because it only becomes visible once you've moved through the Neutral Zone. It arrives not as a decision but as a recognition — something that was always there, finally finding room. This exercise asks you to listen for what's already trying to emerge: the version of yourself that this transition is making possible.

*Required:*
- Who are you becoming that you couldn't have been before this transition?

*Optional — Go deeper:*
- What feels like it has been waiting for permission to emerge?
- What values or qualities do you want to lead with in this new chapter?
- What do you want to be true about you on the other side of this?

---

**Exercise 1.5 — The transition**

*Exercise intro:*
Most people plan for a destination and tolerate the journey to get there. But some transitions have a middle chapter that deserves to be designed on its own terms — not as a gap before the real thing begins, but as a period worth wanting. Having explored what is ending and what is beginning, this exercise asks you to sketch what the in-between looks like. It might be wandering, or experimenting, or deliberately slowing down. It might be one year or five. The point is not to plan it precisely, but to ask honestly: is there a version of life between here and there that you actually want?

*Required:*
- Is there a transition period before your Rich Life that you want to design intentionally? Describe what it looks, feels, and sounds like.

*Optional — Go deeper:*
- What matters most during this period?
- What are you free from during it? What are you free to do?
- How long does it last — and what tells you it's over?

*Inspiration prompts (dismissible):*
- "Imagine you have no fixed address for two years. What does your week look like?"
- "What would you do if you had permission to be completely unproductive for a while?"
- "What have you always wanted to try but never had the space to?"
- "What does freedom feel like in your body — not as an idea, but as a day?"

---

### Module 2 — Vision

---

**Exercise 2.1 — Rich Life challenge**

*Section intro (shown at top of module):*
Before thinking about how to get somewhere, it helps to know what you're actually moving toward — and what the journey itself might look like. These exercises are intentionally open. There are no wrong answers, and you don't need to be certain. The goal is to articulate something honest, even if it's incomplete.

*Exercise intro:*
Designing a Rich Life on paper is one thing. Feeling it in your body is another. Ramit Sethi's challenge is simple: do one small thing now that belongs to the life you're designing. Not a grand gesture — a meal, a morning, a purchase, a conversation you've been putting off. Then notice what it actually feels like, before and after. The gap between anticipation and experience is where you learn what you really want. Sometimes you discover you want it even more than you thought. Sometimes you discover you were in love with the idea, not the thing itself. Either way, you learn something real.

*Required:*
- What did you choose to do, and how did it feel before and after?

*Optional — Go deeper:*
- Why this particular thing?
- What did you learn about what you actually want?

---

**Exercise 2.2 — The future state**

*Exercise intro:*
Beyond any transition, something eventually takes shape — a different kind of life, chosen rather than inherited. This isn't about the perfect house or the ideal city. It's about the texture of an ordinary day when you feel you've arrived somewhere that fits. What does that feel like? What's present that isn't now? What's no longer there?

*Required:*
- Describe an ordinary Tuesday in your future life. Be specific — morning, afternoon, evening.

*Optional — Go deeper:*
- Where are you? Who is around you?
- What's present in this life that isn't in your life now?
- What's no longer there?

*Inspiration prompts (dismissible):*
- "Describe your future life to a stranger on a plane. Make them a little jealous."
- "What did you want at 25 that you quietly gave up on?"
- "If work were optional, what would fill your days?"
- "What would your 70-year-old self thank you for choosing?"
- "Imagine you moved somewhere nobody knows you. What would you do differently?"

---

**Exercise 2.3 — Life chapters**

*Exercise intro:*
Most people spend more time planning a holiday than designing their life. Life chapters asks you to zoom out and think in terms of what you want each period to be *about* — not what you'll achieve, but what you'll inhabit. A chapter isn't a plan. It's an intention, a texture, a set of things that matter. What do you want this next chapter of your life to stand for?

*Required:*
- What do you want the next 5–10 years to be about? Not what you'll do — what it will feel like to live them.

*Optional — Go deeper:*
- What do you want more of in your life?
- What do you want less of?
- What would you regret not doing or being during this chapter?
- Is there a chapter after this one that you can already sense? What is it?

---

**Exercise 2.4 — Money Dials**

*Exercise intro:*
We all say we know what matters to us. But where we actually spend money tells a different story. Money Dials — a concept from Ramit Sethi — are the categories of life where spending genuinely makes you happier. The exercise isn't about budgeting. It's about discovering what you actually value when you're honest about it, and whether your partner values the same things. There are no right answers — only true ones.

*Required:*
Rank the following 10 categories from most to least important for how you want to spend money and energy in your Rich Life.

**Desktop:** drag and drop the cards into your preferred order.
**Mobile:** each category has a number input field (1–10); enter a unique rank for each. Duplicate numbers are flagged before you can mark done.

Categories to rank:
- Travel and exploration
- Health and wellbeing
- Home and environment
- Experiences and adventures
- Relationships and time with people you love
- Freedom and flexibility (buying back your time)
- Learning and growth
- Generosity (giving to others, causes, community)
- Comfort and convenience
- Beauty, aesthetics, and quality

*Optional — Go deeper:*
- Which ranking surprises you?
- Which did you rank lower than you expected?

---

**Exercise 2.5 — Windfall**

*Exercise intro:*
Hypothetical money questions reveal real values. When there's no budget constraint, no practicality filter, no "but we can't afford that" — what do you reach for first? This exercise uses imaginary windfalls at three scales to surface what you genuinely want, versus what you've trained yourself to want within your current constraints. Answer quickly. Your first instinct is the most honest one.

*Required:*
- You receive €10,000 unexpectedly. What do you do with it?
- You receive €100,000. What do you do with it?
- You receive €1,000,000. What do you do with it?

*Optional — Go deeper:*
- What do you notice about the differences between your three answers?

---

## Inspiration prompts — general principles

Shown as dismissible cards before relevant exercises. Purpose: break anchoring on the current situation and give permission to think without a practicality filter.

- Never assume what the answer will be
- Push toward specificity ("what does a Tuesday look like" not "describe your ideal life")
- Invite surprising answers ("what would your 70-year-old self thank you for")
- Make the hypothetical feel real ("imagine you have no fixed address")
- Dismissible per session — reappear next session unless explicitly dismissed permanently

---

## Claude API — via Supabase Edge Function

All Claude API calls are routed through a Supabase Edge Function to keep the Anthropic API key server-side and never exposed in client code.

### Call 1 — Module reveal
Triggered when both partners complete all exercises in a module and either triggers the reveal.

Prompt structure:
> "Two partners have completed the [module name] module. Here are their answers: [Partner 1 full answers] / [Partner 2 full answers]. Generate 3–4 observations or conversation starter questions tailored to their specific answers. Look for: things they both want that they may not have discussed explicitly; meaningful differences; unspoken assumptions or unexplored tensions. For the Transitions module, note whether both partners seem to be in a similar emotional place or whether one appears further along. Tone: warm, curious, open-ended. Not therapeutic or leading."

### Call 2 — Post-reveal reflection
Triggered immediately when either partner saves a post-reveal reflection on any exercise.

Prompt structure:
> "Two partners completed the [exercise name] exercise and have now added post-reveal reflections. Here are their original answers: [Partner 1 original] / [Partner 2 original]. Here are the reflections added so far: [Partner 1 reflection if exists] / [Partner 2 reflection if exists]. Generate 2–3 short observations noticing what has shifted, what seems to be converging between them, and what remains unresolved or worth exploring further. Tone: observational, not directive."

### Failure handling
If any API call fails or times out:
- The reveal still displays all answers side by side
- The observation/conversation starter section shows: "Reflections unavailable right now — you might not have a strong connection. Your answers are all saved."
- No retry is triggered automatically — the user can refresh if they want to try again

---

## Data model (Supabase)

```sql
couples
  id uuid primary key
  invite_code text unique  -- 6-character, generated on couple creation
  created_at timestamp

users
  id uuid primary key  -- matches Supabase auth user id
  couple_id uuid references couples(id)
  name text
  birth_year int
  email text
  created_at timestamp

exercise_responses
  id uuid primary key
  user_id uuid references users(id)
  couple_id uuid references couples(id)
  module text  -- "transitions" | "vision"
  exercise_slug text  -- e.g. "endings", "neutral-zone", "windfall"
  answers jsonb  -- { required: "...", optional: { q1: "...", q2: "..." } }
  marked_done_at timestamp
  updated_at timestamp

post_reveal_reflections
  id uuid primary key
  user_id uuid references users(id)
  couple_id uuid references couples(id)
  exercise_slug text
  reflection text
  claude_response text  -- stored after API call
  created_at timestamp

reveals
  id uuid primary key
  couple_id uuid references couples(id)
  module text  -- "transitions" | "vision"
  revealed_at timestamp
  claude_response text  -- stored after API call
```

---

## Auth

- Google OAuth via Supabase Auth (Gmail accounts)
- No passwords — sign in with Google only
- Session persists across devices and browsers
- Couple linking flow:
  1. Partner 1 signs in → creates couple → gets 6-character invite code
  2. Shares code with Partner 2 outside the app
  3. Partner 2 signs in → enters invite code → linked to same couple
  4. Both now connected, each retaining their own identity and answers

---

## App pages

### 1. Sign in
- "Sign in with Google" button
- Brief one-line description of what the app is

### 2. Onboarding (first sign-in only)
- Enter name and birth year
- Create couple (generates invite code) OR enter partner's invite code
- Brief explanation: you answer independently, reveal together

### 3. Dashboard
- Both partners shown with initials/avatar
- Module 1 (Transitions) shown prominently
- Module 2 (Vision) shown as secondary/optional
- Each exercise within a module shown as: not started / in progress / done / revealed
- Entry point to each exercise

### 4. Exercise screen
- Module section intro at top of first exercise in module (not repeated on every exercise)
- Exercise intro below (visual distinction — softer text, thin left border accent, more whitespace than Vision exercises for Transitions)
- Inspiration prompt cards where applicable (dismissible)
- Required question prominently
- Optional questions below a clear "Go deeper" divider, collapsed by default
- Autosave as you type (local first, then Supabase)
- "I'm done" button at bottom
- Status note if partner is already done: "Your partner has finished this one"

### 5. Reveal screen
- Available when both partners have marked all exercises in a module as done
- "You're both ready. See each other's answers." button
- Answers displayed exercise by exercise, side by side (Partner 1 left, Partner 2 right)
- Gentle visual highlight where answers differ meaningfully
- Claude observations/conversation starters below (or graceful fallback if unavailable)
- Post-reveal reflection input available immediately below each exercise pair

### 6. Archive
- All revealed modules and exercises, browsable
- Post-reveal reflections and Claude responses shown inline
- Reveal date shown

---

## Tech stack

- **Frontend:** Vanilla HTML/CSS/JS with Alpine.js for reactivity
- **Backend:** Supabase (Postgres database, Google OAuth, Edge Functions)
- **Claude API:** Anthropic claude-haiku-4-5, called via Supabase Edge Function (key never exposed client-side)
- **Offline resilience:** Answers saved to localStorage/IndexedDB first, synced to Supabase on connection
- **Deployment:** GitHub Pages (static, no build step)
- **Auth:** Google OAuth only (no passwords, no magic links)

## Existing accounts
- GitHub account: already set up
- Supabase project: already set up
- Google OAuth: configure in Supabase dashboard using Google Cloud credentials

---

## Design system

### Font
**Atkinson Hyperlegible** — load via Google Fonts.
```html
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
```
Use for all text throughout the app. Two weights only: 400 (body) and 700 (headings, buttons, labels). Never use intermediate weights.

### Colour system

Three functional colour families plus neutral gray for text and borders.

**Transitions module — Orange**
| Role | Hex |
|---|---|
| Background fill (lightest) | `#FFF0E6` |
| Light fill / hover | `#FFD4B0` |
| Mid / border accent | `#F5A05A` |
| Button / strong accent | `#E8600A` |
| Dark border | `#C44D00` |
| Text on light orange bg | `#7A3000` |

**Vision module — Teal**
| Role | Hex |
|---|---|
| Background fill (lightest) | `#E1F5EE` |
| Light fill / hover | `#9FE1CB` |
| Mid / border accent | `#5DCAA5` |
| Button / strong accent | `#1D9E75` |
| Dark border | `#0F6E56` |
| Text on light teal bg | `#085041` |

**Reveal / shared accent — Purple**
| Role | Hex |
|---|---|
| Background fill (lightest) | `#EEEDFE` |
| Light fill / hover | `#CECBF6` |
| Mid / border accent | `#AFA9EC` |
| Button / strong accent | `#7F77DD` |
| Dark border | `#534AB7` |
| Text on light purple bg | `#3C3489` |

**Neutral — for text, borders, backgrounds**
| Role | Hex |
|---|---|
| Page background | `#FFFFFF` |
| Surface / card background | `#FAFAFA` |
| Border (default) | `#E5E5E5` |
| Muted text | `#888888` |
| Body text | `#333333` |
| Heading text | `#111111` |

### Typography scale

| Element | Size | Weight | Color |
|---|---|---|---|
| H1 (page title) | 26px | 700 | `#111111` |
| H2 (section title) | 20px | 700 | `#222222` |
| H3 (exercise title) | 17px | 700 | `#222222` |
| Body text | 16px | 400 | `#333333` |
| Muted / helper text | 14px | 400 | `#888888` |
| Button text | 15px | 700 | varies |
| Tag / label | 12px | 700 | varies |

Line height: 1.8 for body text, 1.4 for headings. Never justify text — always left-align. Letter spacing: default (do not tighten). Max line length: 680px on desktop, full width on mobile.

### Buttons

All buttons use Atkinson Hyperlegible 700, border-radius 10px, padding 10px 22px, no box shadow.

| Button | Background | Text color | Usage |
|---|---|---|---|
| Transitions primary | `#E8600A` | `#FFFFFF` | Main CTA in Transitions module |
| Vision primary | `#1D9E75` | `#FFFFFF` | Main CTA in Vision module |
| Reveal | `#7F77DD` | `#FFFFFF` | Reveal button (both modules) |
| I'm done | `#FFE0C8` | `#7A3000` | Soft, non-final completion |
| Ghost / secondary | `#FFFFFF` | `#444444` | Border: 1.5px solid `#CCCCCC` |

Hover state: darken background by ~10%. Active state: scale(0.97). Focus ring: 3px solid accent color at 50% opacity.

### Status tags

Pill shape, border-radius 20px, padding 4px 12px, font-size 12px, weight 700.

| Tag | Background | Text |
|---|---|---|
| Done | `#E1F5EE` | `#0F6E56` |
| In progress | `#F1EFE8` | `#5F5E5A` |
| Ready to reveal | `#EEEDFE` | `#534AB7` |
| Not started | `#F5F5F5` | `#AAAAAA` |

### Section intro blocks

Used at the top of each exercise to provide context. Left border accent, light background fill, no full border.

```css
border-left: 4px solid [module accent colour];
background: [module lightest fill];
color: [module dark text colour];
border-radius: 0 10px 10px 0;
padding: 1rem 1.25rem;
font-size: 15px;
line-height: 1.7;
max-width: 640px;
```

Transitions intro block: border `#E8600A`, background `#FFF0E6`, text `#7A3000`
Vision intro block: border `#1D9E75`, background `#E1F5EE`, text `#085041`

### Cards

```css
background: #FFFFFF;
border: 1px solid #E5E5E5;
border-radius: 12px;
padding: 1.25rem 1.5rem;
```

No drop shadows. Hover state: border-color `#CCCCCC`.

### Layout

- Max content width: 780px, centred
- Mobile breakpoint: 640px (single column, full width)
- Page padding: 2rem desktop, 1rem mobile
- Section spacing: 2.5rem between major sections
- Question spacing: 2rem between questions within an exercise

### Accessibility

- All text on coloured backgrounds must meet WCAG AA contrast ratio (4.5:1 minimum)
- Focus states visible on all interactive elements
- Textarea and input fields: min font-size 16px (prevents iOS auto-zoom)
- Touch targets: minimum 44px height on mobile
- Never rely on colour alone to convey state — always pair with text label or icon

---

## Manual setup instructions required

Claude Code must produce clear step-by-step instructions for the following, separate from the code — these cannot be automated and must be done manually by the developer.

### 1. Supabase table setup
Provide the exact SQL to run in the Supabase SQL editor to create all tables, including:
- All `CREATE TABLE` statements with correct column types and constraints
- All foreign key relationships
- Row Level Security (RLS) policies for each table — users should only be able to read and write their own data and their partner's data within the same couple
- Any indexes worth adding for performance

### 2. Supabase Edge Function setup
Step-by-step instructions for:
- Creating the Edge Function in the Supabase dashboard or via CLI
- Adding the Anthropic API key as a Supabase secret
- Deploying the function
- The exact function URL to reference in the frontend code

### 3. Google OAuth setup
Step-by-step instructions for:
- Creating a Google Cloud project (or using an existing one)
- Enabling the Google OAuth API
- Creating OAuth credentials (client ID and client secret)
- Adding the correct authorised redirect URI (Supabase callback URL)
- Entering the client ID and secret in the Supabase dashboard under Authentication > Providers > Google
- Adding the GitHub Pages domain to the list of authorised JavaScript origins in Google Cloud

### 4. GitHub Pages deployment
Step-by-step instructions for:
- Enabling GitHub Pages on the repository (which branch, which folder)
- Setting the correct base URL if the app lives at a subdirectory (e.g. `username.github.io/rich-life-planner/`)
- Any environment variable handling needed for the Supabase URL and anon key in a static site context

---

## Out of scope (for now)

- Push notifications or email reminders
- Couples therapist / facilitator view
- Export to PDF
- Multiple languages
- More than two partners per couple
