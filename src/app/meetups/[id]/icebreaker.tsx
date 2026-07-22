"use client";

import { useState } from "react";

export function Icebreaker({ meetupId }: { meetupId: string }) {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ai/icebreaker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetupId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSuggestions(data.suggestions);
  };

  return (
    <div className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/30">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
        AI 대화 시작 멘트 추천 (Upstage Solar)
      </p>

      {suggestions ? (
        <ul className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="rounded-xl bg-white px-4 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            먼저 말 걸기 어렵다면, AI가 어색하지 않은 첫 마디를 추천해드려요.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "추천 생성 중..." : "첫 마디 추천받기"}
          </button>
        </>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
