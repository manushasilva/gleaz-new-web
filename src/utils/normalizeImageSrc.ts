export function normalizeImageSrc(src?: string, fallback = "/images/logo/logo.svg") {
  if (!src) return fallback;
  const s = String(src).trim();
  if (!s) return fallback;

  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
    return s;
  }

  // If a relative path without leading slash, add a leading slash to make it local
  if (s.startsWith("./")) return s.replace(/^\.\/+/, "/");

  return `/${s}`;
}
