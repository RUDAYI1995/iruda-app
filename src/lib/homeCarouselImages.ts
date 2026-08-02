export type CarouselHotspot = {
  top: number; // 원본 이미지 기준 % (전체가 다 보이는 확대 창에서 사용)
  left: number;
  width: number;
  height: number;
};

export type CarouselSlide = {
  src: string;
  href?: string;
  /** 있으면 href로 이동하는 대신 해당 오른쪽 큰 창(패널)을 띄움 */
  openPanel?:
    | "lgbt"
    | "family"
    | "cool"
    | "alliance"
    | "daegu"
    | "mood"
    | "election"
    | "water"
    | "infosec"
    | "security";
  hotspot?: CarouselHotspot;
};

// 홈 화면 "루다월드" 로고 밑 큰 칸(왼쪽 슬롯)에 도는 7장 캐러셀 이미지.
// 작은 칸에서는 이미지 전체가 다 보이도록 표시하고, 클릭하면 큰 창으로 확대해서
// 이미지 안에 그려진 버튼(글자) 위치까지 정확히 눌러 이동할 수 있게 함.
// 2~7번 버튼을 눌렀을 때 실제로 무슨 일이 일어나야 하는지는 갓루다님이 추후 자세히 지시 예정 —
// 지금은 임시로 "준비 중" 안내 페이지에 연결해둠.
export const HOME_CAROUSEL_IMAGES: CarouselSlide[] = [
  {
    src: "/popup-lgbt.png",
    openPanel: "lgbt",
    hotspot: { top: 85, left: 14, width: 71, height: 7 },
  },
  {
    src: "/popup-family.png",
    openPanel: "family",
    hotspot: { top: 80, left: 5, width: 90, height: 16 },
  },
  {
    src: "/popup-earthheat.png",
    openPanel: "cool",
    hotspot: { top: 90, left: 5, width: 90, height: 8 },
  },
  {
    src: "/popup-ludaalliance.png",
    openPanel: "alliance",
    hotspot: { top: 93, left: 5, width: 90, height: 6 },
  },
  {
    src: "/popup-sept-daegu.png",
    openPanel: "daegu",
    hotspot: { top: 94, left: 5, width: 90, height: 5 },
  },
  {
    src: "/popup-mood-travel.png",
    openPanel: "mood",
    hotspot: { top: 93, left: 5, width: 90, height: 6 },
  },
  {
    src: "/popup-vote-transparent.png",
    openPanel: "election",
    hotspot: { top: 93, left: 5, width: 90, height: 5 },
  },
];
