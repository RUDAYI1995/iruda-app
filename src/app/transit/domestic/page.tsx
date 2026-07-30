"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CITY_CODES, type BusArrival, type BusStop } from "@/lib/transit/tago";

function formatArrival(arrival: BusArrival) {
  const minutes = Math.round(arrival.arrTime / 60);
  if (minutes <= 0) return "곧 도착";
  return `약 ${minutes}분 후`;
}

export default function DomesticTransitPage() {
  const [cityCode, setCityCode] = useState<string>(CITY_CODES[0].code);
  const [query, setQuery] = useState("");
  const [stops, setStops] = useState<BusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const searchStops = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedStop(null);
    setArrivals([]);

    const res = await fetch(
      `/api/transit/stops?cityCode=${cityCode}&query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setStops(data.stops);
  };

  const fetchArrivals = async (stop: BusStop) => {
    const res = await fetch(
      `/api/transit/arrivals?cityCode=${stop.cityCode}&nodeId=${stop.nodeId}`
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setArrivals(data.arrivals);
  };

  const selectStop = (stop: BusStop) => {
    setSelectedStop(stop);
    setError(null);
    fetchArrivals(stop);
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (selectedStop) {
      intervalRef.current = setInterval(() => fetchArrivals(selectedStop), 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStop]);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          국내 실시간 교통정보
        </h1>
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
          정류소를 검색하면 버스별 실시간 도착 예정 시간을 확인할 수 있어요.
        </p>
        <p className="mb-8 text-xs text-amber-600 dark:text-amber-500">
          ⚠️ 서울은 이 공공데이터(국토교통부 전국 버스정류소 정보) 대상 지역이 아니라서 지원되지
          않아요. 부산·대전·수원 등 다른 도시로 검색해주세요.
        </p>

        <div className="mb-6 flex gap-2">
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
            placeholder="정류소명 (예: 시청)"
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
          <ul className="mb-6 flex flex-col gap-2">
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {selectedStop.nodeNm}
              </h2>
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
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {a.routeNo}번
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatArrival(a)} · {a.arrPrevStationCnt}정류소 전
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-600">
              15초마다 자동으로 갱신돼요.
            </p>
          </div>
        )}

        <Link
          href="/home"
          className="mt-10 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← 홈페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
