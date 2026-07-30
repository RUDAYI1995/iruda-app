import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  const isOperator = Boolean((session?.user as { isOperator?: boolean } | undefined)?.isOperator);
  if (!isOperator) {
    return NextResponse.json({ error: "운영자만 사용할 수 있어요" }, { status: 403 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 5,
  });
  return NextResponse.json(users);
}
