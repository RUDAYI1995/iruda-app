import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MeetupsPage() {
  const meetups = await prisma.meetup.findMany({
    include: { activity: true, members: true },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          정모 목록
        </h1>

        <div className="flex flex-col gap-4">
          {meetups.map((m) => (
            <Link
              key={m.id}
              href={`/meetups/${m.id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
            >
              <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {m.activity.name}
              </h2>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                {m.activity.description}
              </p>
              <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span>📍 {m.location}</span>
                <span>
                  🗓 {new Date(m.scheduledAt).toLocaleDateString("ko-KR")}
                </span>
                <span>
                  👥 {m.members.length}/{m.maxSize}명
                </span>
              </div>
            </Link>
          ))}

          {meetups.length === 0 && (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              아직 열린 정모가 없어요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
