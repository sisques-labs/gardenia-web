const PROTECTED_FILE_PATHNAME = /^\/(api\/)?files\/[^/]+\/content$/;

function isProtectedFileUrl(url: string): boolean {
  try {
    return PROTECTED_FILE_PATHNAME.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

export function getAuthenticatedImageUrl(
  url: string | undefined,
  accessToken: string | null,
  spaceId: string | null,
): string | undefined {
  if (!url) return undefined;
  if (!isProtectedFileUrl(url)) return url;

  const params = new URLSearchParams({ url });
  if (accessToken) params.set('token', accessToken);
  if (spaceId) params.set('spaceId', spaceId);
  return `/api/image-proxy?${params.toString()}`;
}
