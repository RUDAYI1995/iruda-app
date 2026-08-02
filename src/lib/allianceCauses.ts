export type AllianceCause = {
  slug: string;
  country: string;
  title: string;
  image: string;
  summary: string;
  detail: string;
};

// 루다연합 — 권위주의 체제 아래 인권 문제로 고통받는 사람들의 이야기를 알리고,
// "동참하기"로 뜻을 모아 100명이 되면 루다투표제(국민투표제)에 자동 상정됨.
// 국제 인권단체들이 공통적으로 지적해온 내용을 바탕으로 간략히 정리함 — 특정 개인에 대한
// 검증되지 않은 주장이 아니라, 그 체제 아래 피해를 겪는 '사람들'에 초점을 둠.
export const ALLIANCE_CAUSES: AllianceCause[] = [
  {
    slug: "russia",
    country: "러시아",
    title: "전쟁과 언론 탄압으로 고통받는 사람들",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=700&q=80",
    summary: "우크라이나 전쟁으로 삶의 터전을 잃은 민간인들, 반전 목소리를 냈다는 이유로 처벌받는 시민들의 이야기예요.",
    detail:
      "국제 인권단체들은 오랫동안 러시아 내 언론·집회의 자유 제한과 반전 시위 참가자에 대한 처벌을 지적해왔어요. 동시에 전쟁으로 삶터를 잃은 우크라이나 민간인과, 징집·검열 속에서 목소리를 내지 못하는 러시아 시민들도 함께 고통받고 있어요. 루다월드는 이들의 목소리가 조금이라도 널리 알려지길 바라요.",
  },
  {
    slug: "china",
    country: "중국",
    title: "소수민족 인권과 언론 자유를 위해",
    image: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?auto=format&fit=crop&w=700&q=80",
    summary: "신장 위구르 지역의 인권 문제, 홍콩의 민주화 운동가들이 겪는 어려움을 함께 기억해요.",
    detail:
      "유엔을 비롯한 여러 국제기구는 신장 위구르 자치구의 소수민족 인권 상황과, 홍콩에서 민주화를 요구했던 시민들에 대한 처벌 사례를 지속적으로 우려해왔어요. 자유롭게 의견을 말하고 자신의 정체성을 지킬 권리는 누구에게나 소중해요. 루다월드도 이 문제에 관심을 갖고 함께 목소리를 보태고 싶어요.",
  },
  {
    slug: "north-korea",
    country: "북한",
    title: "정치범 수용소와 표현의 자유 없는 삶",
    image: "https://images.unsplash.com/photo-1504457047772-27faf1606cc9?auto=format&fit=crop&w=700&q=80",
    summary: "정치범 수용소, 정보 통제와 감시 속에서 기본적인 자유조차 누리지 못하는 주민들의 이야기예요.",
    detail:
      "유엔 북한인권조사위원회(COI)는 정치범 수용소에서의 인권 침해, 이동·표현의 자유 제한, 외부 정보 접근 통제 등을 상세히 보고한 바 있어요. 태어난 곳이 어디든 존엄하게 살 권리가 있다는 믿음으로, 루다월드는 이 문제에도 관심을 이어가고 싶어요.",
  },
];
