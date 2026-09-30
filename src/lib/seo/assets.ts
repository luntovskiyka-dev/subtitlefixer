import { redirectLocation } from './urls';

export type AssetFetcher = {
  fetch(request: Request): Promise<Response>;
};

/** 301 non-canonical HTML paths, then serve the static asset. */
export async function handleAssetRequest(request: Request, assets: AssetFetcher): Promise<Response> {
  const location = redirectLocation(new URL(request.url));
  if (location) {
    return new Response(null, {
      status: 301,
      headers: { Location: location },
    });
  }
  return assets.fetch(request);
}
