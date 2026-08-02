export type DaeguDeal = {
  shopName: string;
  image: string;
  description: string;
  originalPrice: number;
  discountRate: number; // 20
};

// 9월 대구 특가 — 루다월드와 제휴한 것으로 설정한 가상의 업체 홍보 글 모음 (임의 작성, 실존 업체 아님)
export const DAEGU_DEALS: DaeguDeal[] = [
  {
    shopName: "대구 앞산 뷰 게스트하우스",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80",
    description:
      "앞산 케이블카 바로 아래 위치한 조용한 게스트하우스예요. 1인실 위주라 혼자 여행하는 분들도 눈치 안 보고 편하게 머물 수 있어요. 조식으로 대구식 누른국수를 제공해요.",
    originalPrice: 55000,
    discountRate: 20,
  },
  {
    shopName: "동성로 소심한 라멘집",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80",
    description:
      "동성로 골목 안쪽, 혼자 온 손님을 위한 1인 좌석이 절반인 라멘집이에요. 주문은 태블릿으로만 받아서 말 안 하고도 편하게 식사할 수 있어요.",
    originalPrice: 12000,
    discountRate: 20,
  },
  {
    shopName: "김광석 다시그리기길 도보 투어",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=700&q=80",
    description:
      "소규모(최대 4인) 도보 가이드 투어예요. 골목 벽화와 음악 이야기를 조용히 들려주는 방식이라 대인원 단체 투어가 부담스러운 분들께 잘 맞아요.",
    originalPrice: 20000,
    discountRate: 20,
  },
  {
    shopName: "수성못 야경 카페 '고요'",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80",
    description:
      "수성못이 내려다보이는 통창 자리가 많은 카페예요. 저녁 시간에는 대화 없이 각자 조용히 시간을 보내는 손님이 많아서 부담 없이 앉아있기 좋아요.",
    originalPrice: 7000,
    discountRate: 20,
  },
  {
    shopName: "서문시장 야시장 1인 포차",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=80",
    description:
      "서문시장 야시장 안, 바 형태의 좌석만 있는 1인 전용 포차예요. 옆 사람과 거리를 두고 앉을 수 있게 좌석 간격을 넓게 만들어 뒀어요.",
    originalPrice: 15000,
    discountRate: 20,
  },
];
