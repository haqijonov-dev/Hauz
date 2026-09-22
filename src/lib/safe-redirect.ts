export const DEFAULT_REDIRECT = "/";

/**
 * Ishonchsiz `redirect` qiymatini biz yuborishga rozi bo'lgan yo'lga
 * aylantiradi. Saytdan olib chiqishi mumkin bo'lgani zaxira yo'lga almashadi.
 */
export function safeRedirect(
  value: unknown,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (typeof value !== "string" || value === "") return fallback;

  // Boshqaruv belgilari quyidagi tekshiruvlardan sxemani yashirib o'tkazadi.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  // Shu saytdagi yo'l bo'lishi shart; "//host" va "/\host" yo'l emas.
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
