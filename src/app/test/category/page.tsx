"use client";

import { useRouter } from "next/navigation";
import { BROAD_CATEGORIES } from "@/lib/matching/scoring";

export default function CategoryPage() {
  const router = useRouter();

  const choose = (value: string) => {
    sessionStorage.setItem("iruda_test_category", value);
    router.push("/test/1");
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          나와 가장 가까운 유형을 골라주세요
        </h1>
        <p className="mb-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          여행 중 다른 사람과 교류하는 방식에 대한 선호예요. 이후 세부 성향
          테스트와 매칭의 기준이 됩니다.
        </p>

        <div className="flex flex-col gap-4">
          {BROAD_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => choose(c.value)}
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
            >
              <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {c.label}
              </h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {c.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
