"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

type Movie = {
  id: string;
  title: string;
  year: number | null;
  imdbUrl: string | null;
  creator: { name: string | null };
};

export function SwipeDeck({
  groupId,
  movies: initialMovies,
  userId,
}: {
  groupId: string;
  movies: Movie[];
  userId: string;
}) {
  void groupId;
  void userId;
  const router = useRouter();
  const [movies] = useState(initialMovies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const current = movies[currentIndex];

  const submitRating = useCallback(
    async (value: "LIKE" | "SUPERLIKE" | "SUPERDISLIKE") => {
      if (!current || loading) return;
      setLoading(true);
      try {
        await fetch(`/api/movies/${current.id}/rating`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
        setCurrentIndex((i) => i + 1);
        router.refresh();
      } finally {
        setLoading(false);
      }
    },
    [current, loading, router]
  );

  const skip = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, movies.length));
  }, [movies.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === "l" || e.key === "L") submitRating("LIKE");
      if (e.key === "s" || e.key === "S") submitRating("SUPERLIKE");
      if (e.key === "d" || e.key === "D") submitRating("SUPERDISLIKE");
      if (e.key === "k" || e.key === "K") skip();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, submitRating, skip]);

  if (movies.length === 0) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-12 text-center shadow-xl">
        <p className="text-zinc-400">
          No more movies to rate. Add some in <strong className="text-zinc-300">Movies</strong> or check the <strong className="text-zinc-300">Ranking</strong>.
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-12 text-center shadow-xl">
        <p className="text-lg font-medium text-zinc-300">All caught up!</p>
        <p className="mt-2 text-sm text-zinc-500">Check back later or add more movies.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-8 shadow-xl ring-1 ring-zinc-800">
        <h4 className="text-2xl font-bold tracking-tight text-zinc-100">
          {current.title}
          {current.year ? (
            <span className="font-normal text-zinc-500"> ({current.year})</span>
          ) : null}
        </h4>
        <p className="mt-2 text-sm text-zinc-500">
          Added by {current.creator.name ?? "Unknown"}
        </p>
        {current.imdbUrl && (
          <a
            href={current.imdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
          >
            View on IMDb →
          </a>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => submitRating("SUPERDISLIKE")}
          disabled={loading}
          className="rounded-xl bg-red-950/80 px-5 py-3 text-sm font-medium text-red-300 ring-1 ring-red-900/50 hover:bg-red-900/60 disabled:opacity-50"
        >
          👎 Superdislike
        </button>
        <button
          onClick={skip}
          disabled={loading}
          className="rounded-xl bg-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 ring-1 ring-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
        >
          Skip
        </button>
        <button
          onClick={() => submitRating("LIKE")}
          disabled={loading}
          className="rounded-xl bg-emerald-950/80 px-5 py-3 text-sm font-medium text-emerald-300 ring-1 ring-emerald-900/50 hover:bg-emerald-900/60 disabled:opacity-50"
        >
          👍 Like
        </button>
        <button
          onClick={() => submitRating("SUPERLIKE")}
          disabled={loading}
          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-zinc-950 ring-1 ring-amber-400/50 hover:bg-amber-400 disabled:opacity-50"
        >
          🔥 Superlike
        </button>
      </div>

      <p className="text-center text-xs text-zinc-600">
        L Like · S Superlike · D Superdislike · K Skip
      </p>
    </div>
  );
}
