"use client";

import { PleadingCat } from "@/components/PleadingCat";

interface CompanionProfile {
  userId: string;
  name: string;
  travelTime: string;
}

export function PartyRecruitModal({
  totalCount,
  profiles,
  onJoin,
  onClose,
}: {
  totalCount: number;
  profiles: CompanionProfile[];
  onJoin: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-950">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          ✕
        </button>

        <PleadingCat className="mx-auto h-28 w-28" />

        <p className="mt-2 text-lg font-bold text-pink-700 dark:text-pink-300">
          같은 날짜에 떠나는 여행자가 {totalCount}명 있다냥!
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {profiles.map((p) => (
            <span
              key={p.userId}
              className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800 dark:bg-pink-950/40 dark:text-pink-200"
            >
              {p.name} · {p.travelTime}
            </span>
          ))}
          {totalCount > profiles.length && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
              +{totalCount - profiles.length}명 더
            </span>
          )}
        </div>

        <p className="mt-5 text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          이 사람들과 같이 떠나보겠냥?
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            나중에요
          </button>
          <button
            type="button"
            onClick={onJoin}
            className="rounded-full bg-pink-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
          >
            네, 같이 떠날게요 🐾
          </button>
        </div>
      </div>
    </div>
  );
}
