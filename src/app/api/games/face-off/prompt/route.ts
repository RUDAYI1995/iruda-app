import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/upstage/client";

const FALLBACK_EXPRESSIONS = [
  "완전 놀란 표정",
  "억울해서 눈물이 나오려는 표정",
  "간식을 발견한 고양이 표정",
  "몰래 장난치다 걸린 표정",
  "세상 다 산 듯한 허탈한 표정",
  "복권 1등 당첨된 표정",
  "매운 음식 먹고 참는 표정",
  "짝사랑을 들켜버린 표정",
];

export async function GET() {
  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          "너는 '아싸게임 표정짓기 대결'의 진행자 AI루다야. 참가자들이 그 자리에서 즉흥적으로 지어야 할 재미있는 표정 미션을 한 문장으로 아주 짧게 한국어로 제시해. 예: '완전 놀란 표정'. 설명 없이 표정 미션 문장 하나만 출력해.",
      },
      { role: "user", content: "표정 미션 하나 줘" },
    ]);
    const expression = raw.replace(/["'.]/g, "").trim();
    if (!expression) throw new Error("빈 응답");
    return NextResponse.json({ expression });
  } catch {
    const expression =
      FALLBACK_EXPRESSIONS[Math.floor(Math.random() * FALLBACK_EXPRESSIONS.length)];
    return NextResponse.json({ expression });
  }
}
