"use client";

import { useState } from "react";

export function AssaDungeonButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-slate-400 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition-transform hover:scale-105 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-200"
        aria-expanded={open}
      >
        <span className="text-sm">🕳️</span>
        아싸던전
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-slate-300 bg-white p-4 text-sm shadow-lg dark:border-slate-700 dark:bg-zinc-950">
          <div className="relative mb-3 flex h-24 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-slate-200 via-slate-400 to-slate-800 px-4 dark:from-slate-800 dark:via-slate-900 dark:to-black">
            <span className="text-3xl">🧍</span>
            <span className="text-lg text-slate-100">👉</span>
            <span className="text-4xl">🕳️</span>
          </div>
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">아싸던전</p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            혼자서도 씩씩하게, 동굴 너머로 한 걸음씩 전진해요. 곧 채워질 예정이에요 🕳️
          </p>
        </div>
      )}
    </div>
  );
}
