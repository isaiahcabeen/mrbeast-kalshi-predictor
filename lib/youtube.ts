/**
 * Extracts a YouTube video ID from a URL or returns the ID if it's already
 * in the 11-character format used by YouTube.
 */
export function extractVideoId(input: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }
  try {
    const url = new URL(input);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1) || null;
    }
    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch {
    // Not a valid URL
  }
  return null;
}

/**
 * Returns a case-insensitive regex that matches a whole word or phrase,
 * ensuring it is not part of a longer word.
 */
export function wordBoundaryRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i");
}
