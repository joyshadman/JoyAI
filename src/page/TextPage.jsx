// src/pages/TextPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PixelBlast from "../components/PixelBlast";
import { FiLoader, FiCopy, FiTrash2, FiX } from "react-icons/fi";
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

const defaultHistoryKey = "text_prompt_history_v2";
const defaultResultsKey = "text_results_history_v2";

const TextPage = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [resultsHistory, setResultsHistory] = useState([]);
  const [infoMsg, setInfoMsg] = useState("");
  const [engine, setEngine] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ text: "", progress: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load history and results
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(defaultHistoryKey) || "[]");
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {
      setHistory([]);
    }
    try {
      const savedResults = JSON.parse(localStorage.getItem(defaultResultsKey) || "[]");
      setResultsHistory(Array.isArray(savedResults) ? savedResults : []);
    } catch {
      setResultsHistory([]);
    }
  }, []);

  const saveHistory = (p) => {
    const next = [p, ...history.filter((x) => x !== p)].slice(0, 10);
    setHistory(next);
    localStorage.setItem(defaultHistoryKey, JSON.stringify(next));
  };

  const saveResult = (promptText, resultText) => {
    const newResult = {
      id: Date.now(),
      prompt: promptText,
      result: resultText,
      timestamp: new Date().toISOString(),
    };
    const next = [newResult, ...resultsHistory].slice(0, 20);
    setResultsHistory(next);
    localStorage.setItem(defaultResultsKey, JSON.stringify(next));
  };

  const deleteHistoryItem = (item) => {
    const next = history.filter((h) => h !== item);
    setHistory(next);
    localStorage.setItem(defaultHistoryKey, JSON.stringify(next));
  };

  const deleteResultItem = (id) => {
    const next = resultsHistory.filter((r) => r.id !== id);
    setResultsHistory(next);
    localStorage.setItem(defaultResultsKey, JSON.stringify(next));
  };

  const clearHistory = () => {
    if (showClearConfirm) {
      localStorage.removeItem(defaultHistoryKey);
      localStorage.removeItem(defaultResultsKey);
      setHistory([]);
      setResultsHistory([]);
      setShowClearConfirm(false);
      showInfo("History cleared");
    } else {
      setShowClearConfirm(true);
    }
  };

  const cancelClear = () => {
    setShowClearConfirm(false);
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
        setModelLoading(true);
        setLoadingProgress({ text: "Initializing model...", progress: 0 });
        
        const eng = await CreateWebWorkerMLCEngine(
          new Worker(
            new URL("../workers/webllm-worker.js", import.meta.url),
            { type: "module" }
          ),
          "Qwen2.5-0.5B-Instruct-q4f16_1-MLC", // Smaller, faster model
          {
            initProgressCallback: (report) => {
              const progress = report.progress || 0;
              let progressText = "Loading model...";
              
              if (report.text) {
                progressText = report.text;
              } else if (progress < 0.3) {
                progressText = "Downloading model files...";
              } else if (progress < 0.7) {
                progressText = "Loading model weights...";
              } else if (progress < 0.9) {
                progressText = "Initializing engine...";
              } else {
                progressText = "Almost ready...";
              }
              
              setLoadingProgress({
                text: progressText,
                progress: Math.min(progress * 100, 99),
              });
              console.log("Loading progress:", report);
            },
          }
        );
        setEngine(eng);
        setModelLoading(false);
        setLoadingProgress({ text: "Model loaded successfully!", progress: 100 });
        setTimeout(() => {
          setLoadingProgress({ text: "", progress: 0 });
        }, 2000);
      } catch (err) {
        console.error("WebLLM initialization error:", err);
        setModelLoading(false);
        setLoadingProgress({ text: "", progress: 0 });
        showInfo("Model failed to load. Check console for details.");
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
        const generatedText = reply.choices[0].message.content;
        setResult(generatedText);
        saveResult(prompt, generatedText);
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

  const loadFromHistory = (historyItem) => {
    setPrompt(historyItem);
    showInfo("Prompt loaded");
  };

  const loadFromResults = (resultItem) => {
    setPrompt(resultItem.prompt);
    setResult(resultItem.result);
    showInfo("Result loaded");
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

        {/* Model Loading Progress */}
        {modelLoading && (
          <div className="w-full max-w-5xl mb-6 bg-[#0f0311]/90 rounded-2xl p-6 shadow-lg border border-[#3b2038]">
            <div className="flex items-center gap-4 mb-4">
              <FiLoader className="animate-spin text-[#FF5CFF]" size={24} />
              <div className="flex-1">
                <div className="text-sm text-gray-300 mb-2">{loadingProgress.text}</div>
                <div className="w-full bg-[#1a001f] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5CFF] to-[#9D4EDD] transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {Math.round(loadingProgress.progress)}%
                </div>
              </div>
            </div>
          </div>
        )}

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
              <div className="flex gap-2 flex-wrap items-center max-w-full">
                {history.map((h) => (
                  <div
                    key={h}
                    className="flex items-center bg-[#2b132b]/60 rounded-md overflow-hidden text-xs max-w-[220px]"
                  >
                    <button
                      onClick={() => loadFromHistory(h)}
                      className="px-3 py-1 hover:bg-[#2b132b]/90 transition-colors truncate"
                      title="Click to reuse"
                    >
                      {h.length > 18 ? h.slice(0, 18) + "…" : h}
                    </button>
                    <button
                      onClick={() => deleteHistoryItem(h)}
                      className="px-2 py-1 border-l border-[#3b2038] hover:bg-red-500/40 text-red-300 transition-colors"
                      title="Delete this prompt"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    title="Clear history"
                    className="px-2 py-1 rounded-md bg-red-500/20 hover:bg-red-500/40 text-xs transition-colors border border-red-500/30"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          </div>

          {result && (
            <div className="mt-6 bg-[#1a001f]/80 p-4 rounded-xl border border-[#3b2038] text-gray-100 whitespace-pre-wrap">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-400">Generated Result</div>
                <button
                  onClick={() => copyToClipboard(result)}
                  className="px-3 py-1 text-xs rounded-md bg-[#2b132b]/60 hover:bg-[#2b132b]/90 flex items-center gap-1"
                >
                  <FiCopy /> Copy
                </button>
              </div>
              <div className="text-gray-100">{result}</div>
            </div>
          )}

          {/* Results History */}
          {resultsHistory.length > 0 && (
            <div className="mt-6 bg-[#1a001f]/60 rounded-xl border border-[#3b2038] p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Previous Results ({resultsHistory.length})</h3>
                <button
                  onClick={() => setResultsHistory([])}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Hide
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resultsHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0a0510]/50 rounded-lg p-3 border border-[#2b132b] hover:border-[#FF5CFF]/30 transition-colors flex items-start gap-2"
                  >
                    <button
                      className="flex-1 text-left cursor-pointer"
                      onClick={() => loadFromResults(item)}
                    >
                      <div className="text-xs text-gray-400 mb-1 truncate">{item.prompt}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {item.result.substring(0, 100)}...
                      </div>
                    </button>
                    <button
                      onClick={() => deleteResultItem(item.id)}
                      className="ml-1 text-red-300 hover:text-red-400 p-1 rounded-full hover:bg-red-500/20 transition-colors"
                      title="Delete this result"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 text-sm bg-gradient-to-r from-[#FF5CFF]/20 to-[#9D4EDD]/20 text-cyan-200 px-4 py-2 rounded-xl border border-[#FF5CFF]/30">
              {infoMsg}
            </div>
          )}
        </div>

        {/* Clear History Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f0311] rounded-2xl p-6 border border-[#3b2038] max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#FF5CFF]">Clear History?</h3>
                <button
                  onClick={cancelClear}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to clear all history and saved results? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelClear}
                  className="flex-1 px-4 py-2 bg-[#2b132b] hover:bg-[#3b1a3b] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg transition-colors text-red-400"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}
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
