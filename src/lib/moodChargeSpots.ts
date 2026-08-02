import type { TravelSpot } from "@/lib/familyTravelSpots";

export type MoodKey = "happy" | "sad" | "angry" | "bored";

export const MOOD_LABELS: Record<MoodKey, { emoji: string; title: string }> = {
  happy: { emoji: "😊", title: "기분 좋을 때" },
  sad: { emoji: "😢", title: "기분 슬플 때" },
  angry: { emoji: "😠", title: "기분 화날 때" },
  bored: { emoji: "🥱", title: "기분 심심할 때" },
};

// 당 충전하기 — 기분 상태별로 어울리는 여행지 (임의 작성)
export const MOOD_CHARGE_SPOTS: Record<MoodKey, TravelSpot[]> = {
  happy: [
    {
      name: "부산 광안리 해변",
      image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=700&q=80",
      description: "탁 트인 바다와 광안대교 야경이 기분 좋은 에너지를 한껏 끌어올려줘요. 신나는 기분 그대로 걷기 좋은 곳이에요.",
    },
    {
      name: "제주 협재 해수욕장",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80",
      description: "에메랄드빛 바다를 보고 있으면 좋은 기분이 두 배가 돼요. 비양도가 보이는 노을도 놓치지 마세요.",
    },
    {
      name: "서울 한강 뚝섬 유원지",
      image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=700&q=80",
      description: "돗자리 하나 펴놓고 좋아하는 음악 들으면서 앉아있기 좋은 곳이에요. 신난 기분을 조용히 만끽할 수 있어요.",
    },
  ],
  sad: [
    {
      name: "강원 정동진 모래시계 공원",
      image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80",
      description: "일출을 보며 마음을 가라앉히기 좋은 곳이에요. 새벽 바다는 슬픈 기분을 조용히 안아줘요.",
    },
    {
      name: "전남 순천만 습지",
      image: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=700&q=80",
      description: "갈대밭 사이를 천천히 걸으면 마음이 차분해져요. 노을 질 때 특히 위로가 되는 풍경이에요.",
    },
    {
      name: "경주 대릉원 돌담길",
      image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=700&q=80",
      description: "고요한 고분 사이 산책로를 걷다 보면 복잡한 마음이 천천히 정리돼요.",
    },
  ],
  angry: [
    {
      name: "강원 양양 서핑비치",
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=700&q=80",
      description: "파도 소리를 들으며 몸을 움직이면 화난 감정도 자연스럽게 풀려요. 서핑 체험도 스트레스 해소에 좋아요.",
    },
    {
      name: "충북 단양 패러글라이딩 활공장",
      image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=700&q=80",
      description: "하늘 위에서 답답했던 속을 시원하게 날려버릴 수 있는 곳이에요.",
    },
    {
      name: "지리산 둘레길 트레킹",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=700&q=80",
      description: "숨차게 걷다 보면 화가 났던 이유가 잘 기억나지 않을 정도로 몸도 마음도 개운해져요.",
    },
  ],
  bored: [
    {
      name: "서울 익선동 골목 상점가",
      image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=700&q=80",
      description: "작은 소품샵과 카페가 미로처럼 이어져 있어서 정처 없이 구경하기 좋아요. 심심할 틈이 없어져요.",
    },
    {
      name: "부산 감천문화마을",
      image: "https://images.unsplash.com/photo-1580810734222-2b8d0bcaa9a1?auto=format&fit=crop&w=700&q=80",
      description: "알록달록한 골목을 따라 숨은 그림 찾듯 포토스팟을 찾아다니다 보면 시간이 훌쩍 가요.",
    },
    {
      name: "인천 차이나타운",
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=80",
      description: "짧은 동선 안에 볼거리, 먹을거리가 몰려있어서 반나절 심심함을 달래기 딱 좋아요.",
    },
  ],
};
