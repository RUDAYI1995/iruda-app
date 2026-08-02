"use client";

import Link from "next/link";
import { useLevelInfo, GENDER_LABELS } from "@/lib/useLevelInfo";

// 홈 화면 헤더의 프로모션 배너 줄(뉴질랜드 배너 옆 빈 공간)에 들어가는 레벨 뱃지 —
// 전역 LevelBadge(고정 오버레이)와 달리 그 자리에 자연스럽게 자리잡도록 배너와 같은 크기로 맞춤
export function LevelBadgeInline() {
  const info = useLevelInfo();

  if (!info?.loggedIn) return null;

  return (
    <Link
      href="/my-page"
      className="flex h-[64px] w-[140px] shrink-0 flex-col justify-center gap-1 rounded-xl border border-amber-300 bg-white/90 px-3 py-2 text-xs shadow-sm transition-transform hover:scale-105 dark:border-amber-700 dark:bg-zinc-900/90"
      title="마이페이지에서 레벨 자세히 보기"
    >
      <span className="truncate font-bold text-amber-800 dark:text-amber-300">
        Lv.{info.level} {info.title}
      </span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <span
          className="block h-full rounded-full bg-amber-500"
          style={{ width: `${(info.ratio ?? 0) * 100}%` }}
        />
      </span>
      {info.needsGender ? (
        <span className="truncate text-[10px] text-red-500">⚠️ 성별 설정 필요</span>
      ) : (
        <span className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
          성별: {GENDER_LABELS[info.gender as "MALE" | "FEMALE" | "LGBTQ"]}
        </span>
      )}
    </Link>
  );
}
