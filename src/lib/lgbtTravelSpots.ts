export type LgbtTravelSpot = {
  name: string;
  image: string;
  description: string;
};

// LGBT와 친해지기 여행코스 — 성소수자 친화적인 것으로 잘 알려진 여행지 모음 (임의 작성)
export const LGBT_TRAVEL_SPOTS: LgbtTravelSpot[] = [
  {
    name: "네덜란드 암스테르담",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=700&q=80",
    description:
      "성소수자 인권 운동의 상징적인 도시예요. 운하를 따라 레인보우 깃발이 걸린 카페와 바가 많고, 매년 여름 열리는 프라이드 축제에는 배를 타고 운하를 도는 독특한 퍼레이드가 열려요.",
  },
  {
    name: "캐나다 토론토 처치-웰즐리 빌리지",
    image: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=700&q=80",
    description:
      "캐나다에서 가장 큰 게이 빌리지예요. 다양성을 존중하는 분위기가 도시 전체에 자연스럽게 스며 있고, 여름철 프라이드 퍼레이드 때는 거리 전체가 축제 분위기로 물들어요.",
  },
  {
    name: "스페인 시체스",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=700&q=80",
    description:
      "바르셀로나 근교의 작은 해변 도시로, 유럽에서 손꼽히는 성소수자 친화 휴양지예요. 해변가를 따라 늘어선 바와 클럽, 그리고 유럽 최대 규모의 게이 프라이드 축제 중 하나로 유명해요.",
  },
  {
    name: "대만 타이베이",
    image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=700&q=80",
    description:
      "아시아 최초로 동성결혼을 법제화한 도시예요. 매년 가을 열리는 타이베이 프라이드는 아시아 최대 규모로, 시먼딩 거리는 성소수자 친화 상점과 카페가 밀집해 있어요.",
  },
  {
    name: "태국 방콕 실롬",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=700&q=80",
    description:
      "동남아시아에서 성소수자 문화가 가장 개방적인 지역 중 하나예요. 실롬 소이 4 골목에는 친화적인 바와 클럽이 밀집해 있고, 밤이면 활기찬 분위기를 즐길 수 있어요.",
  },
];
