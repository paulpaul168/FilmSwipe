import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import { SwipeDeck } from "./SwipeDeck";

export default async function SwipePage({
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

  const unratedMovies = await prisma.movie.findMany({
    where: {
      groupId,
      id: {
        notIn: (
          await prisma.rating.findMany({
            where: { userId: user.id },
            select: { movieId: true },
          })
        ).map((r) => r.movieId),
      },
    },
    include: { creator: { select: { name: true } } },
    take: 20,
  });

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-6 text-lg font-semibold">Swipe to rate</h3>
      <SwipeDeck
        groupId={groupId}
        movies={unratedMovies}
        userId={user.id}
      />
    </div>
  );
}
