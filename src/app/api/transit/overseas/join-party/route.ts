import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { city, date, memberUserIds } = await request.json();
  if (typeof city !== "string" || typeof date !== "string" || !Array.isArray(memberUserIds)) {
    return NextResponse.json({ error: "잘못된 요청이에요" }, { status: 400 });
  }

  const memberIds = Array.from(
    new Set([session.user.id, ...memberUserIds.filter((id): id is string => typeof id === "string")])
  );

  const group = await prisma.groupChat.create({
    data: {
      name: `${city} ${date} 여행 동행`,
      creatorId: session.user.id,
      members: { create: memberIds.map((userId) => ({ userId })) },
    },
  });

  return NextResponse.json({ ok: true, id: group.id });
}
