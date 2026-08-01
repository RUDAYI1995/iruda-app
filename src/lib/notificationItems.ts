export type DetectedItem = { keyword: string; emoji: string };

// 알림 내용에 이 키워드가 들어있으면 가방 애니메이션에 해당 이모지 아이템으로 표시함
const KEYWORD_ITEMS: { keywords: string[]; emoji: string }[] = [
  { keywords: ["가방", "짐"], emoji: "🧳" },
  { keywords: ["칫솔", "치약"], emoji: "🪥" },
  { keywords: ["노트북", "랩탑"], emoji: "💻" },
  { keywords: ["여권"], emoji: "📔" },
  { keywords: ["지갑"], emoji: "👛" },
  { keywords: ["돈", "현금", "용돈"], emoji: "💵" },
  { keywords: ["충전기", "케이블", "보조배터리"], emoji: "🔌" },
  { keywords: ["우산"], emoji: "☂️" },
  { keywords: ["카메라"], emoji: "📷" },
  { keywords: ["옷", "티셔츠", "잠옷"], emoji: "👕" },
  { keywords: ["물병", "텀블러"], emoji: "🍶" },
  { keywords: ["선글라스"], emoji: "🕶️" },
  { keywords: ["화장품", "선크림"], emoji: "💄" },
  { keywords: ["신발", "운동화"], emoji: "👟" },
  { keywords: ["약"], emoji: "💊" },
  { keywords: ["티켓", "항공권", "표"], emoji: "🎫" },
  { keywords: ["휴대폰", "폰"], emoji: "📱" },
  { keywords: ["이어폰", "헤드폰"], emoji: "🎧" },
  { keywords: ["책"], emoji: "📖" },
];

export function extractItems(text: string): DetectedItem[] {
  const found: DetectedItem[] = [];
  const seen = new Set<string>();
  for (const group of KEYWORD_ITEMS) {
    for (const keyword of group.keywords) {
      if (text.includes(keyword) && !seen.has(group.emoji)) {
        found.push({ keyword, emoji: group.emoji });
        seen.add(group.emoji);
        break;
      }
    }
  }
  return found;
}
