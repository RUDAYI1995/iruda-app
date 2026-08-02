"use client";

import { DAEGU_DEALS } from "@/lib/daeguDeals";

export function DaeguDealsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">🍁 9월 대구 특가</p>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">루다월드 제휴 할인 업체</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-orange-500 transition-colors hover:bg-orange-100 dark:hover:bg-orange-950/40"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {DAEGU_DEALS.map((deal) => {
            const discounted = Math.round((deal.originalPrice * (100 - deal.discountRate)) / 100);
            return (
              <div
                key={deal.shopName}
                className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deal.image} alt={deal.shopName} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="mb-1 font-bold text-zinc-900 dark:text-zinc-50">{deal.shopName}</p>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{deal.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                      루다월드 제휴 {deal.discountRate}% 할인
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-xs text-zinc-400 line-through">
                      {deal.originalPrice.toLocaleString()}원
                    </span>
                    <span className="text-base font-extrabold text-orange-600 dark:text-orange-300">
                      {discounted.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[11px] leading-5 text-zinc-400">
          위 업체 정보는 데모용 예시로, 실제 제휴 업체가 아니에요.
        </p>
      </div>
    </div>
  );
}
