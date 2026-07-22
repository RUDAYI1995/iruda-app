"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGE_OPTIONS = ["ko", "en", "ja", "zh", "es", "fr", "de", "vi", "th"];

export default function GuideApplyPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<string[]>(["ko"]);
  const [region, setRegion] = useState("");
  const [hourlyRate, setHourlyRate] = useState(20000);
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleLanguage = (lang: string) => {
    setLanguages((ls) => (ls.includes(lang) ? ls.filter((l) => l !== lang) : [...ls, lang]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/guides/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languages, region, hourlyRate, bio }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          데이가이드 신청하기
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          신청 후 운영진의 수동 검토를 거쳐 승인되면 가이드 마켓플레이스에 노출돼요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              가능한 언어
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    languages.includes(lang)
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              활동 지역
            </label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="예: 오사카"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              시간당 요금 (원)
            </label>
            <input
              type="number"
              min={0}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              자기소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              minLength={10}
              required
              placeholder="어떤 여행자에게 잘 맞는 가이드인지 소개해주세요"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || languages.length === 0}
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {submitting ? "신청 중..." : "가이드 신청하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
