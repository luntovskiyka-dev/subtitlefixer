import { describe, expect, it } from 'vitest';
import { handleAssetRequest, type AssetFetcher } from './assets';

function assets(status = 200, body = 'ok'): AssetFetcher & { requests: string[] } {
  const requests: string[] = [];
  return {
    requests,
    fetch(request) {
      requests.push(new URL(request.url).pathname + new URL(request.url).search);
      return Promise.resolve(new Response(body, { status }));
    },
  };
}

describe('handleAssetRequest', () => {
  it('serves a canonical path as the asset response', async () => {
    const binding = assets();
    const response = await handleAssetRequest(
      new Request('https://subtitlefixer.com/shift-subtitles'),
      binding,
    );
    expect(response.status).toBe(200);
    expect(binding.requests).toEqual(['/shift-subtitles']);
  });

  it('301s a trailing slash and a .html path to the canonical path, keeping the query', async () => {
    const slash = await handleAssetRequest(
      new Request('https://subtitlefixer.com/shift-subtitles/?x=1'),
      assets(),
    );
    expect(slash.status).toBe(301);
    expect(slash.headers.get('Location')).toBe('/shift-subtitles?x=1');

    const html = await handleAssetRequest(
      new Request('https://subtitlefixer.com/shift-subtitles.html?x=1'),
      assets(),
    );
    expect(html.status).toBe(301);
    expect(html.headers.get('Location')).toBe('/shift-subtitles?x=1');
  });

  it('leaves the root alone, including its query string', async () => {
    const binding = assets();
    const response = await handleAssetRequest(new Request('https://subtitlefixer.com/?x=1'), binding);
    expect(response.status).toBe(200);
    expect(binding.requests).toEqual(['/?x=1']);
  });

  it('passes a missing asset through so the host can answer 404', async () => {
    const binding = assets(404, 'missing');
    const response = await handleAssetRequest(new Request('https://subtitlefixer.com/missing'), binding);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('missing');
  });
});
