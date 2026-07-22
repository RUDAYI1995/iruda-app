"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  QUESTIONS,
  TOTAL_QUIZ_STEPS,
  STYLE_STEP,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
} from "@/lib/matching/scoring";

const LIKERT = [1, 2, 3, 4, 5];

interface StyleAnswers {
  pace: string;
  groupSizeComfort: number;
  interests: string[];
  budgetLevel: number;
  alcoholComfort: boolean;
  languages: string[];
}

const defaultStyle: StyleAnswers = {
  pace: PACE_OPTIONS[1],
  groupSizeComfort: 3,
  interests: [],
  budgetLevel: 2,
  alcoholComfort: false,
  languages: ["ko"],
};

export default function TestStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const step = Number(params.step);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [style, setStyle] = useState<StyleAnswers>(defaultStyle);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const category = sessionStorage.getItem("iruda_test_category");
    if (!category) {
      router.replace("/test/category");
      return;
    }
    const savedAnswers = sessionStorage.getItem("iruda_test_answers");
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    const savedStyle = sessionStorage.getItem("iruda_test_style");
    if (savedStyle) setStyle(JSON.parse(savedStyle));
  }, [router]);

  const questionsForStep = QUESTIONS.filter((q) => q.step === step);
  const isStyleStep = step === STYLE_STEP;

  const canProceed = isStyleStep
    ? style.interests.length > 0
    : questionsForStep.every((q) => answers[q.id] !== undefined);

  const handleNext = async () => {
    if (isStyleStep) {
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: sessionStorage.getItem("iruda_test_category"),
          answers,
          style,
        }),
      });
      setSubmitting(false);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "저장 중 오류가 발생했어요");
        return;
      }
      sessionStorage.removeItem("iruda_test_category");
      sessionStorage.removeItem("iruda_test_answers");
      sessionStorage.removeItem("iruda_test_style");
      router.push("/result");
      return;
    }

    sessionStorage.setItem("iruda_test_answers", JSON.stringify(answers));
    router.push(`/test/${step + 1}`);
  };

  const toggleInterest = (interest: string) => {
    setStyle((s) => {
      const next = s.interests.includes(interest)
        ? s.interests.filter((i) => i !== interest)
        : [...s.interests, interest];
      const updated = { ...s, interests: next };
      sessionStorage.setItem("iruda_test_style", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-xl">
        <p className="mb-6 text-center text-sm font-medium text-zinc-400 dark:text-zinc-600">
          {isStyleStep
            ? `${TOTAL_QUIZ_STEPS + 1} / ${TOTAL_QUIZ_STEPS + 1}`
            : `${step} / ${TOTAL_QUIZ_STEPS + 1}`}
        </p>

        {!isStyleStep && (
          <div className="flex flex-col gap-8">
            {questionsForStep.map((q) => (
              <div key={q.id}>
                <p className="mb-4 text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {q.text}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {q.leftLabel}
                  </span>
                  <div className="flex gap-2">
                    {LIKERT.map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          const next = { ...answers, [q.id]: v };
                          setAnswers(next);
                          sessionStorage.setItem(
                            "iruda_test_answers",
                            JSON.stringify(next)
                          );
                        }}
                        className={`h-10 w-10 rounded-full border text-sm font-medium transition-colors ${
                          answers[q.id] === v
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                            : "border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {q.rightLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isStyleStep && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
                선호하는 여행 속도는?
              </p>
              <div className="flex gap-2">
                {PACE_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const updated = { ...style, pace: p };
                      setStyle(updated);
                      sessionStorage.setItem(
                        "iruda_test_style",
                        JSON.stringify(updated)
                      );
                    }}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      style.pace === p
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
                관심사를 골라주세요 (최소 1개)
              </p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      style.interests.includes(i)
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
                술자리가 있어도 괜찮으신가요?
              </p>
              <button
                onClick={() => {
                  const updated = { ...style, alcoholComfort: !style.alcoholComfort };
                  setStyle(updated);
                  sessionStorage.setItem(
                    "iruda_test_style",
                    JSON.stringify(updated)
                  );
                }}
                className={`rounded-full border px-4 py-2 text-sm ${
                  style.alcoholComfort
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                {style.alcoholComfort ? "괜찮아요" : "괜찮지 않아요"}
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleNext}
          disabled={!canProceed || submitting}
          className="mt-10 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isStyleStep ? (submitting ? "저장 중..." : "결과 보기") : "다음"}
        </button>
      </div>
    </div>
  );
}
