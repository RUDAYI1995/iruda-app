"use client";

import { SYSTEM_FRAUD_POSTS, PAPER_FRAUD_POSTS, type ElectionWatchPost } from "@/lib/electionWatchPosts";

function PostList({ posts }: { posts: ElectionWatchPost[] }) {
  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <div
          key={post.title}
          className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.title} className="h-28 w-full object-cover" />
          <div className="p-3">
            <p className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">{post.title}</p>
            <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{post.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ElectionWatchPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-y-0 right-0 flex w-full max-w-3xl flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-red-500">🗳️ 선거지킴이 모여라</p>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">투표 부정행위 제보</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-950/40"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          루다투표제·정모 현장 투표에서 발생한 부정행위 제보를 모아뒀어요. 전산(온라인) 조작과 실물 투표지 조작을
          나눠서 확인할 수 있어요.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">
              💻 전산조작을 고발합니다
            </h3>
            <PostList posts={SYSTEM_FRAUD_POSTS} />
          </div>
          <div>
            <h3 className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
              🗒️ 실물투표지 조작을 고발합니다
            </h3>
            <PostList posts={PAPER_FRAUD_POSTS} />
          </div>
        </div>
      </div>
    </div>
  );
}
