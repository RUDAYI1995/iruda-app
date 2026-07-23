import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateGroupChatForm } from "./create-form";

export default async function GroupChatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const groups = await prisma.groupChat.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-lg">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          단체 채팅방
        </h1>

        <CreateGroupChatForm />

        <div className="mt-6 flex flex-col gap-3">
          {groups.length === 0 ? (
            <p className="text-center text-sm text-zinc-400">
              아직 참여 중인 단체 채팅방이 없어요.
            </p>
          ) : (
            groups.map((g) => (
              <Link
                key={g.id}
                href={`/group-chats/${g.id}`}
                className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {g.name}
                  </h2>
                  <span className="text-xs text-zinc-400">인원 {g.members.length}명</span>
                </div>
                <p className="line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {g.messages[0]?.body ?? "아직 메시지가 없어요."}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
