"use client";

import { useEffect, useState } from "react";
import { Portal } from "@/components/Portal";

type PartyMemberInfo = { userId: string; name: string };
type PartyInfo = { members: PartyMemberInfo[] } | null;

type ExpenseRow = { id: number; label: string; amount: string };

let nextId = 1;

export function BillSplitModal({ onClose }: { onClose: () => void }) {
  const [party, setParty] = useState<PartyInfo>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ExpenseRow[]>([{ id: nextId++, label: "", amount: "" }]);

  useEffect(() => {
    fetch("/api/party/me")
      .then((res) => res.json())
      .then((data) => setParty(data.party ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const participantCount = party && party.members.length > 0 ? party.members.length : 1;

  function addRow() {
    setRows((r) => [...r, { id: nextId++, label: "", amount: "" }]);
  }

  function removeRow(id: number) {
    setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  }

  function updateRow(id: number, field: "label" | "amount", value: string) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.amount.replace(/[^0-9.]/g, "")) || 0), 0);
  const perPerson = participantCount > 0 ? total / participantCount : total;

  return (
    <Portal>
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-950"
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">🧾 정산 계산기</p>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
              {loading ? "확인 중..." : party ? `파티원 ${participantCount}명 정산` : "개인 지출 정산"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-500 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {party && party.members.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {party.members.map((m) => (
              <span
                key={m.userId}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                {m.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="flex gap-1.5">
              <input
                value={row.label}
                onChange={(e) => updateRow(row.id, "label", e.target.value)}
                placeholder="쓴 곳 (예: 저녁식사)"
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <input
                value={row.amount}
                onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                placeholder="금액"
                inputMode="numeric"
                className="w-24 shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-right text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="shrink-0 text-zinc-400 hover:text-red-500"
                aria-label="항목 삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-2 self-start rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          + 항목 추가
        </button>

        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">총 쓴 금액</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-50">{total.toLocaleString()}원</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              1인당 낼 금액 ({participantCount}명 기준)
            </span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-300">
              {Math.ceil(perPerson).toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}
