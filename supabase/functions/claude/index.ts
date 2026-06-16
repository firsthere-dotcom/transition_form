// Supabase Edge Function: Claude proxy for the Rich Life Planner.
//
// Keeps the Anthropic API key server-side (Supabase secret ANTHROPIC_API_KEY).
// The client posts { action, payload } and receives { text } — 3-4 observations
// for a module reveal, or 2-3 for a post-reveal reflection.
//
// Deploy:  supabase functions deploy claude --no-verify-jwt
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// --no-verify-jwt is used because the function is safe to call with the public
// anon key and does not touch the database. If you prefer JWT verification,
// remove the flag and pass the user's access token from the client.

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- prompt builders (text drawn from transition-form-plan.md) ----

function answersToText(answers: Record<string, unknown>): string {
  // answers shape: { required: {...} | {order:[...]}, optional: {...} }
  const lines: string[] = [];
  const req = (answers?.required ?? {}) as Record<string, unknown>;
  if (Array.isArray((req as any).order)) {
    (req as any).order.forEach((c: string, i: number) => lines.push(`${i + 1}. ${c}`));
  } else {
    for (const v of Object.values(req)) if (v) lines.push(String(v));
  }
  const opt = (answers?.optional ?? {}) as Record<string, unknown>;
  for (const v of Object.values(opt)) if (v) lines.push(`(further) ${String(v)}`);
  return lines.join("\n") || "(no answer)";
}

function buildRevealPrompt(p: any): string {
  const pack = (who: any) =>
    (who.answers || [])
      .map((e: any) => `  ${e.exercise}:\n${answersToText(e.answers)}`)
      .join("\n\n");
  return (
    `Two partners have completed the ${p.moduleName} module. Here are their answers:\n\n` +
    `${p.partner1.name || "Partner 1"}:\n${pack(p.partner1)}\n\n` +
    `${p.partner2.name || "Partner 2"}:\n${pack(p.partner2)}\n\n` +
    `Generate 3-4 observations or conversation starter questions tailored to their specific answers. ` +
    `Look for: things they both want that they may not have discussed explicitly; meaningful differences; ` +
    `unspoken assumptions or unexplored tensions. ` +
    (p.moduleName === "Transitions"
      ? `Note whether both partners seem to be in a similar emotional place or whether one appears further along. `
      : "") +
    `Tone: warm, curious, open-ended. Not therapeutic or leading. ` +
    `Return each observation on its own line, with no preamble and no numbering.`
  );
}

function buildReflectionPrompt(p: any): string {
  const refl = (p.reflections || [])
    .map((r: any) => `${r.who}: ${r.text}`)
    .join("\n");
  return (
    `Two partners completed the ${p.exerciseName} exercise and have now added post-reveal reflections.\n\n` +
    `Original answers:\n${p.partner1Original || "(none)"}\n---\n${p.partner2Original || "(none)"}\n\n` +
    `Reflections added so far:\n${refl || "(none)"}\n\n` +
    `Generate 2-3 short observations noticing what has shifted, what seems to be converging between them, ` +
    `and what remains unresolved or worth exploring further. Tone: observational, not directive. ` +
    `Return each observation on its own line, with no preamble and no numbering.`
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY not set" }, 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const { action, payload } = body || {};
  let prompt: string;
  if (action === "reveal") prompt = buildRevealPrompt(payload);
  else if (action === "reflection") prompt = buildReflectionPrompt(payload);
  else return json({ error: "unknown action" }, 400);

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return json({ error: "anthropic error", detail: errText }, 502);
    }
    const data = await res.json();
    const text = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
