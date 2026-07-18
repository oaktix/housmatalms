export type AiResult = { text: string; simulated: boolean };

/**
 * Strips common "AI slop" from model output so summaries/readouts render cleanly:
 *  - Markdown emphasis markers (**bold**, *italic*) left as plain text
 *  - Em dashes (—) and en dashes (–) normalized to a hyphen or colon context
 *  - Docusaurus/Markdown horizontal rules (---, ***, ___) removed
 *  - Stray leading list markers cleaned, collapse excessive blank lines
 */
export function cleanAiText(raw: string): string {
  if (!raw) return "";
  let text = raw;

  // Remove Markdown horizontal rules (---, ***, ___) on their own line
  text = text.replace(/^\s*([-*_])(\s*\1){2,}\s*$/gm, "");

  // Remove Markdown bold/italic emphasis markers (keep the inner text)
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");

  // Normalize em/en dashes to a regular hyphen with surrounding spaces trimmed.
  // Keep a dash between numbers (e.g. 2020-2024) intact.
  text = text.replace(/(?<!\d)\s*[—–]+\s*(?!\d)/g, " - ");
  text = text.replace(/\s*[—–]+\s*/g, " - ");

  // Tidy bullet lines: collapse "** -" or "* -" or "- -" artifacts and trim
  text = text
    .split("\n")
    .map((line) => {
      let l = line.trim();
      // Remove a leading marker that the model added then removed via cleaning
      l = l.replace(/^[-•·]\s*[-–—]\s*/, "• ");
      l = l.replace(/^[-•·]\s*/, "• ");
      return l;
    })
    .join("\n");

  // Collapse 3+ blank lines into a single blank line and trim overall
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

type CallOpenRouterOptions = {
  system: string;
  user: string;
  temperature?: number;
  fallback?: () => string;
};

/**
 * Single entry point for all OpenRouter-backed AI features.
 * Reads OPENROUTER_API_KEY / OPENROUTER_MODEL from the server environment.
 * When the key is absent it returns the provided fallback (simulation mode),
 * so every consumer works in local/dev without a key.
 */
export async function callOpenRouter(
  request: Request,
  opts: CallOpenRouterOptions
): Promise<AiResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

  if (!apiKey) {
    const simulated = opts.fallback ? opts.fallback() : "";
    console.log(`[OPENROUTER SIMULATION] (No API key)
${simulated}`);
    return { text: cleanAiText(simulated), simulated: true };
  }

  const host = request.headers.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const referer = `${protocol}://${host}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": "Housmata LMS",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      temperature: opts.temperature ?? 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[OPENROUTER ERROR] Non-OK response:", res.status, text);
    if (opts.fallback) return { text: opts.fallback(), simulated: true };
    throw new Error(`OpenRouter request failed (${res.status})`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    console.error("[OPENROUTER ERROR] Unexpected response shape:", data);
    if (opts.fallback) return { text: opts.fallback(), simulated: true };
    throw new Error("OpenRouter returned an empty response");
  }

  return { text: cleanAiText(content), simulated: false };
}
