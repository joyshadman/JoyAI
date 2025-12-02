// src/pages/Promptpage.jsx
import React, { useEffect, useState } from "react";
import PixelBlast from "../components/PixelBlast";
import Navbar from "../components/Navbar";
import { FiLoader, FiDownload, FiCopy, FiTrash2, FiRefreshCw } from "react-icons/fi";

/**
 * Promptpage - AI Image generator with Vercel backend
 * Uses secure serverless function to protect API tokens
 */

// Helper function to get API URL
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api/generate';
  }
  return '/api/generate';
};

const defaultHistoryKey = "prompt_history_v2";

const Promptpage = () => {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [size, setSize] = useState(512);
  const [quality, setQuality] = useState(0.8);
  const [steps, setSteps] = useState(20);
  const [history, setHistory] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [infoMsg, setInfoMsg] = useState("");
  const [retryCount, setRetryCount] = useState({});

  // Load history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(defaultHistoryKey) || "[]");
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const saveHistory = (p) => {
    try {
      const next = [p, ...history.filter((x) => x !== p)].slice(0, 6);
      setHistory(next);
      localStorage.setItem(defaultHistoryKey, JSON.stringify(next));
    } catch (e) {
      console.warn("Could not save history", e);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(defaultHistoryKey);
    setHistory([]);
  };

  // Download image
  const downloadImage = (dataUrl, filename = "ai-image.png") => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showInfo("Copied to clipboard");
    } catch {
      showInfo("Copy failed");
    }
  };

  const showInfo = (msg) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(""), 1500);
  };

  // Generate single image via Vercel function - FIXED VALIDATION
  const generateSingleImage = async (promptText, imageId) => {
    const apiUrl = getApiUrl();
    
    console.log(`🚀 API: ${apiUrl}, Prompt: "${promptText}"`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText, 
          size, 
          quality, 
          steps 
        }),
      });
      
      const data = await response.json();
      console.log('📦 FULL API RESPONSE:', data); // Log everything!
      
      // Check if API call was successful
      if (!data.success) {
        throw new Error(data.error || 'API returned failure');
      }
      
      // ✅ FIXED: Check if image exists
      if (!data.image) {
        console.error('❌ No image in response:', data);
        throw new Error(data.note || 'No image data received');
      }
      
      // ✅ FIXED: Accept PNG, JPEG, or SVG
      const isValidImage = 
        data.image.startsWith('data:image/png') ||
        data.image.startsWith('data:image/jpeg') ||
        data.image.startsWith('data:image/jpg') ||
        data.image.startsWith('data:image/gif') ||
        data.image.startsWith('data:image/svg+xml');
      
      if (!isValidImage) {
        console.error('❌ Invalid image format:', data.image?.substring(0, 100));
        throw new Error('Invalid image format. Got: ' + data.image?.substring(0, 50));
      }
      
      console.log('✅ Valid image received:', data.image.substring(0, 80));
      
      return {
        id: imageId,
        dataUrl: data.image,
        status: 'done',
        errorMsg: null
      };

    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      
      return {
        id: imageId,
        dataUrl: null,
        status: 'error',
        errorMsg: error.message || 'Failed to generate image'
      };
    }
  };

  // Retry a failed image
  const retryImage = async (imageId) => {
    console.log(`🔄 Retrying image ${imageId}`);
    
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, status: 'pending', errorMsg: null }
        : img
    ));

    const updatedImage = await generateSingleImage(prompt, imageId);
    setImages(prev => prev.map(img => 
      img.id === imageId ? updatedImage : img
    ));
    
    // Track retries
    setRetryCount(prev => ({
      ...prev,
      [imageId]: (prev[imageId] || 0) + 1
    }));
  };

  // Main generate handler (3 concurrent images)
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showInfo("Please enter a prompt");
      return;
    }

    console.log('🎨 Starting generation of 3 images...');
    setInfoMsg("");
    setLoadingAll(true);
    setImages([]);
    saveHistory(prompt);

    // Create placeholders for 3 images
    const placeholders = Array.from({ length: 3 }).map((_, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      dataUrl: null,
      status: "pending",
      errorMsg: null,
    }));
    setImages(placeholders);

    // Generate each image with slight delay between them
    const promises = placeholders.map(async (ph, i) => {
      // Stagger requests: 0ms, 300ms, 600ms delay
      if (i > 0) await new Promise((r) => setTimeout(r, i * 300));
      
      console.log(`🖼️ Generating image ${i + 1}/3...`);
      const result = await generateSingleImage(prompt, ph.id);
      
      // Update specific image in state
      setImages(prev => prev.map(it => it.id === ph.id ? result : it));
      
      return result;
    });

    // Wait for all 3 images to finish
    await Promise.all(promises);
    console.log('✅ All 3 images completed');
    setLoadingAll(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-start pt-28 px-4 bg-black text-white">
      <Navbar />

      <PixelBlast
        variant="circle"
        pixelSize={6}
        color="#FF5CFF"
        patternScale={3}
        patternDensity={1.5}
        pixelSizeJitter={0.6}
        enableRipples
        rippleSpeed={0.5}
        rippleThickness={0.15}
        rippleIntensityScale={2}
        liquid
        liquidStrength={0.15}
        liquidRadius={1.5}
        liquidWobbleSpeed={6}
        speed={0.8}
        edgeFade={0.2}
        transparent={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,92,255,0.12), transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,255,255,0.06), transparent 50%)",
          zIndex: 1,
        }}
      />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FF5CFF] text-center drop-shadow-lg mt-10">
          Generate AI Images with JoyAI
        </h1>

        <div className="w-full bg-[#0f0311]/80 rounded-2xl p-6 shadow-lg border border-[#3b2038]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your image... e.g. cyberpunk city at sunset, neon reflections, cinematic"
            className="w-full p-4 rounded-xl bg-[#1a001f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5CFF] resize-none mb-4"
            rows={4}
          />

          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex flex-col text-sm">
                <label className="text-xs text-gray-300 mb-1">Size: {size}px</label>
                <input
                  type="range"
                  min="512"
                  max="1024"
                  step="128"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-40 slider-neon"
                />
              </div>

              <div className="flex flex-col text-sm">
                <label className="text-xs text-gray-300 mb-1">Quality: {Math.round(quality * 100)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-40 slider-neon"
                />
              </div>

              <div className="flex flex-col text-sm">
                <label className="text-xs text-gray-300 mb-1">Steps: {steps}</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-40 slider-neon"
                />
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={handleGenerate}
                disabled={loadingAll}
                className="px-6 py-3 bg-gradient-to-r from-[#FF5CFF] to-[#9D4EDD] hover:from-[#e44fff] hover:to-[#8a3fd6] rounded-xl font-semibold shadow-[0px_0px_40px_rgba(255,92,255,0.5)] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingAll ? (
                  <>
                    <FiLoader className="animate-spin" style={{ animationDuration: "1.6s" }} /> 
                    Generating...
                  </>
                ) : (
                  '✨ Generate (3 images)'
                )}
              </button>

              <div className="text-sm text-gray-300 flex items-center gap-2">
                <span>History:</span>
                <div className="flex gap-2 flex-wrap">
                  {history.map((h) => (
                    <button
                      key={h}
                      onClick={() => setPrompt(h)}
                      className="px-3 py-1 text-xs rounded-md bg-[#2b132b]/60 hover:bg-[#2b132b]/90 transition-colors"
                      title="Click to reuse"
                    >
                      {h.length > 18 ? h.slice(0, 18) + "…" : h}
                    </button>
                  ))}
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      title="Clear history"
                      className="px-2 py-1 rounded-md bg-[#2b132b]/40 hover:bg-[#2b132b]/70 text-xs transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images grid */}
        <div className="w-full mt-8">
          {images.length === 0 && !loadingAll && (
            <div className="text-center text-gray-400 p-8 rounded-2xl bg-[#0a0510]/50 border border-[#2b132b]">
              <div className="text-lg mb-2">✨ Ready to Generate</div>
              <p className="text-sm">Enter a prompt above and click "Generate" to create 3 unique images</p>
              <p className="text-xs text-gray-500 mt-2">Powered by JoyAI - Accepts PNG, JPEG, and SVG images</p>
            </div>
          )}

          <div className={`grid gap-6 ${images.length ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : ""} mt-4`}>
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group bg-[#0c0410] rounded-2xl overflow-hidden border border-[#2b132b] shadow-xl transition-all duration-300 hover:border-[#FF5CFF]/50 hover:shadow-[0_0_30px_rgba(255,92,255,0.2)]"
              >
                {/* Placeholder / spinner / error */}
                {img.status !== "done" && (
                  <div className="w-full h-64 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0510] to-[#07030a] p-4">
                    {img.status === "pending" ? (
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ 
                            boxShadow: "0 0 40px rgba(255,92,255,0.5)",
                            background: "radial-gradient(circle, rgba(255,92,255,0.1), transparent)"
                          }}
                        >
                          <div className="w-10 h-10 rounded-full border-4 border-[#FF5CFF] border-t-transparent animate-spin" />
                        </div>
                        <div className="text-sm text-gray-300">Generating...</div>
                        <div className="text-xs text-gray-500">Image {img.id.split('-')[2]}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-red-400 text-lg mb-2">⚠️ Error</div>
                        <div className="text-sm text-gray-300 mb-4 px-2">{img.errorMsg || "Failed to generate"}</div>
                        <button
                          onClick={() => retryImage(img.id)}
                          className="px-4 py-2 bg-[#2b132b] hover:bg-[#3b1a3b] rounded-lg flex items-center gap-2 text-sm"
                        >
                          <FiRefreshCw /> Retry
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {img.status === "done" && (
                  <>
                    <img
                      src={img.dataUrl}
                      alt="ai result"
                      className="w-full h-64 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                      onClick={() => {
                        console.log('🔍 IMAGE DEBUG:', {
                          type: img.dataUrl?.substring(0, 50),
                          length: img.dataUrl?.length
                        });
                        setModalImg(img.dataUrl);
                      }}
                      onError={(e) => {
                        console.error('❌ IMAGE LOAD ERROR:', {
                          src: img.dataUrl?.substring(0, 100),
                          error: e
                        });
                        // Show error overlay
                        e.target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'w-full h-64 flex items-center justify-center bg-red-900/20';
                        errorDiv.innerHTML = '<div class="text-center"><div class="text-red-400">Image Error</div><div class="text-xs text-gray-400">Click retry</div></div>';
                        e.target.parentNode.appendChild(errorDiv);
                      }}
                      loading="lazy"
                    />
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={() => {
                          console.log('📥 Downloading:', img.id);
                          downloadImage(img.dataUrl, `joyai-${Date.now()}.png`);
                        }}
                        className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#3b2038] hover:border-[#FF5CFF] hover:bg-black/90 transition-all"
                        title="Download"
                      >
                        <FiDownload />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-400 mb-2">
                        {img.dataUrl?.includes('svg') ? 'Abstract Art' : 'AI Generated'}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToClipboard(prompt)}
                          className="px-3 py-2 text-xs rounded-lg bg-[#2b132b]/60 hover:bg-[#2b132b]/90 flex items-center gap-2 transition-colors"
                        >
                          <FiCopy /> Copy Prompt
                        </button>
                        <button
                          onClick={() => {
                            const ext = img.dataUrl?.includes('svg') ? 'svg' : 'png';
                            downloadImage(img.dataUrl, `joyai-${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.${ext}`);
                          }}
                          className="px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-[#FF5CFF] to-[#9D4EDD] hover:from-[#e44fff] hover:to-[#8a3fd6] flex items-center gap-2 transition-all"
                        >
                          <FiDownload /> Download
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info message */}
        {infoMsg && (
          <div className="mt-4 text-sm bg-gradient-to-r from-[#FF5CFF]/20 to-[#9D4EDD]/20 text-cyan-200 px-4 py-2 rounded-xl border border-[#FF5CFF]/30">
            {infoMsg}
          </div>
        )}

        {/* Fullscreen Modal */}
        {modalImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setModalImg(null)} />
            <div className="relative z-10 max-w-4xl w-full rounded-2xl overflow-hidden border border-[#3b2038] animate-scaleUp">
              <img 
                src={modalImg} 
                alt="full preview" 
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  console.error('Modal image failed:', modalImg?.substring(0, 100));
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <div className="p-6 flex justify-between items-center bg-gradient-to-r from-[#0c0410] to-[#1a001f] border-t border-[#3b2038]">
                <div className="flex gap-3">
                  <button 
                    onClick={() => downloadImage(modalImg, `joyai-full-${Date.now()}.png`)} 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FF5CFF] to-[#9D4EDD] rounded-lg font-medium hover:shadow-[0_0_20px_rgba(255,92,255,0.5)] transition-all"
                  >
                    Download HD
                  </button>
                  <button 
                    onClick={() => { copyToClipboard(prompt); }} 
                    className="px-5 py-2.5 bg-[#2b132b] rounded-lg font-medium hover:bg-[#3b1a3b] transition-colors"
                  >
                    Copy Prompt
                  </button>
                </div>
                <button 
                  onClick={() => setModalImg(null)} 
                  className="px-5 py-2.5 bg-[#222] hover:bg-[#333] rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-4 text-xs text-gray-400 z-40 bg-black/50 backdrop-blur-sm p-3 rounded-xl border border-[#2b132b]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white">JoyAI v1</span>
        </div>
        <div className="text-[11px] text-gray-500">
          <p>Experimental Version - Supports multiple image formats</p>
        </div>
      </div>
    </div>
  );
};

export default Promptpage;