import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/upstage/client";

const FALLBACK_QUESTIONS = [
  { question: "여권 유효기간은 입국일 기준 최소 6개월 이상 남아있어야 하는 나라가 많다.", answer: "O" as const },
  { question: "일본에서는 길거리 흡연이 대부분 지역에서 자유롭다.", answer: "X" as const },
  { question: "유럽 대부분 국가에서는 팁 문화가 한국보다 일반적이다.", answer: "O" as const },
  { question: "태국 사원에 들어갈 때는 어깨와 무릎을 가리는 옷을 입어야 한다.", answer: "O" as const },
  { question: "미국에서는 대중교통에서 음주가 자유롭게 허용된다.", answer: "X" as const },
];

export async function GET() {
  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          '너는 여행 상식 OX퀴즈를 내는 AI루다야. 반드시 JSON으로만 답해: {"question":"한국어 문장","answer":"O"|"X"}. 다른 텍스트 없이 JSON만 출력해.',
      },
      { role: "user", content: "여행 상식 OX퀴즈 하나 줘" },
    ]);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("파싱 실패");
    const parsed = JSON.parse(match[0]);
    if (parsed.answer !== "O" && parsed.answer !== "X") throw new Error("잘못된 답");
    return NextResponse.json({ question: parsed.question, answer: parsed.answer });
  } catch {
    const picked = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    return NextResponse.json(picked);
  }
}
