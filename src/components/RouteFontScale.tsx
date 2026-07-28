"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 첫 페이지(인트로 이미지, "/")와 보드게임 화면("/ludapia")은 픽셀 단위로 촘촘히
// 맞춰둔 자체 레이아웃이라 글자 크기를 건드리면 깨짐 — 그 두 곳만 제외하고
// 나머지 모든 페이지(세 번째 페이지부터)에 큰 글씨 모드를 적용함.
const EXCLUDED_PREFIXES = ["/ludapia"];

export function RouteFontScale() {
  const pathname = usePathname();

  useEffect(() => {
    const isExcluded = pathname === "/" || EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
    if (isExcluded) {
      delete document.documentElement.dataset.largeText;
    } else {
      document.documentElement.dataset.largeText = "true";
    }
  }, [pathname]);

  return null;
}
