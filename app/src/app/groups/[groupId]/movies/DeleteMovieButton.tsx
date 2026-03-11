"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMovieButton({ movieId }: { movieId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/movies/${movieId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded bg-zinc-800 px-3 py-1 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300"
      title="Delete movie"
    >
      Delete
    </button>
  );
}
