"use client";

import { useState } from "react";

export function ShyCareButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-800 shadow-sm transition-transform hover:scale-105 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
        aria-expanded={open}
      >
        <span className="relative inline-flex h-4 w-5 shrink-0 items-center justify-center text-sm">
          <span className="absolute -top-1 left-0 -rotate-12">☂️</span>
          <span className="absolute -bottom-0.5 right-0 text-[10px]">🧍</span>
        </span>
        소심케어제
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-violet-200 bg-white p-4 text-sm shadow-lg dark:border-violet-900 dark:bg-zinc-950">
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">소심케어제</p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            곧 채워질 예정이에요. 조금만 기다려주세요 ☂️
          </p>
        </div>
      )}
    </div>
  );
}
