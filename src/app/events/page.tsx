"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RankEntry {
  userId: string;
  name: string;
  score: number;
}

interface EventInfo {
  key: string;
  title: string;
  description: string;
  ranking: RankEntry[];
}

interface Disqualification {
  eventKey: string;
  userId: string;
  reason: string | null;
}

interface UserHit {
  id: string;
  name: string;
  email: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [isOperator, setIsOperator] = useState(false);
  const [disqualifications, setDisqualifications] = useState<Disqualification[]>([]);
  const [loading, setLoading] = useState(true);

  // 운영자 도구 상태
  const [targetEventKey, setTargetEventKey] = useState("MILEAGE");
  const [userQuery, setUserQuery] = useState("");
  const [userHits, setUserHits] = useState<UserHit[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserHit | null>(null);
  const [reason, setReason] = useState("");
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data.events);
    setIsOperator(data.isOperator);
    setDisqualifications(data.disqualifications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!userQuery.trim()) {
      setUserHits([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/events/search-user?q=${encodeURIComponent(userQuery)}`);
      if (res.ok) setUserHits(await res.json());
    }, 300);
    return () => clearTimeout(timer);
  }, [userQuery]);

  async function handleDisqualify() {
    if (!selectedUser) return;
    setAdminMessage(null);
    const res = await fetch("/api/events/disqualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey: targetEventKey, userId: selectedUser.id, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAdminMessage(`❌ ${data.error}`);
      return;
    }
    setAdminMessage(`✅ ${selectedUser.name}님을 ${targetEventKey} 랭킹에서 제외했어요.`);
    setSelectedUser(null);
    setUserQuery("");
    setReason("");
    load();
  }

  async function handleReinstate(eventKey: string, userId: string) {
    await fetch("/api/events/disqualify", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey, userId }),
    });
    load();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700">
          루다월드
        </p>
        <h1 className="text-4xl font-extrabold text-amber-900">이벤트</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          활동 데이터로 자동 집계되는 실시간 랭킹보드예요.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-zinc-500">불러오는 중...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((ev) => (
            <div
              key={ev.key}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="font-bold text-amber-900 dark:text-amber-200">🏆 {ev.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">{ev.description}</p>
              <ol className="mt-3 flex flex-col gap-1.5">
                {ev.ranking.length === 0 ? (
                  <li className="text-sm text-zinc-400">아직 기록이 없어요.</li>
                ) : (
                  ev.ranking.map((entry, i) => (
                    <li
                      key={entry.userId}
                      className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span>
                        {i + 1}. {entry.name}
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {entry.score}
                      </span>
                    </li>
                  ))
                )}
              </ol>
            </div>
          ))}
        </div>
      )}

      {isOperator && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <h2 className="font-bold text-red-800 dark:text-red-300">🛠️ 운영자 도구 — 부정행위 제외</h2>

          <div className="mt-3 flex flex-col gap-3">
            <select
              value={targetEventKey}
              onChange={(e) => setTargetEventKey(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {events.map((ev) => (
                <option key={ev.key} value={ev.key}>
                  {ev.title}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : userQuery}
                onChange={(e) => {
                  setSelectedUser(null);
                  setUserQuery(e.target.value);
                }}
                placeholder="닉네임 또는 이메일로 유저 검색"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {userHits.length > 0 && !selectedUser && (
                <ul className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                  {userHits.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setUserHits([]);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {u.name} ({u.email})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="제외 사유 (선택)"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />

            <button
              type="button"
              disabled={!selectedUser}
              onClick={handleDisqualify}
              className="self-start rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              랭킹에서 제외
            </button>

            {adminMessage && <p className="text-sm text-red-700 dark:text-red-300">{adminMessage}</p>}
          </div>

          {disqualifications.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-bold text-red-800 dark:text-red-300">
                현재 제외된 유저
              </h3>
              <ul className="flex flex-col gap-1.5">
                {disqualifications.map((d) => (
                  <li
                    key={`${d.eventKey}-${d.userId}`}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-zinc-900"
                  >
                    <span>
                      [{d.eventKey}] {d.userId} {d.reason && `— ${d.reason}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleReinstate(d.eventKey, d.userId)}
                      className="text-xs text-blue-600 underline"
                    >
                      복원
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <Link
          href="/home"
          className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400"
        >
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
