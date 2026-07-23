"use client";

import { useState } from "react";

export function LudariaButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-yellow-300 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-800 shadow-sm transition-transform hover:scale-105 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200"
        aria-expanded={open}
      >
        <span className="text-sm">🍔</span>
        루다리아
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-yellow-200 bg-white p-4 text-sm shadow-lg dark:border-yellow-900 dark:bg-zinc-950">
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">루다리아</p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            곧 채워질 예정이에요. 조금만 기다려주세요 🍔
          </p>
        </div>
      )}
    </div>
  );
}
