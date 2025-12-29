// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // set in Vercel dashboard
// });

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

//   const { prompt } = req.body;

//   if (!prompt) return res.status(400).json({ error: "Prompt is required" });

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//     });

//     res.status(200).json({ result: response.choices[0].message.content });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
