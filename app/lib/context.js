import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from './session.js';
import {CART_QUERY_FRAGMENT} from './fragments.js';
import {getLocaleFromRequest} from './i18n.js';

/**
 * The context implementation is separate from server.ts
 * so that type can be extracted for AppLoadContext
 * @param {Request} request
 * @param {Env} env
 * @param {ExecutionContext} executionContext
 */
export async function createAppLoadContext(request, env, executionContext) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext?.waitUntil?.bind(executionContext) || (() => {});
  const session = await AppSession.init(request, [env.SESSION_SECRET]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache: undefined, // Vercel ortamında caches API yok
    waitUntil,
    session,
    i18n: getLocaleFromRequest(request),
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return {
    ...hydrogenContext,
    // declare additional Remix loader context if needed
  };
}
