import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  const checkpoints = await prisma.questCheckpoint.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      verifications: session?.user?.id
        ? { where: { userId: session.user.id } }
        : false,
    },
  });

  return NextResponse.json(
    checkpoints.map((cp) => ({
      id: cp.id,
      name: cp.name,
      description: cp.description,
      radiusMeters: cp.radiusMeters,
      isOverseas: cp.isOverseas,
      createdByName: cp.createdBy.name,
      createdAt: cp.createdAt,
      verifiedByMe: session?.user?.id
        ? cp.verifications.some((v) => v.verified)
        : false,
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { name, description, lat, lng, isOverseas } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "코스 이름을 입력해주세요" }, { status: 400 });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: "현재 위치를 먼저 설정해주세요" },
      { status: 400 }
    );
  }

  const checkpoint = await prisma.questCheckpoint.create({
    data: {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
      lat,
      lng,
      isOverseas: Boolean(isOverseas),
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, id: checkpoint.id });
}
