import type { CarouselSlide } from "@/lib/homeCarouselImages";

// 홈 화면 오른쪽 빈 칸에 도는 두 번째 3장 캐러셀 — "새로운 팝업창" 폴더 이미지
export const HOME_CAROUSEL_IMAGES_2: CarouselSlide[] = [
  {
    src: "/popup2-1.png",
    openPanel: "water",
    hotspot: { top: 85, left: 8, width: 84, height: 12 },
  },
  {
    src: "/popup2-2.png",
    openPanel: "infosec",
    hotspot: { top: 89, left: 14, width: 80, height: 9 },
  },
  {
    src: "/popup2-3.png",
    openPanel: "security",
    hotspot: { top: 87, left: 6, width: 88, height: 11 },
  },
];
