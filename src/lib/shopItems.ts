export type ItemCategory = "GEAR" | "SURVIVAL" | "BUILDING";

export interface ShopItem {
  id: string;
  category: ItemCategory;
  name: string;
  emoji: string;
  price: number; // 젤리 단위
  rarity: "일반" | "희귀" | "에픽";
  description: string;
}

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  GEAR: "여행장비",
  SURVIVAL: "생존도구",
  BUILDING: "집짓는도구",
};

export const SHOP_ITEMS: ShopItem[] = [
  // 여행장비
  {
    id: "gear_backpack",
    category: "GEAR",
    name: "여행자의 배낭",
    emoji: "🎒",
    price: 20,
    rarity: "일반",
    description: "루다월드를 누빌 때 짐을 넣는 기본 배낭이에요.",
  },
  {
    id: "gear_compass",
    category: "GEAR",
    name: "낡은 나침반",
    emoji: "🧭",
    price: 50,
    rarity: "일반",
    description: "길을 잃지 않게 방향을 알려줘요.",
  },
  {
    id: "gear_tent",
    category: "GEAR",
    name: "1인용 텐트",
    emoji: "⛺",
    price: 300,
    rarity: "희귀",
    description: "루다월드 어디서든 잠시 쉬어갈 수 있어요.",
  },
  {
    id: "gear_boots",
    category: "GEAR",
    name: "튼튼한 등산화",
    emoji: "🥾",
    price: 500,
    rarity: "희귀",
    description: "험한 길도 거뜬히 걸을 수 있게 해줘요.",
  },
  {
    id: "gear_globe_ticket",
    category: "GEAR",
    name: "황금 비행기 티켓",
    emoji: "🎫",
    price: 10000,
    rarity: "에픽",
    description: "루다월드 어디든 한 번에 이동할 수 있는 전설의 티켓이에요.",
  },

  // 생존도구
  {
    id: "survival_flashlight",
    category: "SURVIVAL",
    name: "손전등",
    emoji: "🔦",
    price: 15,
    rarity: "일반",
    description: "어두운 곳에서도 앞을 밝혀줘요.",
  },
  {
    id: "survival_firestarter",
    category: "SURVIVAL",
    name: "부싯돌 세트",
    emoji: "🔥",
    price: 40,
    rarity: "일반",
    description: "불을 피워 몸을 녹일 수 있어요.",
  },
  {
    id: "survival_waterfilter",
    category: "SURVIVAL",
    name: "휴대용 정수 필터",
    emoji: "💧",
    price: 200,
    rarity: "희귀",
    description: "어디서든 깨끗한 물을 마실 수 있게 해줘요.",
  },
  {
    id: "survival_firstaid",
    category: "SURVIVAL",
    name: "응급처치 키트",
    emoji: "🩹",
    price: 400,
    rarity: "희귀",
    description: "다치거나 몸이 아플 때 응급처치를 할 수 있어요.",
  },
  {
    id: "survival_ninegen_serum",
    category: "SURVIVAL",
    name: "닝겐의 만능 혈청",
    emoji: "🧪",
    price: 10000,
    rarity: "에픽",
    description: "전설의 닝겐 집사가 전수해준 만능 회복 혈청이에요.",
  },

  // 집짓는도구
  {
    id: "building_hammer",
    category: "BUILDING",
    name: "나무 망치",
    emoji: "🔨",
    price: 25,
    rarity: "일반",
    description: "간단한 목공 작업에 쓸 수 있어요.",
  },
  {
    id: "building_nails",
    category: "BUILDING",
    name: "못 주머니",
    emoji: "🧰",
    price: 60,
    rarity: "일반",
    description: "집을 지을 때 필요한 못을 담아둬요.",
  },
  {
    id: "building_saw",
    category: "BUILDING",
    name: "손톱",
    emoji: "🪚",
    price: 250,
    rarity: "희귀",
    description: "나무를 다듬어 집의 뼈대를 만들 수 있어요.",
  },
  {
    id: "building_blueprint",
    category: "BUILDING",
    name: "우리집 설계도",
    emoji: "📐",
    price: 1000,
    rarity: "희귀",
    description: "루다월드에 나만의 집을 지을 수 있는 설계도예요.",
  },
  {
    id: "building_golden_house",
    category: "BUILDING",
    name: "황금 통나무집 세트",
    emoji: "🏡",
    price: 100000,
    rarity: "에픽",
    description: "루다월드 최고급 통나무집을 한 번에 지을 수 있는 자재 세트예요.",
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}
