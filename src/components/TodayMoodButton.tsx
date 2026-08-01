"use client";

import { useEffect, useState } from "react";
import { MOODS, type Mood } from "@/lib/moods";

export function TodayMoodButton() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);

  useEffect(() => {
    fetch("/api/mood")
      .then((res) => res.json())
      .then((data) => {
        const found = MOODS.find((m) => m.key === data.moodKey);
        if (found) setMood(found);
      })
      .catch(() => {});
  }, []);

  const choose = (m: Mood) => {
    setMood(m);
    setOpen(false);
    fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodKey: m.key }),
    }).catch(() => {});
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-green-300 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-800 shadow-sm transition-transform hover:scale-105 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200"
        aria-expanded={open}
      >
        <span className="text-sm">{mood ? mood.emoji : "🐕"}</span>
        오늘 컨디션
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-green-200 bg-white p-3 shadow-lg dark:border-green-900 dark:bg-zinc-950">
          <p className="mb-2 px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            오늘 내 기분은?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => choose(m)}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 text-white shadow-sm transition-transform hover:scale-[1.03] ${m.bg}`}
              >
                <span className="text-2xl drop-shadow">{m.emoji}</span>
                <span className="text-center text-[11px] font-semibold leading-tight drop-shadow">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
