"use client";

import { useState } from "react";

type WeatherResult = {
  name: string;
  country: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  forecastTime?: string;
};

const WEATHER_EMOJI: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

function weatherEmoji(code: number) {
  return WEATHER_EMOJI[code] ?? "🌡️";
}

export function DestinationWeatherButton() {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [arrival, setArrival] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeatherResult | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams({ city: city.trim() });
      if (arrival) params.set("arrival", arrival);
      const res = await fetch(`/api/weather?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "날씨를 가져오지 못했어요.");
        return;
      }
      setResult(data);
    } catch {
      setError("날씨를 가져오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800 shadow-sm transition-transform hover:scale-105 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
        aria-expanded={open}
      >
        <span className="text-sm">{result ? weatherEmoji(result.weatherCode) : "🌍"}</span>
        여행지 날씨
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-sky-200 bg-white p-4 shadow-lg dark:border-sky-900 dark:bg-zinc-950">
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            여행지 현지 날씨 확인
          </p>
          <form onSubmit={search} className="mb-3 flex flex-col gap-1.5">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="예: 오사카"
              className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <div>
              <label className="mb-1 block text-[11px] text-zinc-500 dark:text-zinc-400">
                도착 예정 시간 (선택, 최대 16일 이내)
              </label>
              <input
                type="datetime-local"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {loading ? "확인 중..." : arrival ? "도착 시간 날씨 확인" : "지금 날씨 확인"}
            </button>
          </form>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {result && (
            <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 dark:bg-sky-950/30">
              <span className="text-3xl">{weatherEmoji(result.weatherCode)}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {result.name} · {result.country}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {Math.round(result.temperature)}°C · 바람 {Math.round(result.windSpeed)}km/h
                </p>
                <p className="mt-0.5 text-[11px] text-sky-600 dark:text-sky-400">
                  {result.forecastTime
                    ? `${result.forecastTime.replace("T", " ")} 예상`
                    : "지금 날씨"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
