import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/upstage/client";

const FALLBACK_TOPICS = [
  "여행 갈 때 캐리어파 vs 백팩파",
  "여행 계획 완벽하게 짜기파 vs 즉흥 여행파",
  "여행지에서 맛집 줄서기파 vs 아무데나 들어가기파",
  "국내 여행파 vs 해외 여행파",
  "숙소는 호텔파 vs 게스트하우스파",
];

export async function GET() {
  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          "너는 아싸게임 '투표 대결'의 진행자 AI루다야. 두 팀이 서로 자기 편을 설득력있게 주장할만한 재미있는 여행 관련 대결 주제를 'A파 vs B파' 형태로 한국어 한 문장으로 아주 짧게 제시해. 설명 없이 주제 문장 하나만 출력해.",
      },
      { role: "user", content: "투표 대결 주제 하나 줘" },
    ]);
    const topic = raw.replace(/["'.]/g, "").trim();
    if (!topic) throw new Error("빈 응답");
    return NextResponse.json({ topic });
  } catch {
    const topic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
    return NextResponse.json({ topic });
  }
}
