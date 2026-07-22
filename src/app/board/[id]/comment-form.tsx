"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    const res = await fetch(`/api/board/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setBody("");
    setError(null);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="댓글을 입력하세요"
        className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        등록
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
