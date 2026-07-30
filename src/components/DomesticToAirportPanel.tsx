"use client";

import { useState } from "react";
import { CITY_CODES, type BusArrival, type BusStop } from "@/lib/transit/tago";

function formatArrival(arrival: BusArrival) {
  const minutes = Math.round(arrival.arrTime / 60);
  if (minutes <= 0) return "곧 도착";
  return `약 ${minutes}분 후`;
}

export function DomesticToAirportPanel() {
  const [cityCode, setCityCode] = useState<string>(CITY_CODES[0].code);
  const [query, setQuery] = useState("");
  const [stops, setStops] = useState<BusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tagoUnavailable, setTagoUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);

  async function searchStops() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setTagoUnavailable(false);
    setSelectedStop(null);
    setArrivals([]);

    const res = await fetch(
      `/api/transit/stops?cityCode=${cityCode}&query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (typeof data.error === "string" && data.error.includes("TAGO_API_KEY")) {
        setTagoUnavailable(true);
      } else {
        setError(data.error);
      }
      return;
    }
    setStops(data.stops);
  }

  async function fetchArrivals(stop: BusStop) {
    const res = await fetch(`/api/transit/arrivals?cityCode=${stop.cityCode}&nodeId=${stop.nodeId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setArrivals(data.arrivals);
  }

  function selectStop(stop: BusStop) {
    setSelectedStop(stop);
    setError(null);
    fetchArrivals(stop);
  }

  if (tagoUnavailable) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-2xl">🚧</p>
        <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-300">
          국내 구간(공항까지) 실시간 버스 정보는 TAGO API 키가 등록되면 자동으로 활성화돼요.
        </p>
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          지금은 아래 해외 구간(항공편 + 현지 교통) 추천만 이용할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-3 font-bold text-zinc-900 dark:text-zinc-50">🚌 공항까지 국내 이동</h2>
      <div className="mb-4 flex gap-2">
        <select
          value={cityCode}
          onChange={(e) => setCityCode(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {CITY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchStops()}
          placeholder="정류소명 (예: 공항버스 정류장)"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          onClick={searchStops}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {error && (
        <p className="mb-4 whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {!selectedStop && stops.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {stops.map((stop) => (
            <li key={stop.nodeId}>
              <button
                onClick={() => selectStop(stop)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              >
                {stop.nodeNm}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedStop && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{selectedStop.nodeNm}</h3>
            <button
              onClick={() => {
                setSelectedStop(null);
                setArrivals([]);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              다른 정류소 검색
            </button>
          </div>
          {arrivals.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              현재 도착 예정인 버스 정보가 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {arrivals.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{a.routeNo}번</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatArrival(a)} · {a.arrPrevStationCnt}정류소 전
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
