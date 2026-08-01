import Link from "next/link";

export function RudaVoteButton() {
  return (
    <Link
      href="/ruda-vote"
      className="flex h-[34px] w-[116px] items-center justify-center gap-1.5 rounded-full border border-red-400 bg-red-100 px-2.5 py-1.5 text-xs font-bold text-black shadow-sm transition-transform hover:scale-105 dark:border-red-700 dark:bg-red-950/40 dark:text-white"
    >
      <span className="text-sm">🗳️</span>
      루다투표제
    </Link>
  );
}
