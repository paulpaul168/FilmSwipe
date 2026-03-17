"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type MovieRow = {
  id: string;
  title: string;
  year: number | null;
  creator: { id: string; name: string | null };
  likes: number;
  superlikes: number;
  superdislikes: number;
  score: number;
  myRating: string | null;
};

type Member = { id: string; name: string };

export function RankingList({
  movies,
  members,
  filters,
}: {
  movies: MovieRow[];
  members: Member[];
  filters: {
    unseen: boolean;
    submittedBy: string;
    maxSuperdislikes: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const groupId = pathname.split("/")[2] ?? "";
  const swipeHref = groupId ? `/groups/${groupId}/swipe` : "#";
  const [sortBy, setSortBy] = useState<"score" | "likes" | "superlikes" | "superdislikes">("score");

  function buildSearch(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.unseen === "1") sp.set("unseen", "1");
    if (params.submittedBy) sp.set("submittedBy", params.submittedBy);
    if (params.maxSuperdislikes) sp.set("maxSuperdislikes", params.maxSuperdislikes);
    const q = sp.toString();
    return q ? `${pathname}?${q}` : pathname;
  }

  const sorted = [...movies].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "likes") return b.likes - a.likes;
    if (sortBy === "superlikes") return b.superlikes - a.superlikes;
    if (sortBy === "superdislikes") return b.superdislikes - a.superdislikes;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-zinc-500">Sort by:</span>
        {(["score", "likes", "superlikes", "superdislikes"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded px-3 py-1 text-sm ${
                sortBy === s ? "bg-amber-600 text-zinc-950" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {s}
            </button>
          )
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.unseen}
            onChange={(e) => {
              router.push(
                buildSearch({
                  unseen: e.target.checked ? "1" : "",
                  submittedBy: filters.submittedBy,
                  maxSuperdislikes: filters.maxSuperdislikes,
                })
              );
            }}
          />
          Only unseen by me
        </label>
        <select
          value={filters.submittedBy}
          onChange={(e) => {
            router.push(
              buildSearch({
                unseen: filters.unseen ? "1" : "",
                submittedBy: e.target.value,
                maxSuperdislikes: filters.maxSuperdislikes,
              })
            );
          }}
        >
          <option value="">All submitters</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2">
          Exclude ≥
          <input
            type="number"
            min={0}
            value={filters.maxSuperdislikes}
            onChange={(e) => {
              router.push(
                buildSearch({
                  unseen: filters.unseen ? "1" : "",
                  submittedBy: filters.submittedBy,
                  maxSuperdislikes: e.target.value,
                })
              );
            }}
            className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          />
          superdislikes
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Score</th>
              <th className="pb-2 font-medium">👍</th>
              <th className="pb-2 font-medium">🔥</th>
              <th className="pb-2 font-medium">👎</th>
              <th className="pb-2 font-medium">Your rating</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-b border-zinc-800">
                <td className="py-3">
                  {m.title}
                  {m.year ? ` (${m.year})` : ""}
                  <span className="ml-2 text-xs text-zinc-500">
                    by {m.creator.name ?? "Unknown"}
                  </span>
                </td>
                <td className="py-3">{m.score.toFixed(1)}</td>
                <td className="py-3">{m.likes}</td>
                <td className="py-3">{m.superlikes}</td>
                <td className="py-3">{m.superdislikes}</td>
                <td className="py-3">
                  <Link
                    href={`${swipeHref}?movieId=${encodeURIComponent(m.id)}`}
                    className="cursor-pointer text-zinc-400 hover:text-zinc-200"
                    title="Go to Swipe to change your rating"
                  >
                    {m.myRating ? (
                      <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs">
                        {m.myRating}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <p className="text-zinc-500">No movies match the filters.</p>
      )}
    </div>
  );
}
