"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DetectedItem } from "@/lib/notificationItems";
import { PackingBagReveal } from "@/components/PackingBagReveal";

type Received = {
  id: string;
  title: string;
  body: string;
  sendAt: string;
  fromName: string | null;
  items: DetectedItem[];
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Received[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications/received")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">📬 받은 알림</h1>
        <Link
          href="/home"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← 루다월드 홈으로
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">불러오는 중...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-zinc-400">아직 받은 알림이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const items = n.items ?? [];
            return (
              <div
                key={n.id}
                className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900 dark:bg-zinc-950"
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{n.title}</p>
                  <p className="text-[11px] text-zinc-400">
                    {new Date(n.sendAt).toLocaleString("ko-KR")}
                  </p>
                </div>
                {n.fromName && (
                  <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{n.fromName}님이 보냄</p>
                )}
                <p className="text-sm text-zinc-700 dark:text-zinc-200">{n.body}</p>
                {items.length > 0 && (
                  <div className="mt-2">
                    <PackingBagReveal items={items} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
