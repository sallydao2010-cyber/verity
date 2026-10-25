// Normalize Vietnamese text for accent-insensitive search
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

export function matchesQuery(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return normalize(haystack).includes(normalize(needle.trim()));
}
