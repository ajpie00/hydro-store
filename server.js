import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from './app/lib/context.js';
import {storefrontRedirect} from '@shopify/hydrogen';

export default async function handler(req, res) {
  try {
    const context = await createAppLoadContext(req, process.env, {
      waitUntil: () => {}, // Vercel'de ExecutionContext yok
    });

    const handleRequest = createRequestHandler({
      build: await import('virtual:react-router/server-build'),
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
