// Express server for local development
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Image generation endpoint
app.post('/api/generate', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { prompt, size = 512 } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    console.log(`🎨 Generating image for prompt: "${prompt}"`);

    // Option 1: Use Hugging Face API (requires HF_KEY in .env)
    if (process.env.HF_KEY) {
      try {
        const hfResponse = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.HF_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              options: { wait_for_model: true },
              parameters: {
                width: size,
                height: size,
              },
            }),
          }
        );

        if (hfResponse.ok) {
          const arrayBuffer = await hfResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

          console.log('✅ Image generated successfully via Hugging Face');
          return res.status(200).json({
            success: true,
            image: base64Image,
            prompt,
            model: 'Hugging Face Stable Diffusion',
          });
        } else {
          const errorText = await hfResponse.text();
          console.warn('Hugging Face API error, falling back:', errorText);
        }
      } catch (hfError) {
        console.warn('Hugging Face API failed, falling back:', hfError.message);
      }
    }

    // Option 2: Try free API (Pollinations.ai - no key required)
    try {
      console.log('🆓 Using free Pollinations.ai API');
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size}&height=${size}&nologo=true`;
      
      const pollResponse = await fetch(pollinationsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (pollResponse.ok) {
        const arrayBuffer = await pollResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

        console.log('✅ Image generated successfully via Pollinations.ai');
        return res.status(200).json({
          success: true,
          image: base64Image,
          prompt,
          model: 'Pollinations.ai (Free)',
        });
      }
    } catch (pollError) {
      console.warn('Pollinations.ai failed, using placeholder:', pollError.message);
    }

    // Option 3: Fallback - Generate a placeholder SVG image
    console.log('⚠️ Using placeholder SVG');
    const svgPlaceholder = generatePlaceholderSVG(prompt, size);
    const base64SVG = `data:image/svg+xml;base64,${Buffer.from(svgPlaceholder).toString('base64')}`;

    return res.status(200).json({
      success: true,
      image: base64SVG,
      prompt,
      model: 'Placeholder Generator',
      note: 'Set HF_KEY in .env for Hugging Face API, or use free Pollinations.ai',
    });
  } catch (error) {
    console.error('💥 Error generating image:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Text generation endpoint (fallback if needed)
app.post('/api/generate-text', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // If OpenAI API key is set, use it
    if (process.env.OPENAI_API_KEY) {
      const openai = (await import('openai')).default;
      const client = new openai({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      return res.status(200).json({ result: response.choices[0].message.content });
    }

    // Fallback response
    return res.status(200).json({
      result: `This is a placeholder response for: "${prompt}". Set OPENAI_API_KEY in .env for real AI responses.`,
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Generate placeholder SVG
function generatePlaceholderSVG(text, size) {
  const colors = ['#FF5CFF', '#9D4EDD', '#00FFFF', '#FF00FF'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#000;stop-opacity:0.9" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text.substring(0, 30)}</text>
    <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.7)" text-anchor="middle" dominant-baseline="middle">Placeholder Image</text>
  </svg>`;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/generate`);
  console.log(`   POST http://localhost:${PORT}/api/generate-text`);
  if (!process.env.HF_KEY) {
    console.log(`⚠️  Warning: HF_KEY not set. Image generation will use placeholders.`);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.log(`⚠️  Warning: OPENAI_API_KEY not set. Text generation will use placeholders.`);
  }
});
