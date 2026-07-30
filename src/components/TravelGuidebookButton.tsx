"use client";

import { useState } from "react";

const TOTAL_PAGES = 7;

type Phase = "idle" | "folding-close" | "folding-open" | "vanishing";

export function TravelGuidebookButton() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");

  function openBook() {
    setPage(1);
    setPhase("idle");
    setOpen(true);
  }

  function closeBook() {
    setOpen(false);
  }

  function goNext() {
    if (phase !== "idle") return;

    if (page >= TOTAL_PAGES) {
      // 마지막 장: 접히면서 사라짐
      setPhase("vanishing");
      setTimeout(() => {
        setOpen(false);
      }, 380);
      return;
    }

    setPhase("folding-close");
    setTimeout(() => {
      setPage((p) => p + 1);
      setPhase("folding-open");
      setTimeout(() => setPhase("idle"), 320);
    }, 320);
  }

  function goPrev() {
    if (phase !== "idle" || page <= 1) return;
    setPhase("folding-close");
    setTimeout(() => {
      setPage((p) => p - 1);
      setPhase("folding-open");
      setTimeout(() => setPhase("idle"), 320);
    }, 320);
  }

  const animationClass =
    phase === "folding-close"
      ? "animate-guidebook-fold-close"
      : phase === "folding-open"
        ? "animate-guidebook-fold-open"
        : phase === "vanishing"
          ? "animate-guidebook-fold-vanish"
          : "";

  return (
    <div className="relative shrink-0">
      <button
        onClick={openBook}
        className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm transition-transform hover:scale-105 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <span className="text-sm">📖</span>
        여행 가이드북
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
          <button
            onClick={closeBook}
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-700 shadow-md hover:bg-white"
            aria-label="가이드북 닫기"
          >
            ✕
          </button>

          <div
            className="relative w-full max-w-[420px] rounded-[28px] border-[10px] border-amber-800/80 bg-amber-50 p-3 shadow-2xl"
            style={{ boxShadow: "0 0 0 4px #d8b98a inset, 0 25px 60px rgba(0,0,0,0.5)" }}
          >
            <div
              className={`relative overflow-hidden rounded-2xl border-4 border-amber-700/40 bg-white ${animationClass}`}
              style={{ aspectRatio: page <= 3 ? "512 / 512" : "384 / 512" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/guidebook/page-${page}.png`}
                alt={`여행 가이드북 ${page}페이지`}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <button
                onClick={goPrev}
                disabled={page <= 1 || phase !== "idle"}
                className="rounded-full bg-amber-700/90 px-4 py-1.5 text-sm font-medium text-white shadow disabled:opacity-30"
              >
                ◀ 이전
              </button>
              <span className="text-sm font-semibold text-amber-900">
                {page} / {TOTAL_PAGES}
              </span>
              <button
                onClick={goNext}
                disabled={phase !== "idle"}
                className="rounded-full bg-amber-700/90 px-4 py-1.5 text-sm font-medium text-white shadow disabled:opacity-30"
              >
                {page >= TOTAL_PAGES ? "닫기 📖" : "다음 ▶"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
