const MODE_META: Record<string, { emoji: string; bg: string }> = {
  TRAIN: { emoji: "🚄", bg: "bg-blue-100 dark:bg-blue-950/40" },
  SUBWAY: { emoji: "🚇", bg: "bg-indigo-100 dark:bg-indigo-950/40" },
  BUS: { emoji: "🚌", bg: "bg-green-100 dark:bg-green-950/40" },
  TAXI: { emoji: "🚕", bg: "bg-yellow-100 dark:bg-yellow-950/40" },
  WALK: { emoji: "🚶", bg: "bg-zinc-100 dark:bg-zinc-800" },
  AIRPLANE: { emoji: "✈️", bg: "bg-sky-100 dark:bg-sky-950/40" },
};

export function TransitModeIcon({ mode, className }: { mode: string; className?: string }) {
  const meta = MODE_META[mode] ?? MODE_META.WALK;
  return (
    <div
      className={`flex items-center justify-center rounded-full ${meta.bg} ${className ?? "h-12 w-12 text-2xl"}`}
    >
      {meta.emoji}
    </div>
  );
}
