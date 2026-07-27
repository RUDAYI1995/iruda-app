"use client";

import { useState } from "react";

export function CheerButton() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendCheer() {
    if (sending) return;
    setSending(true);
    try {
      await fetch("/api/cheer", { method: "POST" });
      setSent(true);
      setTimeout(() => setSent(false), 1200);
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={sendCheer}
      className="fixed bottom-4 left-4 z-50 rounded-full border border-pink-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-pink-600 shadow-md backdrop-blur transition-transform hover:scale-105 dark:border-pink-700 dark:bg-zinc-800/90 dark:text-pink-300"
    >
      {sent ? "💗 응원 보냈어요!" : "🩷 응원 보내기"}
    </button>
  );
}
