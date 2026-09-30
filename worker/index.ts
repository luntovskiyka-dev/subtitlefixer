import { handleAssetRequest } from '../src/lib/seo/assets';

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleAssetRequest(request, env.ASSETS);
  },
};
