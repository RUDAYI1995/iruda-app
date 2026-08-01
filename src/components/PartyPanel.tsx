"use client";

import { useEffect, useState } from "react";
import { extractItems } from "@/lib/notificationItems";
import { PackingBagReveal } from "@/components/PackingBagReveal";

type PartyInfo = {
  id: string;
  isLeader: boolean;
  leaderId: string;
  leaderName: string;
  members: { userId: string; name: string }[];
} | null;

type Invite = { id: string; fromUserId: string; fromName: string; createdAt: string };

type Itinerary = {
  destination: string | null;
  departureAt: string | null;
  notes: string | null;
} | null;

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export function PartyPanel() {
  const [party, setParty] = useState<PartyInfo>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const [itinerary, setItinerary] = useState<Itinerary>(null);
  const [destination, setDestination] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [notes, setNotes] = useState("");
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [notifyMembersMessage, setNotifyMembersMessage] = useState<string | null>(null);
  const [notifyingMembers, setNotifyingMembers] = useState(false);

  const [targetUserId, setTargetUserId] = useState("");
  const [targetSendAt, setTargetSendAt] = useState("");
  const [targetMessage, setTargetMessage] = useState("");
  const [sendingTarget, setSendingTarget] = useState(false);
  const [targetResult, setTargetResult] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/party/me");
    const data = await res.json();
    setParty(data.party ?? null);
    setInvites(data.invites ?? []);

    if (data.party) {
      const itRes = await fetch("/api/party/itinerary");
      const itData = await itRes.json();
      setItinerary(itData.itinerary ?? null);
      setDestination(itData.itinerary?.destination ?? "");
      setDepartureAt(toDatetimeLocal(itData.itinerary?.departureAt ?? null));
      setNotes(itData.itinerary?.notes ?? "");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(inviteId: string, accept: boolean) {
    await fetch("/api/party/invites/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId, accept }),
    });
    load();
  }

  async function saveItinerary() {
    setSavingItinerary(true);
    setNotifyMembersMessage(null);
    try {
      const res = await fetch("/api/party/itinerary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          departureAt: departureAt ? new Date(departureAt).toISOString() : null,
          notes,
        }),
      });
      const data = await res.json();
      if (res.ok) setItinerary(data.itinerary);
    } finally {
      setSavingItinerary(false);
    }
  }

  async function notifyMembers() {
    setNotifyingMembers(true);
    setNotifyMembersMessage(null);
    const res = await fetch("/api/party/notify-members", { method: "POST" });
    const data = await res.json();
    setNotifyingMembers(false);
    setNotifyMembersMessage(
      res.ok ? `파티원 ${data.sentTo}명에게 여행 준비 알림을 보냈어요! 🧳` : data.error ?? "알림 발송에 실패했어요"
    );
  }

  async function sendTargetNotification() {
    if (!targetUserId || !targetSendAt || !targetMessage.trim()) return;
    setSendingTarget(true);
    setTargetResult(null);
    try {
      const res = await fetch("/api/party/notify-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          sendAt: new Date(targetSendAt).toISOString(),
          message: targetMessage,
        }),
      });
      const data = await res.json();
      setTargetResult(
        res.ok
          ? "예약했어요! 지정한 시각에 알림이 전달돼요 🔔"
          : data.error ?? "예약에 실패했어요"
      );
      if (res.ok) setTargetMessage("");
    } finally {
      setSendingTarget(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">파티 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 font-bold text-zinc-900 dark:text-zinc-50">🎒 내 파티</h3>

      {party ? (
        <div>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            파티장: {party.leaderName} {party.isLeader && "(나)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {party.members.map((m) => (
              <span
                key={m.userId}
                className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-300"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          아직 파티가 없어요. 게시판·정모 등에서 사람 이름을 눌러 파티에 참여해보세요.
        </p>
      )}

      {invites.length > 0 && (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            받은 파티 제안
          </p>
          <div className="flex flex-col gap-2">
            {invites.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-2 text-sm dark:bg-violet-950/20"
              >
                <span className="text-violet-800 dark:text-violet-200">
                  {i.fromName}님의 파티 제안
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => respond(i.id, true)}
                    className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => respond(i.id, false)}
                    className="rounded-full border border-violet-300 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:text-violet-300"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {party && party.isLeader && (
        <div className="mt-4 flex flex-col gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              ✈️ 여행 일정표 (파티장 전용)
            </p>
            <div className="flex flex-col gap-2">
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="목적지 (예: 오사카)"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <input
                type="datetime-local"
                value={departureAt}
                onChange={(e) => setDepartureAt(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="메모/준비물 (예: 여권, 우산, 보조배터리)"
                rows={2}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveItinerary}
                  disabled={savingItinerary}
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  {savingItinerary ? "저장 중..." : "일정표 저장"}
                </button>
                <button
                  onClick={notifyMembers}
                  disabled={notifyingMembers || !itinerary}
                  className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {notifyingMembers ? "보내는 중..." : "🧳 여행준비 알림 보내기"}
                </button>
              </div>
              {notifyMembersMessage && (
                <p className="text-xs text-sky-700 dark:text-sky-300">{notifyMembersMessage}</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              📣 파티원에게 개별 알림 예약
            </p>
            <div className="flex flex-col gap-2">
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">받는 사람 선택</option>
                {party.members
                  .filter((m) => m.userId !== party.leaderId)
                  .map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                    </option>
                  ))}
              </select>
              <input
                type="datetime-local"
                value={targetSendAt}
                onChange={(e) => setTargetSendAt(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <textarea
                value={targetMessage}
                onChange={(e) => setTargetMessage(e.target.value)}
                placeholder="예: 내일 오전 7시가 저희 모임 출발시간입니다. 여권은 꼭 챙겨주세요!"
                rows={2}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {extractItems(targetMessage).length > 0 && (
                <PackingBagReveal items={extractItems(targetMessage)} />
              )}
              <button
                onClick={sendTargetNotification}
                disabled={sendingTarget || !targetUserId || !targetSendAt || !targetMessage.trim()}
                className="self-start rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {sendingTarget ? "예약 중..." : "지정 시각에 보내기"}
              </button>
              {targetResult && (
                <p className="text-xs text-violet-700 dark:text-violet-300">{targetResult}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
