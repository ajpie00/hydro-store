// Virtual entry point for the app
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from './app/lib/context.js';

/**
 * Vercel-compatible default export.
 * Handles all requests through the Hydrogen Remix server.
 */
export default async function handler(req, res) {
  try {
    // Vercel'de executionContext olmadığı için dummy obje veriyoruz
    const context = await createAppLoadContext(req, process.env, {
      waitUntil: () => {},
    });

    // Vite SSR build'i dinamik import ediyoruz
    const build = await import('virtual:react-router/server-build');

    const handleRequest = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
      getLoadContext: () => context,
    });

    const response = await handleRequest(req);

    if (context.session?.isPending) {
      response.headers.set('Set-Cookie', await context.session.commit());
    }

    if (response.status === 404) {
      const redirected = await storefrontRedirect({
        request: req,
        response,
        storefront: context.storefront,
      });
      res.statusCode = redirected.status;
      redirected.headers.forEach((value, key) => res.setHeader(key, value));
      const body = await redirected.text();
      return res.end(body);
    }

    // Normal response
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const body = await response.text();
    res.end(body);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
