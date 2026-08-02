import Link from "next/link";

export function LudariaButton() {
  return (
    <Link
      href="/ludaria"
      className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-yellow-300 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-800 shadow-sm transition-transform hover:scale-105 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200"
    >
      <span className="text-sm">🍔</span>
      루다리아
    </Link>
  );
}
