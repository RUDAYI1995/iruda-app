// 지구본 원(GLOBE_CROP) 안에서의 위치 — 0~100 (crop 기준 상대 %)
export type DartDestination = { city: string; country: string; x: number; y: number };

// 다트 던지기 랜덤 여행지 후보. x/y는 dart-globe.png 안에 실제로 그려진 라벨
// (뉴욕/파리/도쿄/카이로/리우/시드니) 위치를 실측해서 넣었고, 나머지 후보는
// 그 6곳을 기준으로 지리적으로 자연스러운 자리에 배치함 — 다트가 항상 당첨된
// 지역 이름과 같은 자리에 꽂히도록 함
export const DART_DESTINATIONS: DartDestination[] = [
  { city: "뉴욕", country: "미국", x: 17, y: 20 },
  { city: "파리", country: "프랑스", x: 57, y: 16 },
  { city: "도쿄", country: "일본", x: 86, y: 26 },
  { city: "카이로", country: "이집트", x: 52, y: 36 },
  { city: "리우데자네이루", country: "브라질", x: 17, y: 55 },
  { city: "시드니", country: "호주", x: 86, y: 74 },
  { city: "런던", country: "영국", x: 52, y: 13 },
  { city: "로마", country: "이탈리아", x: 58, y: 27 },
  { city: "방콕", country: "태국", x: 75, y: 45 },
  { city: "발리", country: "인도네시아", x: 78, y: 60 },
  { city: "두바이", country: "아랍에미리트", x: 60, y: 33 },
  { city: "밴쿠버", country: "캐나다", x: 10, y: 12 },
  { city: "바르셀로나", country: "스페인", x: 50, y: 20 },
  { city: "이스탄불", country: "튀르키예", x: 63, y: 22 },
  { city: "싱가포르", country: "싱가포르", x: 77, y: 52 },
];

export function pickRandomDestination(): DartDestination {
  return DART_DESTINATIONS[Math.floor(Math.random() * DART_DESTINATIONS.length)];
}
