"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  topicLabel: string;
  concern: string;
  untilDate: string;
  steps: string[];
  currentStep: number;
  totalSteps: number;
} | null;

export function CarePlanPanel() {
  const [plan, setPlan] = useState<Plan>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shycare/careplan/me")
      .then((res) => res.json())
      .then((data) => setPlan(data.plan ?? null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!plan) return null;

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 dark:border-violet-900/40 dark:bg-violet-950/20">
      <h3 className="mb-2 font-bold text-violet-800 dark:text-violet-200">☂️ 소심케어제 진행 중</h3>
      <p className="mb-1 text-xs text-violet-600 dark:text-violet-300">
        {plan.topicLabel} · &ldquo;{plan.concern}&rdquo;
      </p>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        {plan.untilDate}까지 · {plan.currentStep + 1} / {plan.totalSteps}일차 진행 중
      </p>
      <div className="rounded-xl bg-white p-3 text-sm text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">
        {plan.steps[plan.currentStep]}
      </div>
    </div>
  );
}
