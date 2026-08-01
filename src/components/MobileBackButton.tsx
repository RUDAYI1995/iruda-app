"use client";

import { useRouter, usePathname } from "next/navigation";

// 모바일에서만 보이는 전역 뒤로가기 버튼 — 페이지마다 자체 "뒤로가기" 링크가
// 있거나 없거나 상관없이 항상 눌러서 이전 화면으로 갈 수 있게 함
export function MobileBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="뒤로가기"
      className="fixed right-3 top-3 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-lg font-bold text-zinc-700 shadow-md backdrop-blur active:scale-95 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 md:hidden"
    >
      ←
    </button>
  );
}
