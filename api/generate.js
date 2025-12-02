// api/generate.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, size = 512 } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    console.log(`🎨 Generating image for prompt: "${prompt}"`);

    // Call Hugging Face text-to-image model
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
        parameters: {
          width: size,
          height: size,
        },
      }),
    });

    // Check if response is ok
    if (!hfResponse.ok) {
      const text = await hfResponse.text();
      console.error("Hugging Face API error:", text);
      return res.status(500).json({ success: false, error: text });
    }

    // Get image bytes
    const arrayBuffer = await hfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    console.log("✅ Image generated successfully");

    return res.status(200).json({
      success: true,
      image: base64Image,
      prompt,
      model: "Hugging Face Stable Diffusion",
    });
  } catch (error) {
    console.error("💥 Error generating image:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
