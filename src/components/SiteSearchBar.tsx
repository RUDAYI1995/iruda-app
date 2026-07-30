"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  title: string;
  href?: string;
  elementId?: string;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, "");
}

export function SiteSearchBar({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const q = normalize(query.trim());
  const suggestions = q
    ? items.filter((item) => normalize(item.title).includes(q)).slice(0, 6)
    : [];

  const goToItem = (item: SearchItem) => {
    setNotFound(false);
    setShowSuggestions(false);
    setQuery(item.title);

    if (item.elementId) {
      const el = document.getElementById(item.elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("animate-search-highlight");
        setTimeout(() => el.classList.remove("animate-search-highlight"), 1600);
        (el.querySelector("button") as HTMLButtonElement | null)?.click();
      }
      return;
    }
    if (item.href) router.push(item.href);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q) return;

    if (suggestions.length > 0) {
      goToItem(suggestions[0]);
      return;
    }

    const match = items.find((item) => {
      const title = normalize(item.title);
      return title.includes(q) || q.includes(title);
    });

    if (!match) {
      setNotFound(true);
      return;
    }
    goToItem(match);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setNotFound(false);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
        placeholder="루다월드에서 검색해보세요"
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        🔍
      </button>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {suggestions.map((item) => (
            <li key={item.title}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToItem(item)}
                className="block w-full truncate px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                🔍 {item.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!showSuggestions && notFound && (
        <p className="absolute left-0 top-full mt-1 text-xs text-red-500">
          일치하는 기능을 못 찾았어요
        </p>
      )}
    </form>
  );
}
