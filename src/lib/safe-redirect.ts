export const DEFAULT_REDIRECT = "/";

/**
 * Turns an untrusted `redirect` value into a path we are willing to send
 * someone to. Anything that could leave this site becomes the fallback.
 */
export function safeRedirect(
  value: unknown,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (typeof value !== "string" || value === "") return fallback;

  // Control characters can smuggle a scheme past the checks below.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  // Must be a path on this site, and "//host" or "/\host" are not paths.
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  const base = "http://redirect.invalid";
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return fallback;
  }

  if (url.origin !== base) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}
