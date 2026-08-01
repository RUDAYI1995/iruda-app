export const DUNGEON_CLEAR_MILEAGE = 100;

export type DungeonStage = {
  index: number;
  name: string;
  flavor: string;
  /** 실제로 인증해야 하는 현실 미션 설명 */
  realMission: string;
  /** AI 비전 판독 시 사용하는 인증 사진 대상 설명 */
  photoTopic: string;
};

// 아싸던전 — 솔플(혼자 하는) 퀘스트. 위대한 모험이 파티전용 퀘스트인 것과 대비됨.
// 층마다 실제로 그 활동을 혼자 하러 가서 GPS+사진으로 인증해야 클리어 처리(위대한 모험과 같은 인증 방식 재사용)
export const DUNGEON_STAGES: DungeonStage[] = [
  {
    index: 0,
    name: "입구의 어둠",
    flavor: "혼자 들어왔는데도 아무도 안 물어봐서 편했다냥",
    realMission: "혼자 영화관 가서 영화보기",
    photoTopic: "영화관 스크린이나 영화표",
  },
  {
    index: 1,
    name: "정적의 통로",
    flavor: "말 안 걸어도 되는 이 고요함... 완벽하다냥",
    realMission: "혼자 카페 가서 시간 보내기",
    photoTopic: "카페 내부, 커피나 음료",
  },
  {
    index: 2,
    name: "메아리 방",
    flavor: "혼잣말했는데 메아리가 대답해줘서 덜 외로웠다냥",
    realMission: "혼자 노래방 가기",
    photoTopic: "노래방 내부, 마이크나 화면",
  },
  {
    index: 3,
    name: "그림자 갈림길",
    flavor: "누구 눈치도 안 보고 내 맘대로 골랐다냥",
    realMission: "혼자 낯선 동네 산책하기",
    photoTopic: "낯선 동네의 거리나 골목",
  },
  {
    index: 4,
    name: "고독의 제단",
    flavor: "여기까지 혼자 온 내가 대견하다냥",
    realMission: "혼자 맛집 가서 밥 먹기(혼밥)",
    photoTopic: "혼자 먹는 음식과 식당 테이블",
  },
  {
    index: 5,
    name: "아싸의 왕좌",
    flavor: "던전 끝판왕도 결국 혼자였다냥... 우리 동지였다냥",
    realMission: "혼자 여행이나 등산 가기",
    photoTopic: "여행지나 등산로 풍경",
  },
];
