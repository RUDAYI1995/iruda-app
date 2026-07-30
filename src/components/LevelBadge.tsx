"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LevelInfo {
  loggedIn: boolean;
  level?: number;
  title?: string;
  exp?: number;
  currentFloor?: number;
  nextFloor?: number;
  ratio?: number;
  needsGender?: boolean;
}

export function LevelBadge() {
  const [info, setInfo] = useState<LevelInfo | null>(null);

  useEffect(() => {
    fetch("/api/level")
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  if (!info?.loggedIn) return null;

  return (
    <Link
      href="/my-page"
      className="fixed left-4 top-4 z-50 flex flex-col gap-1 rounded-xl border border-amber-300 bg-white/90 px-3 py-2 text-xs shadow-md backdrop-blur transition-transform hover:scale-105 dark:border-amber-700 dark:bg-zinc-900/90"
      title="마이페이지에서 레벨 자세히 보기"
    >
      <span className="font-bold text-amber-800 dark:text-amber-300">
        Lv.{info.level} {info.title}
      </span>
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span
          className="block h-full rounded-full bg-amber-500"
          style={{ width: `${(info.ratio ?? 0) * 100}%` }}
        />
      </span>
      {info.needsGender && (
        <span className="text-[10px] text-red-500">⚠️ 성별 설정 필요</span>
      )}
    </Link>
  );
}
