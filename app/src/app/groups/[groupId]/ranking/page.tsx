import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertGroupMember } from "@/lib/groupAccess";
import {
  computeAggregates,
  computeFinalScore,
  type RatingValue,
} from "@/lib/ranking";
import { RankingList } from "./RankingList";

export default async function RankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{
    unseen?: string;
    submittedBy?: string;
    maxSuperdislikes?: string;
  }>;
}) {
  const { groupId } = await params;
  const user = await requireUser();

  try {
    await assertGroupMember(groupId, user.id);
  } catch {
    notFound();
  }

  const movies = await prisma.movie.findMany({
    where: { groupId },
    include: {
      creator: { select: { id: true, name: true } },
      ratings: true,
    },
  });

  const myRatings = await prisma.rating.findMany({
    where: { userId: user.id, movie: { groupId } },
    select: { movieId: true, value: true },
  });
  const myRatingMap = new Map(myRatings.map((r) => [r.movieId, r.value]));

  const { unseen, submittedBy, maxSuperdislikes } = await searchParams;

  let filtered = movies.map((m) => {
    const aggs = computeAggregates(
      m.ratings.map((r) => ({ value: r.value as RatingValue }))
    );
    const score = computeFinalScore(aggs);
    const myRating = myRatingMap.get(m.id) ?? null;
    return {
      id: m.id,
      title: m.title,
      year: m.year,
      creator: m.creator,
      ...aggs,
      score,
      myRating,
    };
  });

  if (unseen === "1") {
    filtered = filtered.filter((m) => !m.myRating);
  }
  if (submittedBy) {
    filtered = filtered.filter((m) => m.creator.id === submittedBy);
  }
  const maxSd = maxSuperdislikes ? parseInt(maxSuperdislikes, 10) : null;
  if (maxSd != null && !Number.isNaN(maxSd)) {
    filtered = filtered.filter((m) => m.superdislikes < maxSd);
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true } } },
  });

  return (
    <RankingList
      movies={filtered}
      members={members.map((m) => ({
        id: m.user.id,
        name: m.user.name ?? "Unknown",
      }))}
      filters={{
        unseen: unseen === "1",
        submittedBy: submittedBy ?? "",
        maxSuperdislikes: maxSuperdislikes ?? "",
      }}
    />
  );
}
