import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.personalityProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-zinc-50 px-6 py-24 dark:bg-black">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        환영해요, {session.user.name}님
      </h1>

      {!profile && (
        <p className="text-zinc-600 dark:text-zinc-400">
          아직 성향 테스트를 안 하셨다면 먼저 진행해주세요.
        </p>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={profile ? "/result" : "/test/category"}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {profile ? "내 성향 결과 보기" : "성향테스트 하러가기"}
        </Link>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          홈페이지로 이동하기
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900">
          로그아웃
        </button>
      </form>
    </div>
  );
}
