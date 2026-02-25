const WHITESPACE_REGEX = /\s+/g;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;

export function normalizeMovieKey(title: string, year?: number | null): string {
  const trimmed = title.trim().toLowerCase();
  const collapsedWhitespace = trimmed.replace(WHITESPACE_REGEX, " ");
  const slug = collapsedWhitespace.replace(NON_ALPHANUMERIC_REGEX, "-").replace(/^-+|-+$/g, "");

  if (!slug) {
    return year ? `unknown-${year}` : "unknown";
  }

  return year ? `${slug}-${year}` : slug;
}

