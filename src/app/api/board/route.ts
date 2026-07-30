import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addExp, EXP_SOURCES } from "@/lib/leveling";
import { addMileage, MILEAGE_SOURCES } from "@/lib/currency";

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: { ...parsed.data, authorId: session.user.id },
  });

  await addExp(session.user.id, EXP_SOURCES.BOARD_POST);
  await addMileage(session.user.id, MILEAGE_SOURCES.BOARD_POST);

  return NextResponse.json({ ok: true, id: post.id });
}
