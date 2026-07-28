"use client";

import { useState } from "react";

export function AssaWorldButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm transition-transform hover:scale-105 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        aria-expanded={open}
      >
        <span className="text-sm">✨</span>
        아싸세상
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-amber-200 bg-white p-4 text-sm shadow-lg dark:border-amber-900 dark:bg-zinc-950">
          <div className="relative mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-amber-100 via-yellow-50 to-white dark:from-amber-950 dark:via-zinc-900 dark:to-zinc-950">
            <div className="absolute h-16 w-16 rounded-full bg-yellow-300/60 blur-xl" />
            <span className="relative text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
              🧍
            </span>
            <span className="absolute right-6 top-4 text-lg">✨</span>
            <span className="absolute left-7 top-6 text-sm">⭐</span>
          </div>
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">아싸세상</p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            혼자여도 반짝반짝 빛나는 나만의 세상이에요. 곧 채워질 예정이에요 ✨
          </p>
        </div>
      )}
    </div>
  );
}
