import Link from "next/link";
import { notFound } from "next/navigation";
import { getZone } from "@/lib/adventureZones";
import { ZoneMapClient } from "./zone-map-client";

export default async function AdventureZonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const zone = getZone(slug);
  if (!zone) notFound();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mb-4 flex w-full max-w-6xl items-center justify-between">
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {zone.number}. {zone.name}
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border-2 border-amber-300 bg-amber-50 px-7 py-3.5 text-lg font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
          >
            🔒 해금 미션 확인
          </button>
          <Link
            href="/adventure"
            className="rounded-full border-2 border-zinc-300 px-7 py-3.5 text-lg font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            ← 루다대륙 지도로
          </Link>
        </div>
      </div>

      <ZoneMapClient zone={zone} />

      <p className="mt-4 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
        {zone.desc}
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
        &ldquo;모험하기&rdquo;를 누르면 이 지역에 내 캐릭터가 등장해요 🐾
      </p>
    </div>
  );
}
