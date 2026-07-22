import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";
import { BROAD_CATEGORIES, codeFromScores, type AxisScores } from "@/lib/matching/scoring";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const profile = await prisma.personalityProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "성향 테스트를 먼저 완료해주세요" }, { status: 404 });
  }

  if (profile.aiExplanation) {
    return NextResponse.json({ explanation: profile.aiExplanation, cached: true });
  }

  const axisScores = profile.axisScores as AxisScores;
  const code = codeFromScores(axisScores);
  const category = BROAD_CATEGORIES.find((c) => c.value === profile.broadCategory);
  const interests: string[] = JSON.parse(profile.interests);

  try {
    const explanation = await chatComplete([
      {
        role: "system",
        content:
          "너는 소심한 여행자를 위한 여행 매칭 앱 '이루다'의 성향 해설가야. 사용자의 4글자 코드와 여행 성향 데이터를 보고, 따뜻하고 다정한 말투로 2~3문장짜리 한국어 해설을 써줘. 과장하지 말고, 부담 주지 말고, 있는 그대로 다정하게 설명해.",
      },
      {
        role: "user",
        content: `성향 코드: ${code}\n대분류: ${category?.label} (${category?.desc})\n선호 여행 속도: ${profile.pace}\n관심사: ${interests.join(", ")}`,
      },
    ]);

    await prisma.personalityProfile.update({
      where: { userId: session.user.id },
      data: { aiExplanation: explanation },
    });

    return NextResponse.json({ explanation, cached: false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI 해설 생성 중 오류가 발생했어요" },
      { status: 500 }
    );
  }
}
