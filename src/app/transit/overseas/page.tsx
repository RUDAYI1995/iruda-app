import Link from "next/link";
import { OverseasRecommendationPanel } from "@/components/OverseasRecommendationPanel";

export default function OverseasTransitPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          소심한 사람들을 위한
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">해외 실시간 교통정보 추천</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          목적지와 날짜를 입력하면 AI루다가 항공편부터 호텔까지 가는 길을 코스로 추천해줘요.
        </p>
      </div>

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
