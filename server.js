import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from './app/lib/context.js';
import {storefrontRedirect} from '@shopify/hydrogen';

const handleHydrogenRequest = async (request, env, executionContext) => {
  const context = await createAppLoadContext(request, env, executionContext);

  const handleRequest = createRequestHandler({
    build: await import('virtual:react-router/server-build'),
    mode: process.env.NODE_ENV,
    getLoadContext: () => context,
  });

  const response = await handleRequest(request);

  if (context.session?.isPending) {
    response.headers.set('Set-Cookie', await context.session.commit());
  }

  if (response.status === 404) {
    return storefrontRedirect({
      request,
      response,
      storefront: context.storefront,
    });
  }

  return response;
};

// ✅ Vercel export (classic Node.js)
export default async function handler(req, res) {
  const request = new Request(`https://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
  });

  const response = await handleHydrogenRequest(request, process.env, {
    waitUntil: () => {},
  });

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = await response.text();
  res.end(body);
}

// ✅ Local export (MiniOxygen expects this)
export const fetch = (request, env, ctx) => {
  return handleHydrogenRequest(request, env, ctx);
};
