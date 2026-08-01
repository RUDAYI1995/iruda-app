"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADVENTURE_ZONES } from "@/lib/adventureZones";

export default function AdventurePage() {
  const router = useRouter();
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mb-6 flex w-full max-w-[95vw] items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
            위대한 모험
          </p>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            🗺️ 루다대륙
          </h1>
        </div>
        <Link
          href="/home"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← 루다월드 홈으로
        </Link>
      </div>

      <div
        className="relative w-full max-w-[95vw] overflow-hidden rounded-3xl shadow-xl"
        style={{ aspectRatio: "1536 / 565", maxHeight: "85vh" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/adventure-map.png" alt="루다대륙 지도" className="absolute inset-0 h-full w-full object-cover" />

        {ADVENTURE_ZONES.map((zone) => (
          <button
            key={zone.slug}
            type="button"
            title={zone.name}
            onClick={() => {
              if (zone.locked) {
                setLockedMessage("1번 불의 구역 퀘스트를 깨야 해금합니다.");
                return;
              }
              router.push(`/adventure/zone/${zone.slug}`);
            }}
            className="group absolute h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-110"
            style={{ top: zone.top, left: zone.left }}
          >
            <span className="sr-only">{zone.name}</span>
            <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-white/80" />
            {zone.locked && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900/85 text-[11px] shadow">
                🔒
              </span>
            )}
          </button>
        ))}

        <div className="absolute bottom-3 left-3 flex flex-col gap-2">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            🪙 마일리지 상점
          </Link>
          <Link
            href="/adventure/plaza"
            className="flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            🎪 만남의 광장
          </Link>
          <Link
            href="/adventure/night-market"
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            🏮 관광 야시장
          </Link>
        </div>
      </div>

      {lockedMessage && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setLockedMessage(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-950"
          >
            <span className="text-4xl">🔒</span>
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">{lockedMessage}</p>
            <button
              onClick={() => setLockedMessage(null)}
              className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
        1번 화산 지대를 먼저 마스터해야 다른 구역이 해금돼요. 관광 야시장은 대구시간(KST) 20:00~06:00에만 열려요.
      </p>
    </div>
  );
}
