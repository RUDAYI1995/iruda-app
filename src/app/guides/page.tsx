import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeGuideScore, filterGuides, type GuideCandidate } from "@/lib/matching/guide";
import type { AxisScores } from "@/lib/matching/scoring";

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; region?: string }>;
}) {
  const { language, region } = await searchParams;
  const session = await auth();

  const [guides, myProfile] = await Promise.all([
    prisma.guideProfile.findMany({
      where: { status: "APPROVED" },
      include: { user: { include: { personalityProfile: true } } },
    }),
    session?.user?.id
      ? prisma.personalityProfile.findUnique({ where: { userId: session.user.id } })
      : null,
  ]);

  const candidates: (GuideCandidate & {
    name: string;
    bio: string;
    rating: number;
    createdAt: Date;
  })[] = guides.map((g) => ({
    id: g.id,
    languages: JSON.parse(g.languages),
    region: g.region,
    hourlyRate: g.hourlyRate,
    axisScores: g.user.personalityProfile?.axisScores as AxisScores | undefined,
    interests: g.user.personalityProfile
      ? JSON.parse(g.user.personalityProfile.interests)
      : undefined,
    name: g.user.name,
    bio: g.bio,
    rating: g.rating,
    createdAt: g.createdAt,
  }));

  const filtered = filterGuides(candidates, { language, region });

  const scored = myProfile
    ? filtered.map((g) => ({
        ...g,
        score: computeGuideScore(
          {
            axisScores: myProfile.axisScores as AxisScores,
            interests: JSON.parse(myProfile.interests),
            budgetLevel: myProfile.budgetLevel,
            languages: JSON.parse(myProfile.languages),
          },
          g
        ),
      }))
    : filtered.map((g) => ({ ...g, score: null as number | null }));

  const newest = [...scored].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const oldest = [...scored].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const GuideCard = ({ g }: { g: (typeof scored)[number] }) => (
    <Link
      href={`/guides/${g.id}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{g.name}</h3>
        {g.score !== null && (
          <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            궁합 {Math.round(g.score)}점
          </span>
        )}
      </div>
      <p className="mb-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{g.bio}</p>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span>📍 {g.region}</span>
        <span>🗣 {(g.languages as string[]).join(", ")}</span>
        <span>💰 {g.hourlyRate.toLocaleString()}원/시간</span>
        <span>⭐ {g.rating.toFixed(1)}</span>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            데이가이드 마켓플레이스
          </h1>
          <Link
            href="/guides/apply"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            가이드 신청하기
          </Link>
        </div>

        <form className="mb-4 flex gap-2" action="/guides">
          <input
            name="region"
            defaultValue={region}
            placeholder="지역 (예: 오사카)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            name="language"
            defaultValue={language}
            placeholder="언어 (예: ja)"
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            검색
          </button>
        </form>

        {!myProfile && (
          <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-600">
            성향 테스트를 완료하면 나와 궁합이 좋은 순서로 정렬해드려요.
          </p>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              최신 가이드
            </h2>
            <div className="flex flex-col gap-3">
              {newest.length === 0 ? (
                <p className="text-sm text-zinc-400">조건에 맞는 가이드가 아직 없어요.</p>
              ) : (
                newest.map((g) => <GuideCard key={g.id} g={g} />)
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              오래된 가이드
            </h2>
            <div className="flex flex-col gap-3">
              {oldest.length === 0 ? (
                <p className="text-sm text-zinc-400">조건에 맞는 가이드가 아직 없어요.</p>
              ) : (
                oldest.map((g) => <GuideCard key={g.id} g={g} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
