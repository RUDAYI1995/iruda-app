import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.assaWorldPost.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      content: p.content,
      author: p.user.name,
      voteId: p.voteId,
      createdAt: p.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { imageUrl, content, submitToVote } = await request.json();
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return NextResponse.json({ error: "사진을 먼저 올려주세요" }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "글을 입력해주세요" }, { status: 400 });
  }

  let voteId: string | null = null;
  if (submitToVote) {
    const vote = await prisma.rudaVote.create({
      data: {
        kind: "MISSION",
        label: `[아싸세상] ${content.trim().slice(0, 40)}`,
        photoAUrl: imageUrl,
        requesterId: session.user.id,
        contextJson: {},
      },
    });
    voteId = vote.id;
  }

  const post = await prisma.assaWorldPost.create({
    data: {
      userId: session.user.id,
      imageUrl: imageUrl.trim(),
      content: content.trim(),
      voteId,
    },
  });

  return NextResponse.json({ ok: true, id: post.id, voteId });
}
