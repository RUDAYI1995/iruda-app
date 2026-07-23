"use client";

import { useState } from "react";

export function LudapiaButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1.5 rounded-full border border-slate-400 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition-transform hover:scale-105 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-200"
        aria-expanded={open}
      >
        <span className="relative text-sm">
          🕴️
          <span className="absolute -right-2 -top-1 text-[10px]">🔫</span>
          <span className="absolute -right-3 -top-3 text-[9px]">💨</span>
        </span>
        루다피아
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-slate-300 bg-white p-4 text-sm shadow-lg dark:border-slate-700 dark:bg-zinc-950">
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">루다피아</p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            곧 채워질 예정이에요. 조금만 기다려주세요 🕴️
          </p>
        </div>
      )}
    </div>
  );
}
