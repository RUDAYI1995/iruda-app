"use client";

import { useState } from "react";
import { MOOD_CHARGE_SPOTS, MOOD_LABELS, type MoodKey } from "@/lib/moodChargeSpots";

const MOOD_ORDER: MoodKey[] = ["happy", "sad", "angry", "bored"];

export function MoodChargePanel({ onClose }: { onClose: () => void }) {
  const [mood, setMood] = useState<MoodKey>("happy");
  const spots = MOOD_CHARGE_SPOTS[mood];

  return (
    <div className="fixed inset-0 z-[500] bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-500">🍬 당 충전하기</p>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">지금 내 기분에 맞는 여행지</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/40"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-1.5">
          {MOOD_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMood(key)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-xs font-semibold transition-colors ${
                mood === key
                  ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              }`}
            >
              <span className="text-lg">{MOOD_LABELS[key].emoji}</span>
              {MOOD_LABELS[key].title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {spots.map((spot) => (
            <div
              key={spot.name}
              className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spot.image} alt={spot.name} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="mb-1 font-bold text-zinc-900 dark:text-zinc-50">{spot.name}</p>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{spot.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
