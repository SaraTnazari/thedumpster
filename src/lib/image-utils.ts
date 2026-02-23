/**
 * Centralized image URL utility for the Dumpster app.
 * Handles TMDB poster paths and full URLs.
 */

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export function getImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${TMDB_IMAGE_BASE}${url}`;
}
