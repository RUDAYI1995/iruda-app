import Link from "next/link";
import { DomesticToAirportPanel } from "@/components/DomesticToAirportPanel";
import { OverseasRecommendationPanel } from "@/components/OverseasRecommendationPanel";

export default function CombinedTransitPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">국내+해외 통합 교통정보</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          집(또는 현재 위치)에서 공항까지, 공항에서 목적지 호텔까지 — 여정 전체를 한 번에 이어서
          확인해요.
        </p>
      </div>

      <DomesticToAirportPanel />
      <OverseasRecommendationPanel />

      <div className="flex justify-center">
        <Link
          href="/home"
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
        >
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
