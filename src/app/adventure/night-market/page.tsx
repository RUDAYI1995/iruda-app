"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stall = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  emoji: string;
  description: string;
  isMine: boolean;
};

export default function NightMarketPage() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [label, setLabel] = useState("");
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏮");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [statusRes, stallsRes] = await Promise.all([
      fetch("/api/night-market/status"),
      fetch("/api/night-market/stalls"),
    ]);
    const statusData = await statusRes.json();
    const stallsData = await stallsRes.json();
    setOpen(statusData.open);
    setLabel(statusData.label);
    setStalls(stallsData.stalls ?? []);

    const mine = (stallsData.stalls ?? []).find((s: Stall) => s.isMine);
    if (mine) {
      setName(mine.name);
      setEmoji(mine.emoji);
      setDescription(mine.description);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveStall() {
    if (!name.trim() || !description.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/night-market/stalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, description }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("점포를 열었어요! 🏮");
        setShowForm(false);
        load();
      } else {
        setMessage(data.error ?? "점포 열기에 실패했어요");
      }
    } finally {
      setSaving(false);
    }
  }

  async function closeStall() {
    await fetch("/api/night-market/stalls", { method: "DELETE" });
    setName("");
    setDescription("");
    setEmoji("🏮");
    load();
  }

  const hasMyStall = stalls.some((s) => s.isMine);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-500">위대한 모험</p>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">🏮 관광 야시장</h1>
        </div>
        <Link
          href="/adventure"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← 루다대륙 지도로
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/night-market-bg.png" alt="관광 야시장" className="w-full object-cover" />
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">불러오는 중...</p>
      ) : open ? (
        <>
          <div className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-700 dark:bg-violet-950/20 dark:text-violet-300">
            🌙 야시장이 열려 있어요! {label}
          </div>

          {showForm && (
            <div className="flex flex-col gap-2 rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-900 dark:bg-zinc-950">
              <div className="flex gap-2">
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                  className="w-16 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-lg dark:border-zinc-700 dark:bg-zinc-900"
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="점포 이름 (예: 소심이네 붕어빵)"
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="점포 소개 (예: 밤에만 파는 특별한 붕어빵이에요~)"
                rows={2}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveStall}
                  disabled={saving}
                  className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "점포 저장"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  취소
                </button>
                {hasMyStall && (
                  <button
                    onClick={closeStall}
                    className="rounded-full border border-red-300 px-4 py-1.5 text-xs text-red-600 dark:border-red-900"
                  >
                    점포 닫기
                  </button>
                )}
              </div>
              {message && <p className="text-xs text-violet-700 dark:text-violet-300">{message}</p>}
            </div>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              🗺️ 오늘의 점포 맵 · {stalls.length}곳
            </h2>
            <div className="grid gap-3 rounded-3xl bg-[#241a12] p-4 sm:grid-cols-2 lg:grid-cols-3">
              {!hasMyStall && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-amber-400/60 bg-amber-900/20 text-amber-300 transition-colors hover:bg-amber-900/40"
                >
                  <span className="text-2xl">➕</span>
                  <span className="text-sm font-bold">내 점포 열기</span>
                </button>
              )}

              {stalls.map((s) => (
                <div
                  key={s.id}
                  className={`flex min-h-[120px] flex-col rounded-2xl border-2 p-4 shadow-lg ${
                    s.isMine
                      ? "border-pink-400 bg-gradient-to-b from-pink-900/40 to-[#2b1c10]"
                      : "border-amber-500/70 bg-gradient-to-b from-amber-900/30 to-[#2b1c10]"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <p className="truncate font-bold text-amber-100">{s.name}</p>
                  </div>
                  <p className="mb-1 text-[11px] text-amber-300/80">
                    {s.ownerName} {s.isMine && "· 내 점포"}
                  </p>
                  <p className="text-xs leading-5 text-amber-100/90">{s.description}</p>
                  {s.isMine && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-2 self-start rounded-full bg-pink-500/80 px-3 py-1 text-[11px] font-bold text-white hover:bg-pink-500"
                    >
                      수정하기
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-zinc-100 p-8 text-center dark:bg-zinc-900">
          <p className="mb-2 text-3xl">🌤️</p>
          <p className="mb-1 font-bold text-zinc-700 dark:text-zinc-200">
            지금은 야시장이 닫혀있어요
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        </div>
      )}
    </div>
  );
}
