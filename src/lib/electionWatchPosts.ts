export type ElectionWatchPost = {
  title: string;
  image: string;
  description: string;
};

// 선거지킴이 모여라 — 루다월드 내부 투표(루다투표제 등) 부정행위 제보를 가정한 임의 예시 글
// 실존 인물/사건이 아닌, 서비스 내 신고 게시판 형태를 보여주기 위한 데모 데이터
export const SYSTEM_FRAUD_POSTS: ElectionWatchPost[] = [
  {
    title: "같은 IP에서 10분 안에 투표 7번 찍힘",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=700&q=80",
    description: "루다투표제 특정 안건에서 같은 접속 흔적이 반복돼서 캡처해뒀어요. 관리자 확인 부탁드려요.",
  },
  {
    title: "탈퇴 후 재가입 계정으로 재투표 시도",
    image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&w=700&q=80",
    description: "한 번 투표한 계정을 탈퇴시키고 새 계정을 만들어서 같은 안건에 또 투표한 정황이 있어요.",
  },
  {
    title: "매크로 의심 — 1초 간격 연속 투표 기록",
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=700&q=80",
    description: "사람이 누르기엔 너무 빠른 간격으로 찬성표가 몰린 시간대가 있어서 공유해요.",
  },
  {
    title: "친구 계정 여러 개 빌려서 몰표 인증",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80",
    description: "본인 SNS에 지인 계정 빌려서 몰표 넣었다고 자랑하는 글을 캡처했어요.",
  },
  {
    title: "봇 계정 대량 생성 흔적 발견",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=700&q=80",
    description: "가입 시간이 몇 초 간격으로 동일한 계정 수십 개가 같은 안건에 몰표를 넣었어요.",
  },
];

export const PAPER_FRAUD_POSTS: ElectionWatchPost[] = [
  {
    title: "정모 현장 투표함 개함 전 봉인 훼손 목격",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?auto=format&fit=crop&w=700&q=80",
    description: "공개 파티 현장 투표에서 개표 시작 전 봉투 테이프가 이미 뜯겨있는 걸 봤어요. 사진 첨부합니다.",
  },
  {
    title: "무효표를 유효표로 다시 세는 걸 봤어요",
    image: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=700&q=80",
    description: "이름 안 쓴 투표용지를 진행자가 임의로 특정 후보 표로 처리하는 걸 옆에서 지켜봤어요.",
  },
  {
    title: "투표함 운반 중 인원 미동행 구간 있었음",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=700&q=80",
    description: "정모 투표함이 개표 장소로 이동하는 동안 참관인 없이 혼자 옮겨진 구간이 있었어요.",
  },
  {
    title: "동일 필체로 작성된 투표용지 다수 발견",
    image: "https://images.unsplash.com/photo-1454165833767-027a5b9c8ac1?auto=format&fit=crop&w=700&q=80",
    description: "개표 중에 글씨체가 똑같은 투표용지가 여러 장 섞여 있는 걸 발견해서 사진으로 남겼어요.",
  },
  {
    title: "참관인 자리 배치를 개표함에서 멀리 두려고 함",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=700&q=80",
    description: "참관 요청했더니 개표함이 안 보이는 자리로 안내받아서 이상해서 항의했던 상황이에요.",
  },
];
