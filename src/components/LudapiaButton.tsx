import Link from "next/link";

export function LudapiaButton() {
  return (
    <Link
      href="/ludapia"
      className="flex h-[34px] w-[116px] items-center justify-center gap-1.5 rounded-full border border-slate-400 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition-transform hover:scale-105 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-200"
    >
      <span className="relative text-sm">
        🕴️
        <span className="absolute -right-2 -top-1 text-[10px]">🔫</span>
        <span className="absolute -right-3 -top-3 text-[9px]">💨</span>
      </span>
      루다피아
    </Link>
  );
}
