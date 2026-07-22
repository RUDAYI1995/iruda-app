"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinButton({ meetupId, alreadyJoined }: { meetupId: string; alreadyJoined: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (alreadyJoined) {
    return (
      <p className="rounded-full bg-zinc-100 px-6 py-3 text-center text-sm font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        이미 참여 중인 정모예요
      </p>
    );
  }

  const handleJoin = async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/meetups/${meetupId}/join`, { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    setMessage(`참여 완료! 궁합 점수 ${data.matchScore}점`);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "확인 중..." : "참여 신청"}
      </button>
      {message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      )}
    </div>
  );
}
