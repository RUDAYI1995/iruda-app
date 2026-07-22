import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1),
  category: z.enum(["자연", "역사", "문화", "맛집", "액티비티"]),
  description: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();
  const favoritesOnly = searchParams.get("favoritesOnly") === "true";

  const attractions = await prisma.attraction.findMany({
    where: {
      ...(category && category !== "전체" && !favoritesOnly ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { region: { contains: q } },
            ],
          }
        : {}),
      ...(favoritesOnly && session?.user?.id
        ? { favorites: { some: { userId: session.user.id } } }
        : {}),
    },
    include: { favorites: true },
    orderBy: { createdAt: "desc" },
  });

  const result = attractions.map((a) => ({
    id: a.id,
    name: a.name,
    region: a.region,
    category: a.category,
    description: a.description,
    isFavorite: session?.user?.id
      ? a.favorites.some((f) => f.userId === session.user!.id)
      : false,
  }));

  return NextResponse.json({ attractions: result });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  }

  const attraction = await prisma.attraction.create({
    data: { ...parsed.data, addedById: session.user.id },
  });

  return NextResponse.json({ ok: true, id: attraction.id });
}
