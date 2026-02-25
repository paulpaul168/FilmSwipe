export type RatingValue = "LIKE" | "SUPERLIKE" | "SUPERDISLIKE";

export interface RatingAggregateInput {
  value: RatingValue;
}

export interface RatingAggregates {
  likes: number;
  superlikes: number;
  superdislikes: number;
}

export function computeAggregates(ratings: RatingAggregateInput[]): RatingAggregates {
  return ratings.reduce<RatingAggregates>(
    (acc, rating) => {
      if (rating.value === "LIKE") acc.likes += 1;
      if (rating.value === "SUPERLIKE") acc.superlikes += 1;
      if (rating.value === "SUPERDISLIKE") acc.superdislikes += 1;
      return acc;
    },
    { likes: 0, superlikes: 0, superdislikes: 0 },
  );
}

export function computeBaseScore(aggs: RatingAggregates): number {
  return aggs.likes * 1 + aggs.superlikes * 3 - aggs.superdislikes * 4;
}

export function computePolarizationPenalty(aggs: RatingAggregates): number {
  const positive = aggs.likes + aggs.superlikes;
  const negative = aggs.superdislikes;
  const totalVotes = positive + negative;

  if (totalVotes === 0) return 0;

  const spread = Math.abs(positive - negative);
  const penaltyFromNegatives = negative * 1.5;
  const penaltyFromSpread = spread * 0.5;

  return Math.min(penaltyFromNegatives, penaltyFromSpread);
}

export function computeFinalScore(aggs: RatingAggregates): number {
  const base = computeBaseScore(aggs);
  const penalty = computePolarizationPenalty(aggs);
  return base - penalty;
}

