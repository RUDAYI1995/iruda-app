export type TravelSpot = {
  name: string;
  image: string;
  description: string;
};

// 아이와 즐거운 안심여행 — 부모와 아이가 함께하기 좋은 곳 (임의 작성)
export const FAMILY_TRAVEL_SPOTS: TravelSpot[] = [
  {
    name: "제주 아쿠아플라넷",
    image: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=700&q=80",
    description:
      "대형 아쿠아리움이라 실내에서 날씨 걱정 없이 하루 종일 즐길 수 있어요. 아이들이 좋아하는 돌고래 쇼와 터널 수족관이 특히 인기예요.",
  },
  {
    name: "에버랜드",
    image: "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?auto=format&fit=crop&w=700&q=80",
    description:
      "놀이기구뿐 아니라 동물원(주토피아)도 함께 있어서 어린 아이도 즐길 거리가 많아요. 유모차 대여, 수유실 등 아이 동반 시설이 잘 갖춰져 있어요.",
  },
  {
    name: "강원도 하이원 리조트",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=80",
    description:
      "여름엔 물놀이 시설, 겨울엔 눈썰매장까지 계절별로 즐길 거리가 다양해요. 패밀리룸이 잘 되어 있어 온 가족이 편하게 묵을 수 있어요.",
  },
  {
    name: "여수 오션월드 & 해상케이블카",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=700&q=80",
    description:
      "바다 위를 지나는 케이블카는 아이들에게 특별한 경험이 되고, 근처 해양공원에서 여유롭게 산책하며 쉬기도 좋아요.",
  },
  {
    name: "국립과천과학관",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=700&q=80",
    description:
      "체험형 전시가 많아서 아이가 직접 만지고 놀면서 배울 수 있어요. 실내 시설이라 비 오는 날에도 걱정 없이 다녀올 수 있어요.",
  },
];
