// 실제 스톡 사진(Unsplash) — 칸 테마와 어울리는 사진을 매핑. 하나씩 브라우저로 로딩 확인 후 채택함.
function u(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
}

const CAFE = u("photo-1495474472287-4d71bcdd2085");
const CAT = u("photo-1514888286974-6c03e2ca1dba");
const WORKSHOP = u("photo-1595351298020-038700609878");
const FOREST_TRAIL = u("photo-1592859600972-1b0834d83747");
const CAMPING = u("photo-1504851149312-7a075b496cc7");
const BAKERY = u("photo-1568254183919-78a4f43a2877");
const BOOKSTORE = u("photo-1533327325824-76bc4e62d560");
const ART_GALLERY = u("photo-1575223970966-76ae61ee7838");
const MARKET = u("photo-1569925493302-dde995240688");
const SEASIDE = u("photo-1582490841511-81e1363fb48c");
const TRAIN = u("photo-1580442374555-3def8fb41738");
const FLOWER = u("photo-1490750967868-88aa4486c946");
const HOTSPRING = u("photo-1535530992830-e25d07cfa780");
const BUSKING = u("photo-1549831838-0a396da91847");
const PLAZA = u("photo-1543495843-31be63139c87");

// 칸 이름 -> 그 테마에 어울리는 실제 사진 목록(1~2장). 정모 4개를 만들 때 이 목록을 돌려가며 붙임.
export const TILE_THEME_PHOTOS: Record<string, string[]> = {
  "고양이 카페": [CAT, CAFE],
  "작은 공방": [WORKSHOP],
  "아기자기 공방": [WORKSHOP],
  "고요한 산책길": [FOREST_TRAIL],
  "루다 온천": [HOTSPRING],
  "나눔 마켓": [MARKET],
  "행복 나눔 장터": [MARKET],
  "별빛 캠프장": [CAMPING],
  "숲속 오두막": [FOREST_TRAIL, CAMPING],
  "음악이 흐르는 길": [BUSKING],
  "꽃길 마을": [FLOWER],
  "동네 빵집": [BAKERY],
  "조용한 미술관": [ART_GALLERY],
  "따뜻한 책방": [BOOKSTORE],
  "꿈의 도서관": [BOOKSTORE],
  "바닷가 산책": [SEASIDE],
  "기차 여행": [TRAIN],
  "응원 광장": [PLAZA],
  "심콩 방문": [CAT, CAFE],
  "출발해라냥": [FOREST_TRAIL, CAT],
};

export function photosForTile(tileLabel: string, count: number): string[] {
  const pool = TILE_THEME_PHOTOS[tileLabel] ?? [CAFE];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}
