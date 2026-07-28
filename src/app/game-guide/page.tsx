import Link from "next/link";

export default function GameGuidePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">아싸게임 소개</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          혼자여도 괜찮아, 나답게 즐기는 여행 보드게임이에요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-3xl">☁️</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">부담 없는 여행</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            경쟁보다 힐링! 편안하게 즐기는 게임이에요.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-3xl">🌱</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">혼자여도 즐거움</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            나만의 속도로 천천히 성장해요.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-3xl">❤️</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">따뜻한 응원</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            서로를 응원하며 함께 행복해져요.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
          아싸게임은 이런 게임이에요
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <li>🎲 <strong>보드게임</strong> — 주사위와 카드를 활용해 다양한 미션을 수행해요.</li>
          <li>🎒 <strong>여행과 성장</strong> — 다양한 장소를 여행하며 나만의 이야기를 만들어가요.</li>
          <li>💬 <strong>소통과 공감</strong> — 부담 없는 소통으로 마음을 나누고 공감해요.</li>
        </ul>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        혼자여도 괜찮아, 여기선 내가 주인공이니까! 🐾
      </p>

      <div className="flex justify-center gap-3">
        <Link
          href="/how-to-play"
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
        >
          플레이 방법 보기
        </Link>
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
