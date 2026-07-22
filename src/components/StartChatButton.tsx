"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StartChatButton({
  otherUserId,
  label = "1:1 대화하기",
  className,
}: {
  otherUserId: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/messages/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    router.push(`/messages/${data.conversationId}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        className ??
        "rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      }
    >
      {loading ? "연결 중..." : label}
    </button>
  );
}
