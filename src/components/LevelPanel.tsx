"use client";

import { useEffect, useState } from "react";

interface LevelInfo {
  loggedIn: boolean;
  level?: number;
  title?: string;
  exp?: number;
  currentFloor?: number;
  nextFloor?: number;
  ratio?: number;
  gender?: "MALE" | "FEMALE" | "LGBTQ" | null;
  needsGender?: boolean;
}

const GENDER_OPTIONS: { value: "MALE" | "FEMALE" | "LGBTQ"; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
  { value: "LGBTQ", label: "성소수자" },
];

export function LevelPanel() {
  const [info, setInfo] = useState<LevelInfo | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/level")
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }

  useEffect(load, []);

  async function setGender(gender: "MALE" | "FEMALE" | "LGBTQ") {
    setSaving(true);
    await fetch("/api/level", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender }),
    });
    setSaving(false);
    load();
  }

  if (!info?.loggedIn) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
      <h3 className="font-bold text-amber-900 dark:text-amber-200">🏅 레벨·마일리지</h3>
      <p className="mt-1 text-2xl font-extrabold text-amber-900 dark:text-amber-100">
        Lv.{info.level} {info.title}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${(info.ratio ?? 0) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
        EXP {info.exp?.toFixed(1)} / {info.nextFloor === info.currentFloor ? "MAX" : info.nextFloor}
      </p>

      <div className="mt-3 rounded-xl bg-white p-3 dark:bg-zinc-900">
        <p className="mb-2 text-sm text-zinc-700 dark:text-zinc-300">
          {info.needsGender
            ? "1레벨 타이틀 표시를 위해 성별을 선택해주세요."
            : "성별 설정"}
        </p>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={saving}
              onClick={() => setGender(opt.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                info.gender === opt.value
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
