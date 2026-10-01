import { canonicalPathname, redirectLocation } from './urls';

export type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

const NOT_FOUND_PATH = '/404';

/** 301 non-canonical HTML paths, then serve the static asset. The 404 page itself answers 404. */
export async function handleAssetRequest(request: Request, assets: AssetFetcher): Promise<Response> {
  const url = new URL(request.url);
  const location = redirectLocation(url);
  if (location) {
    return new Response(null, {
      status: 301,
      headers: { Location: location },
    });
  }
  const response = await assets.fetch(request);
  if (canonicalPathname(url.pathname) === NOT_FOUND_PATH && response.status === 200) {
    return new Response(response.body, {
      status: 404,
      statusText: 'Not Found',
      headers: response.headers,
    });
  }
  return response;
}
