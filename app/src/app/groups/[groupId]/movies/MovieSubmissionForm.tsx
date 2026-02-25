"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImdbResult = { title: string; year: string | null; url: string };

export function MovieSubmissionForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [imdbUrl, setImdbUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imdbResults, setImdbResults] = useState<ImdbResult[] | null>(null);
  const [imdbSearching, setImdbSearching] = useState(false);

  async function searchImdb() {
    const q = [title.trim(), year.trim()].filter(Boolean).join(" ");
    if (!q) return;
    setImdbSearching(true);
    setImdbResults(null);
    try {
      const res = await fetch(`/api/imdb/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setImdbResults(data.results ?? []);
    } catch {
      setImdbResults([]);
    } finally {
      setImdbSearching(false);
    }
  }

  function selectImdb(r: ImdbResult) {
    setTitle(r.title);
    if (r.year) setYear(r.year);
    setImdbUrl(r.url);
    setImdbResults(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          year: year ? parseInt(year, 10) : null,
          imdbUrl: imdbUrl.trim() || null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add movie");
        return;
      }
      setTitle("");
      setYear("");
      setImdbUrl("");
      setNote("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-2 block text-sm text-zinc-400">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
              placeholder="Movie title"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={searchImdb}
              disabled={imdbSearching || !title.trim()}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 disabled:opacity-50"
            >
              {imdbSearching ? "Searching…" : "Search IMDb"}
            </button>
          </div>
        </div>
        {imdbResults && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900">
            {imdbResults.length === 0 ? (
              <p className="p-3 text-sm text-zinc-500">No results</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {imdbResults.map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => selectImdb(r)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-800"
                    >
                      {r.title}
                      {r.year ? ` (${r.year})` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">Year</label>
          <input
            type="number"
            min={1900}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
            placeholder="2024"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">IMDb URL</label>
          <input
            type="url"
            value={imdbUrl}
            onChange={(e) => setImdbUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
            placeholder="https://imdb.com/title/tt..."
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-400">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
          placeholder="Optional note"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-amber-500 px-6 py-2 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add movie"}
      </button>
    </form>
  );
}
