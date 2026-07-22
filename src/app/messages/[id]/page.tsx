"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  body: string;
  isMe: boolean;
  createdAt: string;
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [otherUserName, setOtherUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages/${conversationId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setError(null);
    setOtherUserName(data.otherUserName);
    setMessages(data.messages);
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const body = draft;
    setDraft("");

    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    fetchMessages();
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/messages" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400">
            ← 목록
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {otherUserName ?? "..."}
          </h1>
        </div>

        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <div className="mb-4 flex flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950" style={{ minHeight: 360, maxHeight: 480 }}>
          {messages.length === 0 && (
            <p className="text-center text-sm text-zinc-400">아직 메시지가 없어요. 첫 인사를 건네보세요.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
              <span
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.isMe
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {m.body}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 rounded-full border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            전송
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
          3초마다 자동으로 새 메시지를 확인해요.
        </p>
      </div>
    </div>
  );
}
