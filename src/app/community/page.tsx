import Link from "next/link";

export default function CommunityIntroPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">루다월드 커뮤니티</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          부담 없이 소통하고, 함께 여행을 만들어가요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/board"
          className="rounded-2xl border border-zinc-200 bg-white p-5 text-center transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          <div className="mb-2 text-3xl">📋</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">게시판</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            자유롭게 글을 올리고 댓글로 이야기 나눠요.
          </p>
        </Link>
        <Link
          href="/meetups"
          className="rounded-2xl border border-zinc-200 bg-white p-5 text-center transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          <div className="mb-2 text-3xl">🧑‍🤝‍🧑</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">정모</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            성향이 맞는 소규모 그룹과 여행 정모를 가져요.
          </p>
        </Link>
        <Link
          href="/group-chats"
          className="rounded-2xl border border-zinc-200 bg-white p-5 text-center transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          <div className="mb-2 text-3xl">💬</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">단체채팅</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            여러 명이 함께 대화하며 여행을 조율해요.
          </p>
        </Link>
      </div>

      <div className="rounded-2xl bg-pink-50 p-5 text-center text-sm text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
        🐾 말하기 어려우면 조용히 있어도 괜찮아요. 원하는 만큼만 참여해요.
      </div>

      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          ← 첫 화면으로
        </Link>
      </div>
    </div>
  );
}
