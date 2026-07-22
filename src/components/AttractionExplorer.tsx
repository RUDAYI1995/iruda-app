"use client";

import { useEffect, useState } from "react";

type Attraction = {
  id: string;
  name: string;
  region: string;
  category: string;
  description: string;
  isFavorite: boolean;
};

const CATEGORIES = ["전체", "즐겨찾기", "자연", "역사", "문화", "맛집", "액티비티"];

export function AttractionExplorer({
  compact = false,
  fillHeight = false,
}: {
  compact?: boolean;
  fillHeight?: boolean;
}) {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [preference, setPreference] = useState("");
  const [recommending, setRecommending] = useState(false);
  const [recommendMessage, setRecommendMessage] = useState<string | null>(null);
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttraction, setNewAttraction] = useState({
    name: "",
    region: "",
    category: "자연",
    description: "",
  });
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category === "즐겨찾기") {
      params.set("favoritesOnly", "true");
    } else if (category !== "전체") {
      params.set("category", category);
    }
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/attractions?${params.toString()}`);
    const data = await res.json();
    setAttractions(data.attractions ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query]);

  const toggleFavorite = async (id: string) => {
    await fetch(`/api/attractions/${id}/favorite`, { method: "POST" });
    load();
  };

  const handleRecommend = async () => {
    if (!preference.trim()) return;
    setRecommending(true);
    setRecommendMessage(null);
    const res = await fetch("/api/attractions/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preference }),
    });
    const data = await res.json();
    setRecommending(false);
    if (data.message) setRecommendMessage(data.message);
    setRecommendedIds(new Set((data.recommendedIds ?? []).map((p: { id: string }) => p.id)));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const res = await fetch("/api/attractions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAttraction),
    });
    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error ?? "추가에 실패했어요.");
      return;
    }
    setNewAttraction({ name: "", region: "", category: "자연", description: "" });
    setShowAddForm(false);
    load();
  };

  return (
    <div
      className={`flex w-full flex-col rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 ${
        compact ? "gap-2 p-3" : "gap-0 p-6"
      } ${fillHeight ? "h-full overflow-hidden" : ""}`}
    >
      <h2
        className={`flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50 ${
          compact ? "text-xs" : "mb-4 text-lg"
        }`}
      >
        🗺️ 관광지 목록
      </h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={compact ? "검색" : "관광지 이름이나 지역으로 검색"}
        className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
          compact ? "px-2 py-1 text-xs" : "mb-3 px-3 py-2 text-sm"
        }`}
      />

      <div className={`flex flex-wrap gap-1 ${compact ? "" : "mb-4 gap-2"}`}>
        {(compact ? CATEGORIES.slice(0, 4) : CATEGORIES).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border font-medium transition-colors ${
              compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
            } ${
              category === c
                ? "border-sky-500 bg-sky-500 text-white"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        className={`flex flex-col gap-1.5 overflow-y-auto ${
          fillHeight ? "flex-1" : compact ? "max-h-24" : "mb-4 max-h-56 gap-2"
        }`}
      >
        {loading ? (
          <p className="py-4 text-center text-xs text-zinc-400">불러오는 중...</p>
        ) : attractions.length === 0 ? (
          <p className="py-4 text-center text-xs text-zinc-400">
            표시할 관광지가 없습니다.
          </p>
        ) : (
          attractions.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border text-xs ${compact ? "px-2 py-1" : "px-3 py-2 text-sm"} ${
                recommendedIds.has(a.id)
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 font-semibold text-zinc-900 dark:text-zinc-50">
                  {a.name}
                </span>
                <button
                  onClick={() => toggleFavorite(a.id)}
                  aria-label="즐겨찾기"
                  className={compact ? "text-sm" : "text-lg"}
                >
                  {a.isFavorite ? "⭐" : "☆"}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {a.category} · {a.region}
              </p>
              {!compact && (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {a.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <hr className={`border-zinc-200 dark:border-zinc-800 ${compact ? "my-1.5" : "mb-4"}`} />

      <input
        value={preference}
        onChange={(e) => setPreference(e.target.value)}
        placeholder={compact ? "여행 취향 입력" : "여행 취향을 입력하세요 (예: 조용한 자연 위주)"}
        className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
          compact ? "px-2 py-1 text-xs" : "mb-2 px-3 py-2 text-sm"
        }`}
      />
      <button
        onClick={handleRecommend}
        disabled={recommending}
        className={`w-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-600 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
          compact ? "mt-1.5 px-3 py-1 text-[11px]" : "mb-2 px-4 py-2 text-sm"
        }`}
      >
        {recommending ? "추천 받는 중..." : "✨ AI 맞춤 추천받기"}
      </button>
      {recommendMessage && (
        <p className="mt-1 text-center text-[10px] text-zinc-400">{recommendMessage}</p>
      )}

      <hr className={`border-zinc-200 dark:border-zinc-800 ${compact ? "my-1.5" : "mb-4"}`} />

      {showAddForm ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-1.5">
          <input
            value={newAttraction.name}
            onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
            placeholder="관광지 이름"
            className={`rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
          />
          <input
            value={newAttraction.region}
            onChange={(e) => setNewAttraction({ ...newAttraction, region: e.target.value })}
            placeholder="지역"
            className={`rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
          />
          <select
            value={newAttraction.category}
            onChange={(e) => setNewAttraction({ ...newAttraction, category: e.target.value })}
            className={`rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
          >
            {CATEGORIES.filter((c) => c !== "전체" && c !== "즐겨찾기").map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            value={newAttraction.description}
            onChange={(e) =>
              setNewAttraction({ ...newAttraction, description: e.target.value })
            }
            placeholder="간단한 설명"
            className={`rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
          />
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 rounded-full bg-blue-700 font-semibold text-white hover:bg-blue-800 ${
                compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
              }`}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className={`rounded-full border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 ${
                compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
              }`}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className={`w-full rounded-full bg-blue-700 font-semibold text-white hover:bg-blue-800 ${
            compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          + 관광지 추가
        </button>
      )}
    </div>
  );
}
