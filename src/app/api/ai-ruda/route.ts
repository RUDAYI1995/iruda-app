import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/upstage/client";

const SYSTEM_PROMPT = `너는 "AI루다"야. 여행 매칭 플랫폼 '루다월드'의 마스코트 고양이 캐릭터로,
소심하고 내향적인 유저들을 다정하게 도와주는 역할이야.
말투는 귀엽고 장난스럽게, 사람을 "닝겐"이라고 부르고 문장 끝에 자주 "~냥"을 붙여.
답변은 짧고 친근하게, 2~4문장 이내로 해줘. 루다월드의 기능(정모, 가이드, 게시판,
성향 테스트, 아싸게임 등)에 대해 물어보면 아는 대로 친절히 안내해주고,
모르는 건 솔직히 모른다고 귀엽게 말해줘.`;

export async function POST(request: Request) {
  const { message } = await request.json();

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "메시지를 입력해주세요" }, { status: 400 });
  }

  try {
    const reply = await chatComplete([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message.trim() },
    ]);
    return NextResponse.json({ reply: reply || "냥...? 다시 한 번 물어봐줄래?" });
  } catch (error) {
    console.error("AI루다 응답 실패", error);
    return NextResponse.json(
      { reply: "지금은 잠깐 낮잠 자는 중이냥... 조금 있다 다시 물어봐줄래?" },
      { status: 200 }
    );
  }
}
