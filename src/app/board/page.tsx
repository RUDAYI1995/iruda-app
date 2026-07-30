import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserActionMenu } from "@/components/UserActionMenu";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

const CATEGORY_STYLES: Record<string, string> = {
  "동행 구함": "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
  "여행 후기": "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
  "질문": "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  "자유": "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
};

function CategoryPill({ category }: { category: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        CATEGORY_STYLES[category] ?? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {category}
    </span>
  );
}

export default async function BoardPage() {
  const posts = await prisma.post.findMany({
    include: { author: true, comments: true },
  });

  const newest = [...posts].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  const oldest = [...posts].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const PostRow = ({ post }: { post: (typeof posts)[number] }) => (
    <div className="flex items-center gap-3 px-1 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
      <Link href={`/board/${post.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <CategoryPill category={post.category} />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {post.title}
        </p>
        {post.comments.length > 0 && (
          <span className="shrink-0 text-xs font-medium text-zinc-400">
            💬 {post.comments.length}
          </span>
        )}
      </Link>
      <UserActionMenu
        userId={post.authorId}
        name={post.author.name}
        className="shrink-0 text-xs text-zinc-400 hover:underline dark:text-zinc-600"
      />
      <Link href={`/board/${post.id}`} className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">
        {formatDate(post.createdAt)}
      </Link>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">게시판</h1>
          <Link
            href="/board/new"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
          >
            글쓰기
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-1 px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              최신글
            </h2>
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
              {newest.length === 0 ? (
                <p className="px-1 py-4 text-sm text-zinc-400">아직 글이 없어요.</p>
              ) : (
                newest.map((p) => <PostRow key={p.id} post={p} />)
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-1 px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              오래된글
            </h2>
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
              {oldest.length === 0 ? (
                <p className="px-1 py-4 text-sm text-zinc-400">아직 글이 없어요.</p>
              ) : (
                oldest.map((p) => <PostRow key={p.id} post={p} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
