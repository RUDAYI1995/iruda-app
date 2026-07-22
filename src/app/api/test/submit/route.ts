import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeAxisScores } from "@/lib/matching/scoring";
import { embedText } from "@/lib/upstage/client";

const schema = z.object({
  category: z.enum(["CONFORMIST", "SMALL_TALK", "COHABITANT", "TRANSIT_ONLY"]),
  answers: z.record(z.string(), z.number()),
  style: z.object({
    pace: z.string(),
    groupSizeComfort: z.number(),
    interests: z.array(z.string()).min(1),
    budgetLevel: z.number(),
    alcoholComfort: z.boolean(),
    languages: z.array(z.string()),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { category, answers, style } = parsed.data;
  const axisScores = computeAxisScores(answers);

  // Upstage 임베딩으로 관심사 의미 유사도 매칭을 보강 (키 없거나 호출 실패해도 테스트 제출은 계속 진행)
  let interestEmbedding: string | null = null;
  try {
    const [embedding] = await embedText(style.interests.join(", "));
    interestEmbedding = JSON.stringify(embedding);
  } catch {
    interestEmbedding = null;
  }

  await prisma.personalityProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      broadCategory: category,
      axisScores,
      pace: style.pace,
      groupSizeComfort: style.groupSizeComfort,
      interests: JSON.stringify(style.interests),
      budgetLevel: style.budgetLevel,
      alcoholComfort: style.alcoholComfort,
      anxietyTriggers: JSON.stringify([]),
      languages: JSON.stringify(style.languages),
      interestEmbedding,
    },
    update: {
      broadCategory: category,
      axisScores,
      pace: style.pace,
      groupSizeComfort: style.groupSizeComfort,
      interests: JSON.stringify(style.interests),
      budgetLevel: style.budgetLevel,
      alcoholComfort: style.alcoholComfort,
      languages: JSON.stringify(style.languages),
      ...(interestEmbedding ? { interestEmbedding } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
