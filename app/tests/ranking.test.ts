import { describe, expect, it } from "vitest";
import {
  computeAggregates,
  computeBaseScore,
  computeFinalScore,
  computePolarizationPenalty,
} from "@/lib/ranking";

describe("ranking utilities", () => {
  it("computes aggregates correctly", () => {
    const aggs = computeAggregates([
      { value: "LIKE" },
      { value: "LIKE" },
      { value: "SUPERLIKE" },
      { value: "SUPERDISLIKE" },
      { value: "SUPERDISLIKE" },
    ]);

    expect(aggs).toEqual({
      likes: 2,
      superlikes: 1,
      superdislikes: 2,
    });
  });

  it("computes base score with defined weights", () => {
    const aggs = { likes: 2, superlikes: 1, superdislikes: 2 };
    // baseScore = 2*1 + 1*3 - 2*4 = 2 + 3 - 8 = -3
    expect(computeBaseScore(aggs)).toBe(-3);
  });

  it("returns zero penalty when there are no votes", () => {
    const aggs = { likes: 0, superlikes: 0, superdislikes: 0 };
    expect(computePolarizationPenalty(aggs)).toBe(0);
  });

  it("applies higher penalty when there are many superdislikes", () => {
    const fewNegatives = { likes: 5, superlikes: 5, superdislikes: 1 };
    const manyNegatives = { likes: 5, superlikes: 5, superdislikes: 5 };

    expect(computePolarizationPenalty(manyNegatives)).toBeGreaterThan(
      computePolarizationPenalty(fewNegatives),
    );
  });

  it("computes final score as base minus penalty", () => {
    const aggs = { likes: 3, superlikes: 2, superdislikes: 1 };
    const base = computeBaseScore(aggs);
    const penalty = computePolarizationPenalty(aggs);

    expect(computeFinalScore(aggs)).toBeCloseTo(base - penalty);
  });
});

