import { describe, expect, it } from "vitest";
import { normalizeMovieKey } from "@/lib/normalizeMovieKey";

describe("normalizeMovieKey", () => {
  it("normalizes basic title without year", () => {
    expect(normalizeMovieKey("Inception")).toBe("inception");
  });

  it("includes year when provided", () => {
    expect(normalizeMovieKey("Inception", 2010)).toBe("inception-2010");
  });

  it("trims whitespace and collapses multiple spaces", () => {
    expect(normalizeMovieKey("  The   Lord   of   the Rings  ", 2001)).toBe(
      "the-lord-of-the-rings-2001",
    );
  });

  it("strips punctuation and special characters", () => {
    expect(normalizeMovieKey("Spider-Man: No Way Home!", 2021)).toBe(
      "spider-man-no-way-home-2021",
    );
  });

  it("handles empty / whitespace-only titles", () => {
    expect(normalizeMovieKey("   ")).toBe("unknown");
    expect(normalizeMovieKey("   ", 1999)).toBe("unknown-1999");
  });
});

