import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: session.user.id }, { userBId: session.user.id }],
    },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-lg">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">1:1 개인톡</h1>

        {conversations.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            아직 대화가 없어요. 정모원이나 가이드 상세 페이지에서 대화를 시작해보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {conversations.map((c) => {
              const other = c.userAId === session.user!.id ? c.userB : c.userA;
              return (
                <li key={c.id}>
                  <Link
                    href={`/messages/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {other.name}
                    </span>
                    <span className="max-w-[60%] truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {c.messages[0]?.body ?? "대화를 시작해보세요"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
