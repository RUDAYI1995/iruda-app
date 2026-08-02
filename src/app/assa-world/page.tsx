"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type BestPost = {
  rank: number;
  name: string;
  image: string;
  content: string;
};

const BEST_POSTS: BestPost[] = [
  {
    rank: 1,
    name: "김소심",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    content:
      "아침 7시 기상 → 혼자 동네 카페에서 브런치 → 도서관에서 3시간 독서 → 저녁엔 넷플릭스 정주행. 아무도 안 만났는데 하루가 꽉 찼다냥, 완벽한 24시간이었어요.",
  },
  {
    rank: 2,
    name: "이조용",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80",
    content:
      "혼자 등산 다녀오고, 산 정상에서 도시락 먹고, 내려와서 동네 목욕탕까지! 말 한마디 안 했는데도 몸도 마음도 개운했어요.",
  },
  {
    rank: 3,
    name: "정이동",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
    content:
      "새벽에 혼자 러닝 → 집에서 브런치 만들어 먹기 → 오후엔 혼자 영화관 → 밤엔 일기 쓰기. 조용하지만 알찬 하루였어요.",
  },
];

type FeedPost = {
  id: string;
  imageUrl: string;
  content: string;
  author: string;
  voteId: string | null;
};

export default function AssaWorldPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assa-world/posts");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadPosts();
    };
    init();
  }, [loadPosts]);

  function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submit(submitToVote: boolean) {
    setError(null);
    if (!photoDataUrl) {
      setError("사진을 먼저 올려주세요");
      return;
    }
    if (!content.trim()) {
      setError("글을 입력해주세요");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/assa-world/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: photoDataUrl, content, submitToVote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "등록에 실패했어요");
        return;
      }
      setMessage(
        submitToVote
          ? "게시글을 올리고 루다투표제에도 신청했어요! 🗳️"
          : "게시글을 올렸어요! 🎉"
      );
      setPhotoDataUrl(null);
      setContent("");
      setShowForm(false);
      await loadPosts();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <p className="mb-2 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          ✨ 아싸세상
        </p>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          혼자여도 반짝반짝, 내 24시간 자랑하기
        </h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          혼자서 알차게 보낸 하루를 사진과 글로 자랑해보세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {BEST_POSTS.map((p) => (
          <div
            key={p.rank}
            className="flex flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-900 dark:bg-zinc-950"
          >
            <div className="relative">
              <img src={p.image} alt={p.name} className="h-32 w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-extrabold text-white shadow">
                BEST {p.rank}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{p.name}</p>
              <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{p.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-600"
        >
          ✍️ 글 작성하기
        </button>
      </div>

      {message && (
        <p className="rounded-2xl bg-amber-50 p-3 text-center text-sm font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          {message}
        </p>
      )}

      {loading && <p className="text-center text-sm text-zinc-400">불러오는 중...</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <div
            key={p.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <img src={p.imageUrl} alt={p.author} className="h-40 w-full object-cover" />
            <div className="flex flex-col gap-1 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{p.author}</p>
                {p.voteId && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
                    🗳️ 투표 진행 중
                  </span>
                )}
              </div>
              <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{p.content}</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-3 rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">✍️ 아싸세상 글쓰기</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
            >
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="미리보기" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">📷 사진 올리기</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoSelected}
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 혼자 어떻게 알차게 보냈는지 적어주세요"
              rows={4}
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />

            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit(false)}
                className="flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {submitting ? "처리 중..." : "게시글 올리기"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit(true)}
                className="flex-1 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {submitting ? "처리 중..." : "🗳️ 투표제 신청하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/home" className="text-sm text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400">
          ← 루다월드 홈으로
        </Link>
      </div>
    </div>
  );
}
