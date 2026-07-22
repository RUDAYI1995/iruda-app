"use client";

import { useState } from "react";

export function OnlineTravelButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-800 shadow-sm transition-transform hover:scale-105 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
        aria-expanded={open}
      >
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
          <span className="text-sm">🧍</span>
          <span
            className="absolute -right-1 -top-2 text-[11px]"
            style={{ transform: "scaleX(-1) rotate(-25deg)" }}
          >
            🗡️
          </span>
        </span>
        위대한 모험
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-indigo-200 bg-white p-4 text-sm shadow-lg dark:border-indigo-900 dark:bg-zinc-950">
          <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">위대한 모험</p>
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            아직 준비 중인 기능이에요. 곧 채워질 예정이니 조금만 기다려주세요 ⚔️
          </p>
        </div>
      )}
    </div>
  );
}
