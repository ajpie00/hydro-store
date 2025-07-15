import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from './app/lib/context.js';
import {storefrontRedirect} from '@shopify/hydrogen';
import * as build from '@react-router/dev/server-build';
import {Readable} from 'stream';

export default async function handler(req, res) {
  try {
    // 🔁 req'i Web standardında bir Request'e çeviriyoruz
    const body = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const webRequest = new Request(`https://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    });

    const context = await createAppLoadContext(webRequest, process.env, {
      waitUntil: () => {},
    });

    const handleRequest = createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
      getLoadContext: () => context,
    });

    const response = await handleRequest(webRequest);

    if (context.session?.isPending) {
      response.headers.set('Set-Cookie', await context.session.commit());
    }

    if (response.status === 404) {
      const redirected = await storefrontRedirect({
        request: webRequest,
        response,
        storefront: context.storefront,
      });
      res.writeHead(redirected.status, Object.fromEntries(redirected.headers));
      res.end(await redirected.text());
      return;
    }

    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch (err) {
    console.error('❌ Server error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
