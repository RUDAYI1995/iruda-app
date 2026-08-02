"use client";

import { useState } from "react";
import { LudaAlertButton } from "@/components/LudaAlertButton";
import { GlobeDartModal } from "@/components/GlobeDartModal";
import { BillSplitModal } from "@/components/BillSplitModal";

interface ChatEntry {
  role: "user" | "ai";
  text: string;
}

export function AiRudaWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatEntry[]>([
    { role: "ai", text: "닝겐, 뭘 도와줄까냥? 🐾" },
  ]);
  const [extraOpen, setExtraOpen] = useState(false);
  const [globeOpen, setGlobeOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setHistory((h) => [...h, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-ruda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setHistory((h) => [...h, { role: "ai", text: data.reply ?? "냥...?" }]);
    } catch {
      setHistory((h) => [...h, { role: "ai", text: "냥...! 지금 대답하기 어려운 것 같아." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-3 top-1/2 z-40 -translate-y-1/2">
      {open && (
        <div className="mb-2 w-72 rounded-2xl border border-indigo-200 bg-white p-3 shadow-xl dark:border-indigo-900 dark:bg-zinc-950">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">AI루다</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              닫기
            </button>
          </div>
          <div className="mb-2 flex max-h-72 flex-col gap-2 overflow-y-auto">
            {history.map((entry, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                  entry.role === "ai"
                    ? "self-start bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100"
                    : "self-end bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                }`}
              >
                {entry.text}
              </div>
            ))}
            {loading && (
              <div className="self-start rounded-2xl bg-indigo-50 px-3 py-1.5 text-sm text-indigo-400 dark:bg-indigo-950/50">
                냥... 생각 중...
              </div>
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="궁금한 걸 물어봐냥"
              className="min-w-0 flex-1 rounded-full border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            >
              전송
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative block h-16 w-16 overflow-hidden rounded-full border-2 border-indigo-300 shadow-lg transition-transform hover:scale-110"
        title="AI루다에게 물어보기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ai-ruda.png" alt="AI루다" className="h-full w-full object-cover object-top" />
      </button>

      <div className="mt-2 flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExtraOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-300 bg-white text-sm font-bold text-indigo-500 shadow transition-transform hover:scale-110 dark:border-indigo-800 dark:bg-zinc-950 dark:text-indigo-300"
          aria-expanded={extraOpen}
          aria-label="루다알림제 더보기"
        >
          +
        </button>

        {extraOpen && (
          <>
            <LudaAlertButton />

            <button
              type="button"
              onClick={() => setGlobeOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-white text-lg shadow transition-transform hover:scale-110 dark:border-blue-900 dark:bg-zinc-950"
              title="다트 던지기로 여행지 뽑기"
              aria-label="다트 던지기로 여행지 뽑기"
            >
              🌍
            </button>

            <button
              type="button"
              onClick={() => setBillOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white text-lg shadow transition-transform hover:scale-110 dark:border-emerald-900 dark:bg-zinc-950"
              title="정산 계산기"
              aria-label="정산 계산기"
            >
              🧾
            </button>
          </>
        )}
      </div>

      {globeOpen && <GlobeDartModal onClose={() => setGlobeOpen(false)} />}
      {billOpen && <BillSplitModal onClose={() => setBillOpen(false)} />}
    </div>
  );
}
