import Link from "next/link";

const SIGNPOSTS = [
  { label: "모험자 길드", href: "/adventure/zone/cat-village", top: "50.5%" },
  { label: "루다 아카데미", href: "/adventure/zone/forest", top: "56.0%" },
  { label: "관광 야시장", href: "/adventure/night-market", top: "61.3%" },
  { label: "항구 지역", href: "/adventure/zone/port", top: "66.5%" },
];

export default function AdventurePlazaPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mb-4 flex w-full max-w-4xl items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-500">위대한 모험</p>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">🎪 만남의 광장</h1>
        </div>
        <Link
          href="/adventure"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← 루다대륙 지도로
        </Link>
      </div>

      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl shadow-xl" style={{ aspectRatio: "1536 / 1024" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/plaza.png" alt="만남의 광장" className="absolute inset-0 h-full w-full object-cover" />

        {SIGNPOSTS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            title={s.label}
            className="absolute right-[2%] h-[4.5%] w-[16%] -translate-y-1/2 rounded-md transition-colors hover:bg-white/20"
            style={{ top: s.top }}
          >
            <span className="sr-only">{s.label}</span>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
        오른쪽 표지판을 눌러 모험자 길드 · 루다 아카데미 · 관광 야시장 · 항구 지역으로 이동해보세요.
      </p>
    </div>
  );
}
