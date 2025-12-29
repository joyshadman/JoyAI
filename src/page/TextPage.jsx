// src/pages/TextPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PixelBlast from "../components/PixelBlast";
import { FiLoader, FiCopy, FiTrash2 } from "react-icons/fi";
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

const defaultHistoryKey = "text_prompt_history_v2";

const TextPage = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [infoMsg, setInfoMsg] = useState("");
  const [engine, setEngine] = useState(null);

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
    const next = [p, ...history.filter((x) => x !== p)].slice(0, 6);
    setHistory(next);
    localStorage.setItem(defaultHistoryKey, JSON.stringify(next));
  };

  const clearHistory = () => {
    localStorage.removeItem(defaultHistoryKey);
    setHistory([]);
  };

  const showInfo = (msg) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(""), 2000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showInfo("Copied to clipboard");
    } catch {
      showInfo("Copy failed");
    }
  };

  // ----------- INIT WEBLLM -----------
  useEffect(() => {
    const initEngine = async () => {
      try {
        showInfo("Loading AI model...");
        const eng = await CreateWebWorkerMLCEngine(
          new Worker("/webllm-worker.js"), // classic worker
          {
            model_id: "Qwen/Qwen2.5-1.5B-Instruct",
          }
        );
        setEngine(eng);
        showInfo("Model Loaded ✔");
      } catch (err) {
        console.error(err);
        showInfo("Model failed to load.");
      }
    };

    initEngine();
  }, []);

  // ----------------- GENERATE -------------------
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showInfo("Please enter a prompt");
      return;
    }

    if (!engine) {
      showInfo("Model still loading...");
      return;
    }

    setLoading(true);
    setResult("");
    saveHistory(prompt);

    try {
      const reply = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
      });

      if (reply?.choices?.[0]?.message?.content) {
        setResult(reply.choices[0].message.content);
      } else {
        showInfo("No response from AI");
      }
    } catch (err) {
      console.error(err);
      showInfo("Generation failed");
    } finally {
      setLoading(false);
    }
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
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
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
          Generate AI Text with JoyAI
        </h1>

        <div className="w-full bg-[#0f0311]/80 rounded-2xl p-6 shadow-lg border border-[#3b2038]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt... e.g. Write a short story about a cat in space"
            className="w-full p-4 rounded-xl bg-[#1a001f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5CFF] resize-none mb-4"
            rows={4}
          />

          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex gap-3 items-center flex-wrap">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#FF5CFF] to-[#9D4EDD] hover:from-[#e44fff] hover:to-[#8a3fd6] rounded-xl font-semibold shadow-[0px_0px_40px_rgba(255,92,255,0.5)] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" style={{ animationDuration: "1.6s" }} />
                    Generating...
                  </>
                ) : (
                  "✨ Generate"
                )}
              </button>
            </div>

            <div className="text-sm text-gray-300 flex items-center gap-2 flex-wrap">
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

          {result && (
            <div className="mt-6 bg-[#1a001f]/80 p-4 rounded-xl border border-[#3b2038] text-gray-100 whitespace-pre-wrap">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => copyToClipboard(result)}
                  className="px-3 py-1 text-xs rounded-md bg-[#2b132b]/60 hover:bg-[#2b132b]/90 flex items-center gap-1"
                >
                  <FiCopy /> Copy
                </button>
              </div>
              {result}
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 text-sm bg-gradient-to-r from-[#FF5CFF]/20 to-[#9D4EDD]/20 text-cyan-200 px-4 py-2 rounded-xl border border-[#FF5CFF]/30">
              {infoMsg}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 text-xs text-gray-400 z-40 bg-black/50 backdrop-blur-sm p-3 rounded-xl border border-[#2b132b]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white">JoyAI v1 (WebLLM)</span>
        </div>
        <div className="text-[11px] text-gray-500">
          <p>Experimental Version - Offline AI Text Generator</p>
        </div>
      </div>
    </div>
  );
};

export default TextPage;
