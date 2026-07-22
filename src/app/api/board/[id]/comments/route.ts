import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { body } = await request.json();
  if (!body || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "댓글 내용을 입력해주세요" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없어요" }, { status: 404 });
  }

  await prisma.comment.create({
    data: { postId, authorId: session.user.id, body: body.trim() },
  });

  return NextResponse.json({ ok: true });
}
