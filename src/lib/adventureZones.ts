export type PathNode = { top: string; left: string };

export type Direction = "up" | "down" | "left" | "right";

// 길(road)을 노드 그래프로 표현 — 각 노드는 상하좌우 중 실제로 길이 이어진 방향에만 이웃이 있음.
// 화살표 키를 누르면 그 방향으로 이어진 이웃 노드가 있을 때만 이동(=길 위에서만 이동).
export type PathGraph = {
  startNode: string;
  nodes: Record<string, PathNode & { label?: string }>;
  edges: Record<string, Partial<Record<Direction, string>>>;
};

export type AdventureZone = {
  slug: string;
  number: number;
  name: string;
  top: string;
  left: string;
  image: string;
  mapImage: string;
  mapWidth: number;
  mapHeight: number;
  desc: string;
  locked?: boolean;
  // 길을 따라서만 이동하는 구역(현재는 1구역 화산 지대)에만 존재.
  pathGraph?: PathGraph;
  // 이 구역 안의 명소들을 해금하기 위한 미션 목록 (현재는 1구역에만 존재)
  missions?: string[];
};

// 좌표는 public/adventure-map.png(1536x565) 위에 그려진 번호 핀 위치를 %로 잡은 값
export const ADVENTURE_ZONES: AdventureZone[] = [
  {
    slug: "volcano",
    mapImage: "/zone-map-volcano.png",
    mapWidth: 1536,
    mapHeight: 1024,
    number: 1,
    name: "화산 지대",
    top: "29.4%",
    left: "26.0%",
    image: "/zone-1.png",
    desc: "뜨거운 용암과 위험이 가득한 화산의 땅! 강한 자만이 살아남는다.",
    pathGraph: {
      startNode: "start",
      nodes: {
        start: { top: "76.2%", left: "39.1%", label: "입구" },
        shop: { top: "66.4%", left: "39.1%", label: "불꽃 상점가" },
        mine: { top: "63.5%", left: "13.0%", label: "화산 광산" },
        hill: { top: "44.9%", left: "11.7%", label: "불꽃 바위 언덕" },
        waterfall: { top: "31.3%", left: "22.8%", label: "용암 폭포" },
        fortress: { top: "45.9%", left: "44.3%", label: "화산 요새" },
        cave: { top: "37.1%", left: "60.5%", label: "마그마 동굴" },
        altar: { top: "31.3%", left: "81.4%", label: "불의 제단" },
        bridge: { top: "60.5%", left: "83.3%", label: "용암 다리" },
        hotspring: { top: "71.3%", left: "61.9%", label: "화산 온천" },
      },
      edges: {
        start: { up: "shop" },
        shop: { up: "fortress", down: "start", left: "mine", right: "hotspring" },
        mine: { up: "hill", right: "shop" },
        hill: { down: "mine", up: "waterfall", right: "fortress" },
        waterfall: { down: "hill", right: "cave" },
        fortress: { down: "shop", left: "hill", up: "cave", right: "bridge" },
        cave: { down: "fortress", left: "waterfall", right: "altar" },
        altar: { left: "cave", down: "bridge" },
        bridge: { up: "altar", left: "fortress", down: "hotspring" },
        hotspring: { up: "bridge", left: "shop" },
      },
    },
    missions: [
      "대프리카를 3번 방문하라냥",
      "온천을 3번 방문하라냥",
      "폭죽을 3번 터트려라냥",
      "파이어캠프를 3번 가라냥",
      "사우나에서 3분 이상 버텨라냥",
    ],
  },
  {
    slug: "forest",
    mapImage: "/zone-map-forest.png",
    mapWidth: 380,
    mapHeight: 400,
    number: 2,
    name: "신비의 숲",
    top: "35.8%",
    left: "43.3%",
    image: "/zone-2.png",
    desc: "신비로운 생명들이 숨쉬는 숲, 마법의 기운이 가득하다.",
    locked: true,
  },
  {
    slug: "cat-village",
    mapImage: "/zone-map-cat-village.png",
    mapWidth: 390,
    mapHeight: 400,
    number: 3,
    name: "고양이 마을",
    top: "41.2%",
    left: "57.4%",
    image: "/zone-3.png",
    desc: "귀여운 고양이들이 모여 사는 마을, 따뜻한 정과 즐거움이 가득해.",
    locked: true,
  },
  {
    slug: "port",
    mapImage: "/zone-map-port.png",
    mapWidth: 400,
    mapHeight: 335,
    number: 4,
    name: "시작의 항구",
    top: "64.1%",
    left: "25.7%",
    image: "/zone-4.png",
    desc: "모험의 첫걸음을 내딛는 항구! 배와 무역, 만남의 중심지.",
    locked: true,
  },
  {
    slug: "desert",
    mapImage: "/zone-map-desert.png",
    mapWidth: 420,
    mapHeight: 335,
    number: 5,
    name: "시작의 오아시스",
    top: "71.2%",
    left: "40.8%",
    image: "/zone-5.png",
    desc: "사막 한가운데 숨겨진 오아시스! 휴식과 치유의 땅.",
    locked: true,
  },
  {
    slug: "ice",
    mapImage: "/zone-map-ice.png",
    mapWidth: 440,
    mapHeight: 305,
    number: 6,
    name: "얼음 산맥",
    top: "72.9%",
    left: "59.3%",
    image: "/zone-6.png",
    desc: "끝없는 눈과 얼음의 땅, 차가운 곳에 비밀이 잠들어 있다.",
    locked: true,
  },
];

export function getZone(slug: string): AdventureZone | undefined {
  return ADVENTURE_ZONES.find((z) => z.slug === slug);
}
