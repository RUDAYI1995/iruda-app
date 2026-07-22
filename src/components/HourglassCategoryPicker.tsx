"use client";

import { useState } from "react";
import { WorldMapModal } from "./WorldMapModal";

export interface HourglassCategory {
  slug: string;
  label: string;
  emoji: string;
}

const RADIUS = 168;
const DURATION = 26; // 초
const GRAIN_COUNT = 7;

function scrollToCategory(slug: string) {
  document.getElementById(`category-${slug}`)?.scrollIntoView({ behavior: "smooth" });
}

export function HourglassCategoryPicker({ categories }: { categories: HourglassCategory[] }) {
  const [selected, setSelected] = useState<HourglassCategory | null>(null);

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <p className="text-sm font-semibold text-amber-950 drop-shadow-sm">
        모래시계 속 카테고리를 눌러보세요
      </p>
      <div
        className="relative"
        style={{
          width: 400,
          height: 520,
          clipPath:
            "polygon(2% 0%, 98% 0%, 98% 6%, 54% 50%, 98% 94%, 98% 100%, 2% 100%, 2% 94%, 46% 50%, 2% 6%)",
          background:
            "linear-gradient(180deg, rgba(253,224,71,0.18) 0%, rgba(253,224,71,0.05) 48%, rgba(253,224,71,0.05) 52%, rgba(253,224,71,0.18) 100%)",
        }}
      >
        <div className="absolute inset-0 rounded-[36px] ring-1 ring-amber-300/40" />

        {/* 위쪽 모래 더미 (깔때기 모양) */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "8%",
            width: 0,
            height: 0,
            borderLeft: "56px solid transparent",
            borderRight: "56px solid transparent",
            borderTop: "44px solid rgba(180,83,9,0.45)",
          }}
        />

        {/* 아래쪽 쌓인 모래 더미 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-t-full"
          style={{
            bottom: "7%",
            width: 110,
            height: 46,
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(217,119,6,0.55), rgba(180,83,9,0.35) 70%, transparent 100%)",
          }}
        />

        {/* 흘러내리는 모래 줄기 */}
        {Array.from({ length: GRAIN_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 h-1 w-1 rounded-full bg-amber-500/80"
            style={{
              animation: `sand-fall 1.6s linear infinite`,
              animationDelay: `${(i * 1.6) / GRAIN_COUNT}s`,
              animationFillMode: "both",
              marginLeft: `${(i % 3) - 1}px`,
            }}
          />
        ))}

        {categories.map((cat, i) => {
          const delay = -((DURATION / categories.length) * i);
          return (
            <div
              key={cat.slug}
              className="absolute inset-0"
              style={{ animation: `orbit-spin ${DURATION}s linear infinite`, animationDelay: `${delay}s` }}
            >
              <div
                className="absolute left-1/2 top-1/2"
                style={{ transform: `translate(-50%, -50%) translateY(-${RADIUS}px)` }}
              >
                <div
                  style={{
                    animation: `orbit-counter-spin ${DURATION}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <button
                    onClick={() => setSelected(cat)}
                    className="flex flex-col items-center gap-1 rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-zinc-800 shadow-md transition-transform hover:scale-110 dark:bg-zinc-900/90 dark:text-zinc-100"
                  >
                    <span className="text-2xl leading-none">{cat.emoji}</span>
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <WorldMapModal
          categoryLabel={selected.label}
          onConfirm={() => {
            const slug = selected.slug;
            setSelected(null);
            setTimeout(() => scrollToCategory(slug), 50);
          }}
          onCancel={() => setSelected(null)}
        />
      )}
    </div>
  );
}
