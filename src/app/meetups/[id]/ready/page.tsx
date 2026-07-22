"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CloudBackground } from "@/components/CloudLayer";
import { CabinExplorer } from "@/components/CabinExplorer";

interface Participant {
  userId: string;
  name: string;
  ready: boolean;
  isMe: boolean;
}

type RoomStatus = "READY_CHECK" | "CONFIRMED" | "EXPIRED";

export default function ReadyRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const meetupId = params.id;

  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`/api/meetups/${meetupId}/ready/status`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setError(null);
    setStatus(data.status);
    setParticipants(data.participants);
    setExpiresAt(new Date(data.expiresAt).getTime());
  }, [meetupId]);

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`/api/meetups/${meetupId}/ready/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      fetchStatus();
    };
    init();
  }, [meetupId, fetchStatus]);

  useEffect(() => {
    if (status === "CONFIRMED" || status === "EXPIRED") return;
    pollRef.current = setInterval(fetchStatus, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, fetchStatus]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const secs = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(secs);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const handleOk = async () => {
    const res = await fetch(`/api/meetups/${meetupId}/ready/ok`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    fetchStatus();
  };

  const handleRetry = async () => {
    const res = await fetch(`/api/meetups/${meetupId}/ready/start`, { method: "POST" });
    if (res.ok) fetchStatus();
  };

  const me = participants.find((p) => p.isMe);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-50 py-16">
      <CloudBackground />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="relative flex flex-col items-center">
          <div
            className="animate-plane-bob drop-shadow-lg"
            style={{ fontSize: "9rem" }}
          >
            ✈️
          </div>
        </div>

        {error && (
          <p className="max-w-sm rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {status === "CONFIRMED" && (
          <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-lg">
            <p className="mb-2 text-2xl font-bold text-sky-900">팀 확정! 🎉</p>
            <p className="mb-4 text-sm text-sky-700">전원 준비 완료, 정모가 확정됐어요.</p>
            <Link
              href={`/meetups/${meetupId}`}
              className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              정모 상세로 이동
            </Link>
          </div>
        )}

        {status === "EXPIRED" && (
          <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-lg">
            <p className="mb-2 text-xl font-bold text-zinc-900">시간 초과</p>
            <p className="mb-4 text-sm text-zinc-600">
              30초 안에 전원이 준비하지 못했어요. 다시 시도할 수 있어요.
            </p>
            <button
              onClick={handleRetry}
              className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {status === "READY_CHECK" && (
          <div className="w-full max-w-sm rounded-3xl bg-white/85 px-8 py-6 shadow-lg backdrop-blur">
            <p className="mb-1 text-sm font-medium text-sky-700">전원 준비되면 출발해요</p>
            <p className="mb-4 text-4xl font-bold tabular-nums text-sky-900">{remaining}초</p>

            <ul className="mb-5 flex flex-col gap-2">
              {participants.map((p) => (
                <li
                  key={p.userId}
                  className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-2 text-sm"
                >
                  <span className="text-sky-900">
                    {p.name} {p.isMe && "(나)"}
                  </span>
                  <span className={p.ready ? "text-emerald-600" : "text-sky-400"}>
                    {p.ready ? "✓ 준비완료" : "대기 중"}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleOk}
              disabled={me?.ready}
              className="w-full rounded-full bg-sky-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
            >
              {me?.ready ? "OK 누름 ✓" : "OK"}
            </button>
          </div>
        )}

        <CabinExplorer
          waitingCount={Math.max(0, participants.length - 1)}
          chaseActive={status === "READY_CHECK"}
        />

        <button
          onClick={() => router.push(`/meetups/${meetupId}`)}
          className="text-sm text-sky-800 underline underline-offset-2"
        >
          정모 상세로 돌아가기
        </button>
      </div>
    </div>
  );
}
