import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  languages: z.array(z.string()).min(1),
  region: z.string().min(1),
  hourlyRate: z.number().min(0),
  bio: z.string().min(10),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { languages, region, hourlyRate, bio } = parsed.data;

  await prisma.guideProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      status: "PENDING",
      languages: JSON.stringify(languages),
      region,
      hourlyRate,
      bio,
    },
    update: {
      status: "PENDING",
      languages: JSON.stringify(languages),
      region,
      hourlyRate,
      bio,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "BOTH" },
  });

  return NextResponse.json({ ok: true });
}
