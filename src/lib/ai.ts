export type AiResult = { text: string; simulated: boolean };

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
    return { text: simulated, simulated: true };
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

  return { text: content, simulated: false };
}
