// Submit canonical URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep and others; not Google).
// Run by hand after a deploy, from the repo root:
//   npm run build && node scripts/indexnow.mjs     every <loc> in dist/sitemap-0.xml
//   node scripts/indexnow.mjs /srt-to-vtt /vtt-to-srt   only these URLs (paths or full URLs)
//   node scripts/indexnow.mjs --dry-run            print the request, send nothing
// The key is the one public/<32 hex>.txt file. IndexNow keys are public by design.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const HOST = 'subtitlefixer.com';
export const ORIGIN = `https://${HOST}`;
export const ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_FILE = /^([0-9a-f]{32})\.txt$/;

/**
 * The IndexNow key: the name of the single public/<32 hex>.txt file, whose content must be exactly the key.
 * @param {string} publicDir
 * @returns {string}
 */
export function findKey(publicDir) {
  const keys = readdirSync(publicDir)
    .map((name) => KEY_FILE.exec(name)?.[1])
    .filter((key) => key !== undefined);
  if (keys.length !== 1) {
    throw new Error(`Expected exactly one IndexNow key file (32 lowercase hex + .txt) in ${publicDir}, found ${keys.length}.`);
  }
  const key = keys[0];
  const content = readFileSync(join(publicDir, `${key}.txt`), 'utf8');
  if (content !== key) throw new Error(`${key}.txt must contain exactly the key, with no newline.`);
  return key;
}

/**
 * Every <loc> in a sitemap.
 * @param {string} xml
 * @returns {string[]}
 */
export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

/**
 * Absolute canonical URL on our host. Throws for another host, a trailing slash, .html, a query or a hash.
 * @param {string} input
 * @returns {string}
 */
export function normalizeUrl(input) {
  const url = new URL(input, ORIGIN);
  if (url.origin !== ORIGIN) throw new Error(`Not a ${HOST} URL: ${input}`);
  if (url.pathname !== '/' && (url.pathname.endsWith('/') || url.pathname.endsWith('.html'))) {
    throw new Error(`Not a canonical URL (trailing slash or .html): ${input}`);
  }
  if (url.search || url.hash) throw new Error(`Not a canonical URL (query or hash): ${input}`);
  return url.href;
}

/**
 * @param {string} key
 * @param {string[]} urls
 * @returns {{ host: string, key: string, keyLocation: string, urlList: string[] }}
 */
export function buildPayload(key, urls) {
  return {
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList: [...new Set(urls.map(normalizeUrl))],
  };
}

/** @typedef {(url: string, init: RequestInit) => Promise<Response>} Fetcher */

/**
 * POST the payload. 200 and 202 mean "received", not "indexed".
 * @param {ReturnType<typeof buildPayload>} payload
 * @param {Fetcher} [fetchImpl]
 * @returns {Promise<{ status: number, ok: boolean, body: string }>}
 */
export async function submit(payload, fetchImpl = fetch) {
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  return { status: response.status, ok: response.status === 200 || response.status === 202, body };
}

/**
 * True when the live key file answers 200, without a redirect, with exactly the key.
 * @param {string} key
 * @param {Fetcher} [fetchImpl]
 * @returns {Promise<boolean>}
 */
export async function keyFileIsLive(key, fetchImpl = fetch) {
  const response = await fetchImpl(`${ORIGIN}/${key}.txt`, { redirect: 'manual' });
  return response.status === 200 && (await response.text()) === key;
}

/** @type {Record<number, string>} */
const HINTS = {
  400: 'bad request (invalid format)',
  403: 'key not valid (key file missing or content differs)',
  422: 'URLs do not belong to the host, or the key does not match',
  429: 'too many requests; try again later',
};

/**
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
async function main(argv) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const dryRun = argv.includes('--dry-run');
  const args = argv.filter((arg) => arg !== '--dry-run');
  const key = findKey(join(root, 'public'));
  let urls = args;
  if (urls.length === 0) {
    let xml;
    try {
      xml = readFileSync(join(root, 'dist', 'sitemap-0.xml'), 'utf8');
    } catch {
      throw new Error('dist/sitemap-0.xml not found. Run npm run build first, or pass the URLs as arguments.');
    }
    urls = sitemapUrls(xml);
  }
  if (urls.length === 0) throw new Error('No URLs to submit.');
  const payload = buildPayload(key, urls);
  if (dryRun) {
    console.log(`POST ${ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return 0;
  }
  if (!(await keyFileIsLive(key))) {
    console.error(`${payload.keyLocation} does not answer 200 with the key. Deploy the key file first.`);
    return 1;
  }
  const result = await submit(payload);
  console.log(`IndexNow answered ${result.status} for ${payload.urlList.length} URL(s)${result.body ? `: ${result.body}` : ''}`);
  if (!result.ok) console.error(`Not accepted: ${HINTS[result.status] ?? 'unexpected status'}.`);
  return result.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    },
  );
}
