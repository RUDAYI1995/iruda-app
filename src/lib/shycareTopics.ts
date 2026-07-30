export const CARE_TOPIC_LABELS: Record<string, string> = {
  heart: "마음 상담",
  travel: "여행 고민 해결",
  relationship: "대인관계 상담",
  courage: "용기 충전",
};

export function isCareTopic(topic: string): boolean {
  return topic in CARE_TOPIC_LABELS;
}
