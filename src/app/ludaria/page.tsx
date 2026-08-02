"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  COUNTRIES,
  getProductsForCountry,
  type Product,
  type ProductCategory,
  type ProductCondition,
} from "@/lib/ludariaMarket";

const CATEGORIES: ProductCategory[] = ["먹거리", "면세점", "여행상품"];
const CONDITIONS: ProductCondition[] = ["신규상품", "중고상품"];

type Listing = {
  id: string;
  title: string;
  price: number;
  condition: ProductCondition;
  category: ProductCategory;
  description: string;
  imageUrl: string | null;
  seller: string;
  isMock?: boolean;
};

export default function LudariaPage() {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "전체">("전체");
  const [conditionFilter, setConditionFilter] = useState<ProductCondition | "전체">("전체");
  const [realListings, setRealListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    condition: "신규상품" as ProductCondition,
    category: "먹거리" as ProductCategory,
    description: "",
    imageUrl: "",
  });

  const filteredCountries = useMemo(
    () => COUNTRIES.filter((c) => c.name.includes(query.trim())),
    [query]
  );

  const exactMatch = COUNTRIES.find((c) => c.name === query.trim());
  const canRegisterNewCountry = query.trim().length > 0 && !exactMatch;

  const matchedCountry = COUNTRIES.find((c) => c.name === selectedCountry);
  const flag = matchedCountry?.flag ?? "🌍";

  const loadListings = useCallback(async () => {
    if (!selectedCountry) return;
    setLoadingListings(true);
    try {
      const res = await fetch(`/api/ludaria/listings?country=${encodeURIComponent(selectedCountry)}`);
      const data = await res.json();
      setRealListings(data.listings ?? []);
    } finally {
      setLoadingListings(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountry) return;
    const init = async () => {
      await loadListings();
    };
    init();
  }, [selectedCountry, loadListings]);

  const mockProducts: Listing[] = useMemo(() => {
    if (!matchedCountry) return [];
    return getProductsForCountry(matchedCountry.code).map((p: Product) => ({
      id: p.id,
      title: p.name,
      price: p.price,
      condition: p.condition,
      category: p.category,
      description: p.description,
      imageUrl: p.image,
      seller: p.seller,
      isMock: true,
    }));
  }, [matchedCountry]);

  const allListings = useMemo(() => {
    let list = [...realListings, ...mockProducts];
    if (categoryFilter !== "전체") list = list.filter((p) => p.category === categoryFilter);
    if (conditionFilter !== "전체") list = list.filter((p) => p.condition === conditionFilter);
    return list;
  }, [realListings, mockProducts, categoryFilter, conditionFilter]);

  function selectCountry(name: string) {
    setSelectedCountry(name);
    setShowForm(false);
    setFormError(null);
  }

  async function submitListing() {
    if (!selectedCountry) return;
    setFormError(null);
    const priceNum = Number(form.price);
    if (!form.title.trim() || !form.description.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      setFormError("제목, 가격, 설명을 모두 입력해주세요");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ludaria/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: selectedCountry,
          title: form.title,
          price: priceNum,
          condition: form.condition,
          category: form.category,
          description: form.description,
          imageUrl: form.imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "등록에 실패했어요");
        return;
      }
      setForm({ title: "", price: "", condition: "신규상품", category: "먹거리", description: "", imageUrl: "" });
      setShowForm(false);
      await loadListings();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-bold text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200">
          🍔 루다리아
        </p>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          여행 다녀온 사람들의 현지 물건 마켓
        </h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          나라를 고르거나 검색해서, 그 나라 다녀온 여행자들이 올린 현지 물건을 구경해보세요. 목록에 없는
          나라도 직접 검색해서 나라를 선택하고 물건을 올릴 수 있어요.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canRegisterNewCountry) selectCountry(query.trim());
          }}
          placeholder="나라 이름으로 검색 (목록에 없는 나라도 입력해보세요)"
          className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {canRegisterNewCountry && (
        <button
          type="button"
          onClick={() => selectCountry(query.trim())}
          className="rounded-2xl border-2 border-dashed border-yellow-400 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-200"
        >
          🌍 &ldquo;{query.trim()}&rdquo; 나라로 선택하고 물건 구경/등록하기
        </button>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {filteredCountries.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => selectCountry(c.name)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm font-semibold shadow-sm transition-transform hover:scale-105 ${
              selectedCountry === c.name
                ? "border-yellow-400 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-200"
                : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
            }`}
          >
            <span className="text-2xl">{c.flag}</span>
            {c.name}
          </button>
        ))}
        {filteredCountries.length === 0 && !canRegisterNewCountry && (
          <p className="col-span-full text-center text-sm text-zinc-400">나라 이름을 입력해보세요.</p>
        )}
      </div>

      {selectedCountry && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {flag} {selectedCountry} 물건 {allListings.length}개
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
                {(["전체", ...CONDITIONS] as const).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setConditionFilter(cond)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      conditionFilter === cond
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
                {(["전체", ...CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      categoryFilter === cat
                        ? "bg-yellow-500 text-white"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                ✍️ {flag} {selectedCountry} 물건 올리기
              </button>
            </div>
          </div>

          {showForm && (
            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="물건 이름"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="가격 (원)"
                inputMode="numeric"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <div className="flex gap-2">
                <select
                  value={form.condition}
                  onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as ProductCondition }))}
                  className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))}
                  className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="설명 (상태, 거래 방식 등)"
                rows={3}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="사진 URL (선택, 비워두면 기본 이미지)"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              {formError && <p className="text-xs font-semibold text-red-600">{formError}</p>}
              <button
                type="button"
                disabled={submitting}
                onClick={submitListing}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          )}

          {loadingListings && <p className="text-center text-sm text-zinc-400">불러오는 중...</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            {allListings.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <img
                  src={p.imageUrl ?? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"}
                  alt={p.title}
                  className="h-24 w-24 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.condition === "신규상품"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {p.condition}
                    </span>
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
                      {p.category}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">{p.title}</p>
                  <p className="text-sm font-extrabold text-yellow-700 dark:text-yellow-400">
                    {p.price.toLocaleString()}원
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{p.description}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">{p.seller} 님이 올림</p>
                </div>
              </div>
            ))}
            {allListings.length === 0 && !loadingListings && (
              <p className="col-span-full text-center text-sm text-zinc-400">
                아직 이 나라 물건이 없어요. 첫 번째로 올려보세요!
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/home" className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400">
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
