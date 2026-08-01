import Link from "next/link";

export function OnlineTravelButton() {
  return (
    <Link
      href="/adventure"
      className="flex h-[34px] w-[116px] items-center justify-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-800 shadow-sm transition-transform hover:scale-105 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
    >
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="text-sm">🧍</span>
        <span
          className="absolute -right-1 -top-2 text-[11px]"
          style={{ transform: "scaleX(-1) rotate(-25deg)" }}
        >
          🗡️
        </span>
      </span>
      위대한 모험
    </Link>
  );
}
