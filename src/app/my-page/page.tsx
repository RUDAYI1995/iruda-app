import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MyPageIntroPage() {
  const session = await auth();
  const profile = session?.user
    ? await prisma.personalityProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">마이페이지</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          {session?.user
            ? `환영해요, ${session.user.name}님 🐾`
            : "로그인하면 나만의 여행 기록을 볼 수 있어요."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-3xl">🧭</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">내 성향 결과</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            나의 4글자 성향 코드와 맞춤 해설을 확인해요.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-3xl">🗓️</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">정모·예약 내역</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            참여한 정모와 가이드 예약을 한눈에 모아봐요.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-3xl">🏅</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">레벨·마일리지</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            아싸게임과 활동으로 모은 마일리지를 확인해요.
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {session?.user ? (
          <Link
            href={profile ? "/result" : "/test/category"}
            className="rounded-full bg-zinc-900 px-8 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {profile ? "내 성향 결과 보기" : "성향테스트 하러가기"}
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
            >
              가입하기
            </Link>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
        >
          ← 첫 화면으로
        </Link>
      </div>
    </div>
  );
}
