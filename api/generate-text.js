// api/generate-text.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, maxTokens = 300, temperature = 0.7 } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      success: true,
      prompt,
      text,
    });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    return res.status(500).json({ success: false, error: error.message || "OpenAI API error" });
  }
}
