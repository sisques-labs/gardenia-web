import { describe, expect, it } from 'vitest';
import { getAuthenticatedImageUrl } from './get-authenticated-image-url.util';

describe('getAuthenticatedImageUrl', () => {
  it('returns undefined when there is no url', () => {
    expect(getAuthenticatedImageUrl(undefined, 'token-123', 'space-1')).toBeUndefined();
  });

  it('routes a protected /api/files/*/content url through the image proxy with token and space', () => {
    const result = getAuthenticatedImageUrl(
      'http://localhost:3000/api/files/abc-123/content',
      'token-123',
      'space-1',
    );

    expect(result).toBe(
      '/api/image-proxy?url=' +
        encodeURIComponent('http://localhost:3000/api/files/abc-123/content') +
        '&token=token-123&spaceId=space-1',
    );
  });

  it('routes a protected /files/*/content url (no /api prefix) through the image proxy', () => {
    const result = getAuthenticatedImageUrl(
      'http://localhost:3000/files/abc-123/content',
      'token-123',
      'space-1',
    );

    expect(result).toBe(
      '/api/image-proxy?url=' +
        encodeURIComponent('http://localhost:3000/files/abc-123/content') +
        '&token=token-123&spaceId=space-1',
    );
  });

  it('omits the token param when there is no access token', () => {
    const result = getAuthenticatedImageUrl(
      'http://localhost:3000/api/files/abc-123/content',
      null,
      'space-1',
    );

    expect(result).toBe(
      '/api/image-proxy?url=' +
        encodeURIComponent('http://localhost:3000/api/files/abc-123/content') +
        '&spaceId=space-1',
    );
  });

  it('omits the spaceId param when there is no current space', () => {
    const result = getAuthenticatedImageUrl(
      'http://localhost:3000/api/files/abc-123/content',
      'token-123',
      null,
    );

    expect(result).toBe(
      '/api/image-proxy?url=' +
        encodeURIComponent('http://localhost:3000/api/files/abc-123/content') +
        '&token=token-123',
    );
  });

  it('passes through a non-protected url unchanged', () => {
    const result = getAuthenticatedImageUrl(
      'https://cdn.example.com/plants/photo.jpg',
      'token-123',
      'space-1',
    );

    expect(result).toBe('https://cdn.example.com/plants/photo.jpg');
  });

  it('passes through an unparsable url unchanged', () => {
    const result = getAuthenticatedImageUrl('not-a-url', 'token-123', 'space-1');

    expect(result).toBe('not-a-url');
  });
});
