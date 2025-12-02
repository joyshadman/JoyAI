import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FiLoader, FiCopy } from "react-icons/fi";

const defaultHistoryKey = "text_prompt_history_v1";

const TextPage = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [infoMsg, setInfoMsg] = useState("");

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

  const showInfo = (msg) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(""), 1500);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showInfo("Copied to clipboard");
    } catch {
      showInfo("Copy failed");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showInfo("Please enter a prompt");
      return;
    }

    setLoading(true);
    setResult("");
    saveHistory(prompt);

    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Failed to generate");

      setResult(data.text);
    } catch (err) {
      console.error("❌ Generation failed:", err.message);
      showInfo("Generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pt-28 px-4 bg-black text-white">
      <Navbar />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center mb-20">
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

          <div className="flex gap-4 items-center">
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

            <div className="text-sm text-gray-300 flex items-center gap-2">
              <span>History:</span>
              <div className="flex gap-2 flex-wrap">
                {history.map((h) => (
                  <button
                    key={h}
                    onClick={() => setPrompt(h)}
                    className="px-3 py-1 text-xs rounded-md bg-[#2b132b]/60 hover:bg-[#2b132b]/90 transition-colors"
                  >
                    {h.length > 18 ? h.slice(0, 18) + "…" : h}
                  </button>
                ))}
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
    </div>
  );
};

export default TextPage;
