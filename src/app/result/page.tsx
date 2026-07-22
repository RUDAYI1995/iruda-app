import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { codeFromScores, BROAD_CATEGORIES, type AxisScores } from "@/lib/matching/scoring";
import { AiExplanation } from "./ai-explanation";

export default async function ResultPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.personalityProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/test/category");

  const axisScores = profile.axisScores as AxisScores;
  const code = codeFromScores(axisScores);
  const category = BROAD_CATEGORIES.find((c) => c.value === profile.broadCategory);
  const interests: string[] = JSON.parse(profile.interests);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-lg text-center">
        <p className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          나의 여행 성향 유형
        </p>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {code}
        </h1>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {category?.label}
          </h2>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {category?.desc}
          </p>
        </div>

        <AiExplanation initial={profile.aiExplanation} />

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {interests.map((i) => (
            <span
              key={i}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {i}
            </span>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          대시보드로 이동
        </Link>
      </div>
    </div>
  );
}
