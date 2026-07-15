const PROTECTED_FILE_PATHNAME = /^\/(api\/)?files\/([^/]+)\/content$/;

function extractProtectedFileId(url: string): string | undefined {
  try {
    return new URL(url).pathname.match(PROTECTED_FILE_PATHNAME)?.[2];
  } catch {
    return undefined;
  }
}

export function getAuthenticatedImageUrl(
  url: string | undefined,
  accessToken: string | null,
  spaceId: string | null,
): string | undefined {
  if (!url) return undefined;

  const fileId = extractProtectedFileId(url);
  if (!fileId) return url;

  const params = new URLSearchParams();
  if (accessToken) params.set('token', accessToken);
  if (spaceId) params.set('spaceId', spaceId);
  const query = params.toString();
  return `/api/image-proxy/${fileId}${query ? `?${query}` : ''}`;
}
