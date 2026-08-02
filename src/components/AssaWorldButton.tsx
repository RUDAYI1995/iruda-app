import Link from "next/link";

export function AssaWorldButton() {
  return (
    <Link
      href="/assa-world"
      className="flex h-[34px] w-[116px] items-center justify-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 shadow-sm transition-transform hover:scale-105 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <span className="text-sm">✨</span>
      아싸세상
    </Link>
  );
}
