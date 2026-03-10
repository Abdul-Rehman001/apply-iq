import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

// Free tier — fast and generous (14,400 req/day)
// llama-3.3-70b-versatile = best quality on free tier
// llama-3.1-8b-instant = faster, lighter alternative
const modelId = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

console.log("Groq ready — model:", modelId);

const maxRetries = 3;

export async function generateContent(prompt: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Groq attempt ${attempt + 1}/${maxRetries + 1}`);

      const response = await client.chat.completions.create({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Lower = more consistent JSON output
        max_tokens: 1024,
      });

      const text = response.choices[0]?.message?.content ?? "";
      console.log("✅ Groq success");
      return text;

    } catch (error: unknown) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Groq error (attempt ${attempt + 1}):`, msg);

      const isRateLimit =
        msg.includes("429") ||
        msg.includes("rate_limit") ||
        msg.includes("Too Many Requests");

      const isQuotaDepleted =
        msg.includes("quota") ||
        msg.includes("billing") ||
        msg.includes("exceeded your");

      if (isQuotaDepleted) {
        throw new Error("Groq daily quota exhausted. Try again tomorrow.");
      }

      if (isRateLimit && attempt < maxRetries) {
        const delayMs = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s
        console.warn(`Rate limited — waiting ${delayMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}