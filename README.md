# JoyAI - AI Project with Vite

A React + Vite project featuring AI-powered text and image generation using WebLLM and Hugging Face APIs.

## Features

- 🤖 **AI Text Generation**: Offline text generation using WebLLM (runs entirely in the browser)
- 🎨 **AI Image Generation**: Generate images using Hugging Face Stable Diffusion API
- 💫 **Modern UI**: Beautiful, responsive interface with animated backgrounds
- 🚀 **Fast Development**: Hot module replacement with Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Hugging Face API key for image generation
- (Optional) OpenAI API key for cloud text generation (WebLLM works offline)

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up environment variables:
Create a `.env` file in the root directory:
```env
HF_KEY=your_huggingface_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

Get your API keys:
- Hugging Face: https://huggingface.co/settings/tokens
- OpenAI: https://platform.openai.com/api-keys

### Running the Project

**Option 1: Run both frontend and backend together (Recommended)**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1: Start the API server
npm run server

# Terminal 2: Start the Vite dev server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173 (or the port Vite assigns)
- API Server: http://localhost:3000

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
├── api/                 # API endpoint files (for Vercel deployment)
├── public/             # Static assets
│   ├── webllm-worker.js    # WebLLM worker script
│   └── webllm-runtime.js   # WebLLM runtime script
├── src/
│   ├── components/     # React components
│   ├── page/          # Page components
│   │   ├── Homepage.jsx
│   │   ├── Promptpage.jsx  # Image generation page
│   │   └── TextPage.jsx    # Text generation page
│   └── App.jsx        # Main app component
├── server.js          # Express server for local development
└── vite.config.js    # Vite configuration

```

## Usage

### AI Text Generation

1. Navigate to `/prompt` route
2. Enter your text prompt
3. Click "Generate"
4. The AI model will load (first time only) and generate text

**Note**: Text generation uses WebLLM which runs entirely in your browser. The model downloads on first use (~1.5GB for Qwen2.5-1.5B-Instruct-q4f16_1-MLC). You can change the model in `src/page/TextPage.jsx` - check [WebLLM Models](https://mlc.ai/models) for available models.

### AI Image Generation

1. Navigate to `/promptpage` route
2. Enter an image description
3. Adjust settings (size, quality, steps)
4. Click "Generate (3 images)"
5. Wait for images to generate

**Note**: Image generation requires a Hugging Face API key. Without it, placeholder images will be generated.

## Routes

- `/` or `/home` - Homepage
- `/prompt` - AI Text Generation
- `/promptpage` - AI Image Generation

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **WebLLM** - Browser-based LLM inference
- **Express** - API server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Hugging Face API** - Image generation
- **OpenAI API** - (Optional) Cloud text generation

## Troubleshooting

### WebLLM Model Not Loading
- Ensure you have a stable internet connection (for initial model download)
- Check browser console for errors
- Try refreshing the page

### Image Generation Not Working
- Verify your `HF_KEY` is set in `.env`
- Check that the API server is running on port 3000
- Check browser console and server logs for errors

### API Server Not Starting
- Ensure port 3000 is not already in use
- Check that all dependencies are installed: `npm install`
- Verify Node.js version is 18+

## Deployment

### Vercel Deployment

The project includes `vercel.json` for serverless function deployment. The API endpoints in the `api/` folder will work as Vercel serverless functions.

### Environment Variables

Make sure to set these in your deployment platform:
- `HF_KEY` - Hugging Face API key
- `OPENAI_API_KEY` - OpenAI API key (optional)

## License

MIT
