import { chatComplete } from "@/lib/upstage/client";
import { extractItems, type DetectedItem } from "@/lib/notificationItems";

const MAX_ITEMS = 6;

const SYSTEM_PROMPT = `너는 문장에서 "챙겨야 할 물건/준비물"로 언급된 단어를 찾아내는 도우미야.
문장을 읽고, 실제로 챙기거나 준비해야 할 구체적인 사물만 골라서 각각에 제일 잘 어울리는 이모지 1개씩 짝지어줘.
시간, 장소, 사람 이름, 감정 표현 등은 제외하고 오직 "물건"만 골라.

반드시 아래 JSON 형식으로만 답해. 다른 설명은 절대 붙이지 마:
{"items":[{"keyword":"문장에 나온 단어 그대로","emoji":"어울리는 이모지 1개"}]}

물건이 하나도 없으면 {"items":[]}로 답해.`;

// 사전에 없는 단어도 AI가 알아서 이모지를 찾아 짝지어줌 — 사전 매칭을 먼저 쓰고,
// AI가 찾은 것 중 이미 잡힌 이모지/키워드와 겹치지 않는 것만 추가함.
export async function resolveItems(text: string): Promise<DetectedItem[]> {
  const dictionaryItems = extractItems(text);
  if (!text.trim()) return dictionaryItems;

  try {
    const raw = await chatComplete([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ]);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return dictionaryItems;

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.items)) return dictionaryItems;

    const seenEmoji = new Set(dictionaryItems.map((i) => i.emoji));
    const merged = [...dictionaryItems];

    for (const raw of parsed.items) {
      if (merged.length >= MAX_ITEMS) break;
      const keyword = typeof raw?.keyword === "string" ? raw.keyword.trim() : "";
      const emoji = typeof raw?.emoji === "string" ? raw.emoji.trim() : "";
      if (!keyword || !emoji) continue;
      if (seenEmoji.has(emoji)) continue;
      if (!text.includes(keyword)) continue; // 실제로 본문에 있는 단어만 인정
      merged.push({ keyword, emoji });
      seenEmoji.add(emoji);
    }

    return merged;
  } catch (error) {
    console.error("AI 이모지 매칭 실패, 사전 매칭만 사용", error);
    return dictionaryItems;
  }
}
