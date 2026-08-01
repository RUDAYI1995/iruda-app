"use client";

import { useEffect, useState } from "react";
import { extractItems, type DetectedItem } from "@/lib/notificationItems";
import { PackingBagReveal } from "@/components/PackingBagReveal";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "unsupported" | "checking" | "off" | "on" | "denied";

type SelfReminder = { id: string; body: string; sendAt: string; items?: DetectedItem[] };

export function LudaAlertButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [reminders, setReminders] = useState<SelfReminder[]>([]);
  const [reminderAt, setReminderAt] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (open) loadReminders();
  }, [open]);

  async function loadReminders() {
    const res = await fetch("/api/notifications/self");
    if (!res.ok) return;
    const data = await res.json();
    setReminders(data.notifications ?? []);
  }

  async function addReminder() {
    if (!reminderAt || !reminderText.trim()) return;
    setSavingReminder(true);
    try {
      await fetch("/api/notifications/self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAt: new Date(reminderAt).toISOString(), message: reminderText }),
      });
      setReminderText("");
      setReminderAt("");
      await loadReminders();
    } finally {
      setSavingReminder(false);
    }
  }

  async function deleteReminder(id: string) {
    await fetch("/api/notifications/self", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setReminders((r) => r.filter((x) => x.id !== id));
  }

  async function checkStatus() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }

  async function enable() {
    setLoading(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        setMessage("알림 권한을 허용해주셔야 루다알림제를 켤 수 있어요.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setMessage("서버에 VAPID 키가 설정되어 있지 않아요.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setStatus("on");
      setMessage("루다알림제를 켰어요! 🔔 알림을 보냈으니 확인해보세요.");

      // 켜지자마자 바로 알림이 가도록 즉시 발송
      fetch("/api/push/test", { method: "POST" }).catch(() => {});
    } catch (error) {
      console.error(error);
      setMessage("알림을 켜는 중 문제가 생겼어요.");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
      setMessage("루다알림제를 껐어요.");
    } catch (error) {
      console.error(error);
      setMessage("알림을 끄는 중 문제가 생겼어요.");
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/push/test", { method: "POST" });
    setLoading(false);
    setMessage(res.ok ? "테스트 알림을 보냈어요! 잠시 후 확인해보세요 🐾" : "테스트 알림 발송에 실패했어요.");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-indigo-200 bg-white text-lg shadow transition-transform hover:scale-110 dark:border-indigo-900 dark:bg-zinc-950"
        title="루다알림제"
        aria-label="루다알림제"
      >
        {status === "on" ? "🔔" : "🔕"}
      </button>

      {open && (
        <div className="absolute right-full top-0 mr-2 max-h-[80vh] w-72 overflow-y-auto rounded-2xl border border-indigo-200 bg-white p-4 text-sm shadow-xl dark:border-indigo-900 dark:bg-zinc-950">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold text-indigo-700 dark:text-indigo-300">🔔 루다알림제</p>
            <a href="/notifications" className="text-[11px] font-medium text-indigo-500 hover:underline">
              📬 받은 알림 보기
            </a>
          </div>

          {status === "unsupported" && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              이 브라우저에서는 알림 기능을 지원하지 않아요.
            </p>
          )}

          {status === "denied" && (
            <p className="text-xs text-red-500">
              브라우저 설정에서 알림 권한이 차단되어 있어요. 브라우저 사이트 설정에서 알림을 허용해주세요.
            </p>
          )}

          {(status === "off" || status === "on" || status === "checking") && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    브라우저 알림 권한
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={status === "on"}
                    onClick={() => (status === "on" ? disable() : enable())}
                    disabled={loading || status === "checking"}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                      status === "on" ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        status === "on" ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {status === "on" ? "ON — 알림을 받고 있어요" : status === "checking" ? "확인 중..." : "OFF"}
                </p>

                {status === "on" && (
                  <button
                    onClick={sendTest}
                    disabled={loading}
                    className="rounded-full border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-700 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-300"
                  >
                    알림 다시 보내보기
                  </button>
                )}
              </div>
            )}

          {message && (
            <p className="mt-2 rounded-xl bg-zinc-50 px-2.5 py-1.5 text-[11px] leading-4 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              {message}
            </p>
          )}

          <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            <p className="mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              ⏰ 내 알림 설정
            </p>
            <p className="mb-2 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
              시간과 메시지를 정해두면 그 시각에 루다월드가 알려드려요. 파티 소속이 아니어도 누구나 쓸 수 있어요.
            </p>
            <div className="flex flex-col gap-1.5">
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <textarea
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="예: 여권, 칫솔, 노트북 챙기기"
                rows={2}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {extractItems(reminderText).length > 0 && (
                <PackingBagReveal items={extractItems(reminderText)} />
              )}
              <button
                onClick={addReminder}
                disabled={savingReminder || !reminderAt || !reminderText.trim()}
                className="self-start rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                {savingReminder ? "등록 중..." : "알림 예약하기"}
              </button>
            </div>

            {reminders.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-indigo-50 px-2 py-1.5 text-[11px] dark:bg-indigo-950/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-indigo-700 dark:text-indigo-300">
                        {new Date(r.sendAt).toLocaleString("ko-KR")}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">{r.body}</p>
                      {r.items && r.items.length > 0 && (
                        <div className="mt-1">
                          <PackingBagReveal items={r.items} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="shrink-0 text-zinc-400 hover:text-red-500"
                      aria-label="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-400 dark:border-zinc-900 dark:text-zinc-500">
            <p className="mb-1 font-semibold text-zinc-500 dark:text-zinc-400">참고해주세요</p>
            <p>· 안드로이드(크롬/삼성인터넷)는 바로 알림이 와요.</p>
            <p>
              · 아이폰(사파리)은 iOS 16.4 이상에서, 루다월드를 <b>홈 화면에 추가</b>한 경우에만 알림이 와요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
