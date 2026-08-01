import Link from "next/link";

export function AssaDungeonButton() {
  return (
    <Link
      href="/assa-dungeon"
      className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-slate-400 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition-transform hover:scale-105 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-200"
    >
      <span className="text-sm">🕳️</span>
      아싸던전
    </Link>
  );
}
