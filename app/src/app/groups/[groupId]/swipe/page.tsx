import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { SwipeDeck } from "./SwipeDeck";

export default async function SwipePage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ movieId?: string }>;
}) {
  const { groupId } = await params;
  const { movieId: reswipeMovieId } = await searchParams;
  const user = await requireUser();

  try {
    await assertGroupMember(groupId, user.id);
  } catch {
    notFound();
  }

  const ratedMovieIds = (
    await prisma.rating.findMany({
      where: { userId: user.id },
      select: { movieId: true },
    })
  ).map((r) => r.movieId);

  const unratedMovies = await prisma.movie.findMany({
    where: {
      groupId,
      id: { notIn: ratedMovieIds },
    },
    include: { creator: { select: { name: true } } },
    take: 20,
  });

  let movies = unratedMovies;

  if (reswipeMovieId) {
    const alreadyInDeck = unratedMovies.find((m) => m.id === reswipeMovieId);
    if (alreadyInDeck) {
      movies = [
        alreadyInDeck,
        ...unratedMovies.filter((m) => m.id !== reswipeMovieId),
      ];
    } else {
      const movieToReswipe = await prisma.movie.findFirst({
        where: { id: reswipeMovieId, groupId },
        include: { creator: { select: { name: true } } },
      });
      if (movieToReswipe) {
        movies = [movieToReswipe, ...unratedMovies];
      }
    }
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <SwipeDeck
        groupId={groupId}
        movies={movies}
        userId={user.id}
      />
    </div>
  );
}
