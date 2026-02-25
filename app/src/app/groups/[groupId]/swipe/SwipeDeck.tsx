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
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
        <p className="text-zinc-400">
          No more movies to rate. Add some in Movies or check the ranking!
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
        <p className="text-zinc-400">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-lg">
        <h4 className="text-xl font-bold">
          {current.title}
          {current.year ? ` (${current.year})` : ""}
        </h4>
        <p className="mt-2 text-sm text-zinc-500">
          by {current.creator.name ?? "Unknown"}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => submitRating("SUPERDISLIKE")}
          disabled={loading}
          className="rounded-lg bg-red-900/50 px-4 py-2 text-red-300 hover:bg-red-900 disabled:opacity-50"
        >
          Superdislike (-4)
        </button>
        <button
          onClick={skip}
          disabled={loading}
          className="rounded-lg bg-zinc-700 px-4 py-2 hover:bg-zinc-600 disabled:opacity-50"
        >
          Skip
        </button>
        <button
          onClick={() => submitRating("LIKE")}
          disabled={loading}
          className="rounded-lg bg-green-900/50 px-4 py-2 text-green-300 hover:bg-green-900 disabled:opacity-50"
        >
          Like (+1)
        </button>
        <button
          onClick={() => submitRating("SUPERLIKE")}
          disabled={loading}
          className="rounded-lg bg-amber-600 px-4 py-2 text-zinc-950 hover:bg-amber-500 disabled:opacity-50"
        >
          Superlike (+3)
        </button>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Shortcuts: L Like · S Superlike · D Superdislike · K Skip
      </p>
    </div>
  );
}
