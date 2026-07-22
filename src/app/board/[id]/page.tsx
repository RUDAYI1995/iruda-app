import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StartChatButton } from "@/components/StartChatButton";
import { CommentForm } from "./comment-form";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!post) notFound();

  const isMine = post.authorId === session.user.id;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-lg">
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {post.category}
        </p>
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {post.title}
        </h1>
        <p className="mb-6 text-xs text-zinc-500 dark:text-zinc-400">
          {post.author.name} · {new Date(post.createdAt).toLocaleString("ko-KR")}
        </p>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {post.body}
        </div>

        {!isMine && (
          <div className="mb-8">
            <StartChatButton otherUserId={post.authorId} label="게시자에게 1:1 대화 신청" />
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          댓글 {post.comments.length}
        </h2>
        <div className="mb-4 flex flex-col gap-2">
          {post.comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-white px-4 py-2 text-sm dark:bg-zinc-950"
            >
              <p className="mb-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {c.author.name}
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">{c.body}</p>
            </div>
          ))}
          {post.comments.length === 0 && (
            <p className="text-sm text-zinc-400">첫 댓글을 남겨보세요.</p>
          )}
        </div>

        <CommentForm postId={post.id} />
      </div>
    </div>
  );
}
