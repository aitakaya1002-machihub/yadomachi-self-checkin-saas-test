export function normalizeSupabaseUrl(url: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.origin;
}
