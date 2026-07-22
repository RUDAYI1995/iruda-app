"use client";

import { useState } from "react";

export function ScheduleBox() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departure, setDeparture] = useState("");
  const [pickup, setPickup] = useState(false);
  const [mode, setMode] = useState<"recruit" | "join">("join");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="flex w-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:w-80">
      <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
        당신의 일정은?
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            희망여행기간
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="text-xs text-zinc-400">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            출발지
          </label>
          <input
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="예: 서울"
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={pickup}
            onChange={(e) => setPickup(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          픽업 희망
        </label>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            파티
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("recruit")}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === "recruit"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              파티 모집하기
            </button>
            <button
              type="button"
              onClick={() => setMode("join")}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === "join"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              파티 참여하기
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
        >
          일정 등록
        </button>
        {saved && (
          <p className="text-center text-xs text-emerald-600 dark:text-emerald-400">
            일정이 저장됐어요.
          </p>
        )}
      </form>
    </div>
  );
}
