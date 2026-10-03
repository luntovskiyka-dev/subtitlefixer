import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ENDPOINT,
  buildPayload,
  findKey,
  keyFileIsLive,
  normalizeUrl,
  sitemapUrls,
  submit,
} from '../../../scripts/indexnow.mjs';
import { redirectLocation } from './urls';

const key = findKey(join(process.cwd(), 'public'));

describe('IndexNow key file', () => {
  it('is one public/<32 hex>.txt file that contains exactly the key', () => {
    expect(key).toMatch(/^[0-9a-f]{32}$/);
  });

  it('is served as is: the worker does not redirect it', () => {
    expect(redirectLocation(new URL(`https://subtitlefixer.com/${key}.txt`))).toBeNull();
    expect(redirectLocation(new URL('https://subtitlefixer.com/llms.txt'))).toBeNull();
  });
});

describe('IndexNow submission', () => {
  it('reads every <loc> from a sitemap', () => {
    const xml =
      '<urlset><url><loc>https://subtitlefixer.com/</loc></url><url><loc>https://subtitlefixer.com/srt-to-vtt</loc></url></urlset>';
    expect(sitemapUrls(xml)).toEqual(['https://subtitlefixer.com/', 'https://subtitlefixer.com/srt-to-vtt']);
  });

  it('builds the payload with host, key, keyLocation and deduplicated absolute URLs', () => {
    expect(buildPayload(key, ['/', '/srt-to-vtt', 'https://subtitlefixer.com/srt-to-vtt'])).toEqual({
      host: 'subtitlefixer.com',
      key,
      keyLocation: `https://subtitlefixer.com/${key}.txt`,
      urlList: ['https://subtitlefixer.com/', 'https://subtitlefixer.com/srt-to-vtt'],
    });
  });

  it('accepts only canonical URLs on our host', () => {
    expect(normalizeUrl('https://subtitlefixer.com')).toBe('https://subtitlefixer.com/');
    for (const bad of [
      'https://example.com/srt-to-vtt',
      '/srt-to-vtt/',
      '/srt-to-vtt.html',
      '/srt-to-vtt?x=1',
      'http://subtitlefixer.com/srt-to-vtt',
    ]) {
      expect(() => normalizeUrl(bad)).toThrow();
    }
  });

  it('POSTs JSON to api.indexnow.org and treats 200 and 202 as received', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const answer = (status: number) => async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(null, { status });
    };
    const payload = buildPayload(key, ['/']);
    expect(await submit(payload, answer(202))).toEqual({ status: 202, ok: true, body: '' });
    expect(calls[0].url).toBe(ENDPOINT);
    expect(ENDPOINT).toBe('https://api.indexnow.org/indexnow');
    expect(calls[0].init.method).toBe('POST');
    expect(calls[0].init.headers).toEqual({ 'content-type': 'application/json; charset=utf-8' });
    expect(JSON.parse(String(calls[0].init.body))).toEqual(payload);
    expect((await submit(payload, answer(200))).ok).toBe(true);
    expect((await submit(payload, answer(403))).ok).toBe(false);
  });

  it('checks the live key file without following redirects', async () => {
    const seen: RequestInit[] = [];
    const live = (status: number, body: string) => async (_url: string, init: RequestInit) => {
      seen.push(init);
      return new Response(body, { status });
    };
    expect(await keyFileIsLive(key, live(200, key))).toBe(true);
    expect(seen[0].redirect).toBe('manual');
    expect(await keyFileIsLive(key, live(200, `${key}\n`))).toBe(false);
    expect(await keyFileIsLive(key, live(404, 'missing'))).toBe(false);
  });
});
