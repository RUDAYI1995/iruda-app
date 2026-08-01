"use client";

import { useEffect, useRef, useState } from "react";

type Invite = { id: string; fromUserId: string; fromName: string; createdAt: string };

type View = "invite" | "formed" | null;

export function PartyInviteModal() {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [view, setView] = useState<View>(null);
  const [loading, setLoading] = useState(false);
  const dismissedIds = useRef<Set<string>>(new Set());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function poll() {
      if (view) return; // 이미 모달이 떠 있으면 새로 갈아치우지 않음
      try {
        const res = await fetch("/api/party/me");
        if (!res.ok) return; // 로그인 안 된 상태면 401 — 조용히 무시
        const data = await res.json();
        const invites: Invite[] = data.invites ?? [];
        const next = invites.find((i) => !dismissedIds.current.has(i.id));
        if (next) {
          setInvite(next);
          setView("invite");
        }
      } catch {
        // 조용히 무시 — 다음 폴링에서 다시 시도
      }
    }

    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (!view) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(close, 30000);
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function close() {
    if (invite) dismissedIds.current.add(invite.id);
    setView(null);
    setInvite(null);
  }

  async function respond(accept: boolean) {
    if (!invite || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/party/invites/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId: invite.id, accept }),
      });
      dismissedIds.current.add(invite.id);
      if (res.ok && accept) {
        setView("formed");
      } else {
        close();
      }
    } catch {
      close();
    } finally {
      setLoading(false);
    }
  }

  if (!view) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-xs overflow-hidden rounded-3xl shadow-2xl">
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-lg font-bold text-white hover:bg-black/60"
          aria-label="닫기"
        >
          ✕
        </button>

        {view === "invite" && invite && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/party-invite.png" alt="파티 제안을 받았어요" className="block w-full" />
            <div className="absolute bottom-[10.5%] left-0 flex w-full items-center justify-center gap-3 px-6">
              <button
                onClick={() => respond(false)}
                disabled={loading}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border-2 border-pink-200 bg-white/90 py-2.5 text-pink-400 shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                <span className="text-xl">💔</span>
                <span className="text-xs font-bold">거절할게요</span>
              </button>
              <button
                onClick={() => respond(true)}
                disabled={loading}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border-2 border-pink-400 bg-pink-500 py-2.5 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                <span className="text-xl">💗</span>
                <span className="text-xs font-bold">
                  {invite.fromName}님 파티 승낙!
                </span>
              </button>
            </div>
          </div>
        )}

        {view === "formed" && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/party-formed.png" alt="완벽한 파티를 찾았어요" className="block w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
