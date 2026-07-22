import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatComplete } from "@/lib/upstage/client";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { meetupId } = await request.json();
  if (!meetupId) {
    return NextResponse.json({ error: "meetupId가 필요해요" }, { status: 400 });
  }

  const [myProfile, meetup] = await Promise.all([
    prisma.personalityProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.meetup.findUnique({
      where: { id: meetupId },
      include: {
        activity: true,
        members: {
          include: { user: { include: { personalityProfile: true } } },
        },
      },
    }),
  ]);

  if (!myProfile) {
    return NextResponse.json({ error: "성향 테스트를 먼저 완료해주세요" }, { status: 404 });
  }
  if (!meetup) {
    return NextResponse.json({ error: "정모를 찾을 수 없어요" }, { status: 404 });
  }

  const myInterests: string[] = JSON.parse(myProfile.interests);
  const otherMembers = meetup.members.filter((m) => m.userId !== session.user!.id);
  const otherInterests = otherMembers.flatMap((m) =>
    m.user.personalityProfile ? (JSON.parse(m.user.personalityProfile.interests) as string[]) : []
  );
  const commonInterests = [...new Set(myInterests.filter((i) => otherInterests.includes(i)))];

  try {
    const raw = await chatComplete([
      {
        role: "system",
        content:
          "너는 낯을 많이 가리는 소심한 여행자들을 위한 대화 시작 문구 추천가야. 어색하지 않고 부담스럽지 않은, 짧고 자연스러운 한국어 첫 마디를 만들어줘. 이모지는 최대 1개만 쓰고, 너무 밝거나 오버스럽지 않게. 번호 없이 줄바꿈으로 구분된 3개의 문장만 출력해.",
      },
      {
        role: "user",
        content: `정모 활동: ${meetup.activity.name} (${meetup.activity.description})\n나와 상대방이 공통으로 가진 관심사: ${
          commonInterests.length > 0 ? commonInterests.join(", ") : "아직 파악된 공통 관심사 없음"
        }\n이 정모 채팅에서 처음 건넬 말 3개를 추천해줘.`,
      },
    ]);

    const suggestions = raw
      .split("\n")
      .map((line) => line.replace(/^[-*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "추천 생성 중 오류가 발생했어요" },
      { status: 500 }
    );
  }
}
