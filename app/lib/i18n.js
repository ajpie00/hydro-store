/**
 * Locale algılama fonksiyonu
 * /en/collections/all → {language: 'EN', country: 'US'}
 * /tr/collections/all → {language: 'TR', country: 'TR'}
 * /de/collections/all → {language: 'DE', country: 'DE'}
 * bilinmeyen locale → fallback: {language: 'EN', country: 'US'}
 *
 * @param {Request} request
 * @returns {{language: string, country: string, pathPrefix: string}}
 */
export function getLocaleFromRequest(request) {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  let pathPrefix = '';
  let [language, country] = ['EN', 'US'];

  const LOCALE_MAP = {
    EN: {language: 'EN', country: 'US'},
    TR: {language: 'TR', country: 'TR'},
    DE: {language: 'DE', country: 'DE'},
  };

  if (LOCALE_MAP[firstPathPart]) {
    pathPrefix = '/' + firstPathPart.toLowerCase();
    language = LOCALE_MAP[firstPathPart].language;
    country = LOCALE_MAP[firstPathPart].country;
  }

  return {language, country, pathPrefix};
}
