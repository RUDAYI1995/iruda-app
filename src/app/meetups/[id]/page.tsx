import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JoinButton } from "./join-button";
import { Icebreaker } from "./icebreaker";
import { StartChatButton } from "@/components/StartChatButton";
import { UserActionMenu } from "@/components/UserActionMenu";

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const meetup = await prisma.meetup.findUnique({
    where: { id },
    include: { activity: true, members: { include: { user: true } } },
  });

  if (!meetup) notFound();

  const alreadyJoined = meetup.members.some((m) => m.userId === session.user!.id);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-xl">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {meetup.activity.name}
        </h1>
        <p className="mb-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {meetup.activity.description}
        </p>

        <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-zinc-700 dark:text-zinc-300">📍 장소: {meetup.location}</p>
          <p className="text-zinc-700 dark:text-zinc-300">
            🗓 일시: {new Date(meetup.scheduledAt).toLocaleString("ko-KR")}
          </p>
          <p className="text-zinc-700 dark:text-zinc-300">
            👥 참여 인원: {meetup.members.length} / {meetup.maxSize}명 (최소{" "}
            {meetup.minSize}명)
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            현재 참여자
          </h2>
          {meetup.members.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              아직 참여자가 없어요. 첫 참여자가 되어보세요!
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {meetup.members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-2 text-sm dark:bg-zinc-950"
                >
                  <UserActionMenu
                    userId={m.userId}
                    name={m.user.name}
                    className="text-zinc-800 hover:underline dark:text-zinc-200"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      궁합 {Math.round(m.matchScore)}점
                    </span>
                    {alreadyJoined && m.userId !== session.user!.id && (
                      <StartChatButton
                        otherUserId={m.userId}
                        label="대화"
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {alreadyJoined && <Icebreaker meetupId={meetup.id} />}

        <JoinButton meetupId={meetup.id} alreadyJoined={alreadyJoined} />

        {alreadyJoined && meetup.members.length >= meetup.minSize && (
          <div className="mt-4 flex justify-center">
            <Link
              href={`/meetups/${meetup.id}/ready`}
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700"
            >
              레디룸 입장하기
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          참여 신청 시 나의 성향 궁합 점수가 기존 참여자들과 비교돼요 (대분류가
          다르거나 궁합 점수가 낮으면 참여가 제한될 수 있어요)
        </p>
      </div>
    </div>
  );
}
