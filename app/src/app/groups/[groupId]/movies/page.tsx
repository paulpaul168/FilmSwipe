import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { MovieSubmissionForm } from "./MovieSubmissionForm";
import { DeleteMovieButton } from "./DeleteMovieButton";

export default async function GroupMoviesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await requireUser();

  try {
    await assertGroupMember(groupId, user.id);
  } catch {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  });

  if (!group) notFound();

  const isOwner = group.ownerId === user.id;

  const movies = await prisma.movie.findMany({
    where: { groupId },
    include: {
      creator: { select: { name: true } },
      _count: { select: { ratings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const ratingsByMovie = await prisma.rating.groupBy({
    by: ["movieId", "value"],
    where: { movie: { groupId } },
    _count: true,
  });

  const agg = new Map<
    string,
    { likes: number; superlikes: number; superdislikes: number }
  >();
  for (const r of ratingsByMovie) {
    if (!agg.has(r.movieId)) {
      agg.set(r.movieId, { likes: 0, superlikes: 0, superdislikes: 0 });
    }
    const a = agg.get(r.movieId)!;
    if (r.value === "LIKE") a.likes = r._count;
    if (r.value === "SUPERLIKE") a.superlikes = r._count;
    if (r.value === "SUPERDISLIKE") a.superdislikes = r._count;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Submit a movie</h3>
        <MovieSubmissionForm groupId={groupId} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Movies</h3>
        {movies.length === 0 ? (
          <p className="text-zinc-500">No movies yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {movies.map((m) => {
              const a = agg.get(m.id) ?? {
                likes: 0,
                superlikes: 0,
                superdislikes: 0,
              };
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div>
                    <span className="font-medium">
                      {m.title}
                      {m.year ? ` (${m.year})` : ""}
                    </span>
                    <p className="text-sm text-zinc-500">
                      by {m.creator.name ?? "Unknown"} · 👍{a.likes} · 🔥
                      {a.superlikes} · 👎{a.superdislikes}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && <DeleteMovieButton movieId={m.id} />}
                    <Link
                      href={`/groups/${groupId}/swipe`}
                      className="rounded bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
                    >
                      Swipe
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
