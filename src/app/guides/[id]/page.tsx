import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StartChatButton } from "@/components/StartChatButton";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const guide = await prisma.guideProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!guide || guide.status !== "APPROVED") notFound();

  const languages: string[] = JSON.parse(guide.languages);
  const isMe = guide.userId === session.user.id;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {guide.user.name}
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          ⭐ {guide.rating.toFixed(1)}
        </p>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-3 leading-6 text-zinc-700 dark:text-zinc-300">{guide.bio}</p>
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span>📍 {guide.region}</span>
            <span>🗣 {languages.join(", ")}</span>
            <span>💰 {guide.hourlyRate.toLocaleString()}원/시간</span>
          </div>
        </div>

        {!isMe && (
          <div className="flex gap-3">
            <StartChatButton
              otherUserId={guide.userId}
              label="가이드에게 1:1 대화 신청"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
            />
          </div>
        )}
      </div>
    </div>
  );
}
