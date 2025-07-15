import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from './app/lib/context.js';
import {storefrontRedirect} from '@shopify/hydrogen';

export default {
  async fetch(request, env, executionContext) {
    try {
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
    } catch (error) {
      console.error('❌ Server error:', error);
      return new Response('Internal Server Error', {status: 500});
    }
  },
};
