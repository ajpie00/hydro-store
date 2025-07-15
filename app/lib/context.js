import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from './session.js';
import {CART_QUERY_FRAGMENT} from './fragments.js';
import {getLocaleFromRequest} from './i18n.js';

export async function createAppLoadContext(request, env, executionContext) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil?.bind(executionContext) || (() => {});
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: getLocaleFromRequest(request),
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return hydrogenContext;
}
