"use client";

import { useState } from "react";

export function TravelGuidebookButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm transition-transform hover:scale-105 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        aria-expanded={open}
      >
        <span className="text-sm">📖</span>
        여행 가이드북
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-amber-200 bg-white p-4 text-sm shadow-lg dark:border-amber-900 dark:bg-zinc-950">
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
            소심한 사람들을 위한 여행 미션 가이드북
          </p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            곧 채워질 예정이에요. 조금만 기다려주세요 📚
          </p>
        </div>
      )}
    </div>
  );
}
