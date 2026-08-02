import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CONDITIONS = ["신규상품", "중고상품"];
const CATEGORIES = ["먹거리", "면세점", "여행상품"];

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country");
  if (!country) {
    return NextResponse.json({ error: "country가 필요해요" }, { status: 400 });
  }

  const listings = await prisma.ludariaListing.findMany({
    where: { countryName: country },
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    listings: listings.map((l) => ({
      id: l.id,
      countryName: l.countryName,
      title: l.title,
      price: l.price,
      condition: l.condition,
      category: l.category,
      description: l.description,
      imageUrl: l.imageUrl,
      seller: l.seller.name,
      createdAt: l.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { countryName, title, price, condition, category, description, imageUrl } = await request.json();

  if (typeof countryName !== "string" || !countryName.trim()) {
    return NextResponse.json({ error: "나라 이름을 입력해주세요" }, { status: 400 });
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "제목을 입력해주세요" }, { status: 400 });
  }
  if (typeof price !== "number" || price < 0) {
    return NextResponse.json({ error: "가격을 확인해주세요" }, { status: 400 });
  }
  if (!CONDITIONS.includes(condition)) {
    return NextResponse.json({ error: "상품 상태를 선택해주세요" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "카테고리를 선택해주세요" }, { status: 400 });
  }
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "설명을 입력해주세요" }, { status: 400 });
  }

  const listing = await prisma.ludariaListing.create({
    data: {
      countryName: countryName.trim(),
      title: title.trim(),
      price,
      condition,
      category,
      description: description.trim(),
      imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null,
      sellerId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, id: listing.id });
}
