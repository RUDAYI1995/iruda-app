"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLevelInfo, GENDER_LABELS } from "@/lib/useLevelInfo";

export function LevelBadge() {
  const info = useLevelInfo();
  const pathname = usePathname();

  // 홈 화면은 헤더 프로모션 배너 줄 안에 자체 레벨 뱃지(LevelBadgeInline)를 따로 두므로
  // 전역 고정 뱃지는 거기서 숨김(안 그러면 루다월드 로고와 겹침)
  if (pathname === "/home") return null;
  if (!info?.loggedIn) return null;

  return (
    <Link
      href="/my-page"
      className="fixed left-4 top-4 z-50 hidden flex-col gap-1 rounded-xl border border-amber-300 bg-white/90 px-3 py-2 text-xs shadow-md backdrop-blur transition-transform hover:scale-105 dark:border-amber-700 dark:bg-zinc-900/90 md:flex"
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
      {info.needsGender ? (
        <span className="text-[10px] text-red-500">⚠️ 성별 설정 필요</span>
      ) : (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
          성별: {GENDER_LABELS[info.gender as "MALE" | "FEMALE" | "LGBTQ"]}
        </span>
      )}
    </Link>
  );
}
