"use client";

import { useState } from "react";

export function AiExplanation({ initial }: { initial: string | null }) {
  const [explanation, setExplanation] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ai/personality-explain", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setExplanation(data.explanation);
  };

  return (
    <div className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-6 text-left dark:border-violet-900 dark:bg-violet-950/30">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
        AI 성향 해설 (Upstage Solar)
      </p>
      {explanation ? (
        <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{explanation}</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            AI가 내 성향을 자연스럽게 풀어서 설명해드려요.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "해설 생성 중..." : "AI 해설 보기"}
          </button>
        </>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
