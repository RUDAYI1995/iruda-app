"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABEL, type ItemCategory } from "@/lib/shopItems";

interface ShopItemView {
  id: string;
  category: ItemCategory;
  name: string;
  emoji: string;
  price: number;
  rarity: string;
  description: string;
  owned: number;
}

interface Denomination {
  value: number;
  name: string;
  kind: "coin" | "bill";
  emoji: string;
  count: number;
}

const CATEGORY_ORDER: ItemCategory[] = ["GEAR", "SURVIVAL", "BUILDING"];

export default function ShopPage() {
  const [items, setItems] = useState<ShopItemView[]>([]);
  const [balance, setBalance] = useState<
    | { loggedIn: true; total: number; breakdown: Denomination[] }
    | { loggedIn: false }
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [itemsRes, balanceRes] = await Promise.all([
      fetch("/api/shop/items"),
      fetch("/api/shop/balance"),
    ]);
    if (itemsRes.ok) setItems(await itemsRes.json());
    if (balanceRes.ok) setBalance(await balanceRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleBuy(item: ShopItemView) {
    setBuyingId(item.id);
    setMessage(null);
    const res = await fetch("/api/shop/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });
    const data = await res.json();
    setBuyingId(null);
    if (!res.ok) {
      setMessage(`❌ ${data.error}`);
      return;
    }
    setMessage(`🎉 ${item.name}을(를) 구매했어요!`);
    load();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          루다월드
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">마일리지 상점</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          활동으로 모은 젤리로 루다월드 탐험에 필요한 아이템을 모아보세요.
        </p>
      </div>

      {!balance?.loggedIn ? (
        <p className="text-center text-sm text-zinc-500">
          로그인하면 내 잔액과 인벤토리를 볼 수 있어요.
        </p>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <h2 className="mb-3 font-bold text-amber-900 dark:text-amber-200">
            💰 내 지갑 (총 {balance.total} 젤리)
          </h2>
          <div className="flex flex-wrap gap-3">
            {balance.breakdown
              .filter((d) => d.count > 0)
              .map((d) => (
                <div
                  key={d.value}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    d.kind === "bill"
                      ? "border-amber-400 bg-white dark:bg-zinc-900"
                      : "border-zinc-300 bg-white dark:bg-zinc-900"
                  }`}
                  title={`${d.value} 젤리`}
                >
                  <span className="text-xl">{d.emoji}</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {d.name} × {d.count}
                  </span>
                </div>
              ))}
            {balance.total === 0 && (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                아직 모은 젤리가 없어요. 게시글 작성, 아싸게임 승리, 여행 인증으로 모아보세요!
              </p>
            )}
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-zinc-100 px-4 py-3 text-center text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-zinc-500">불러오는 중...</p>
      ) : (
        CATEGORY_ORDER.map((category) => (
          <div key={category} className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {CATEGORY_LABEL[category]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items
                .filter((i) => i.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{item.emoji}</div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-50">
                          {item.name}{" "}
                          <span className="text-xs font-normal text-zinc-400">
                            [{item.rarity}]
                          </span>
                          {item.owned > 0 && (
                            <span className="ml-1 text-xs text-green-600">보유 {item.owned}</span>
                          )}
                        </p>
                        <p className="text-sm text-zinc-500">{item.description}</p>
                        <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          🐾 {item.price} 젤리
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!balance?.loggedIn || buyingId === item.id}
                      onClick={() => handleBuy(item)}
                      className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      {buyingId === item.id ? "구매 중..." : "구매"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

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
