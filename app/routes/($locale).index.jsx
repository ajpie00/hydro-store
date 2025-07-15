import {Await, useLoaderData, Link} from 'react-router';
import {Suspense, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/** @param {LoaderFunctionArgs} */
export async function loader({params, context}) {
  console.log('✅ LOADER: ($locale).index.jsx loader çalıştı');

  const locale = params?.locale?.toUpperCase() || 'EN';

  const localeMap = {
    EN: {country: 'US', language: 'EN'},
    TR: {country: 'TR', language: 'TR'},
    DE: {country: 'DE', language: 'DE'},
  };

  const {country, language} = localeMap[locale] || localeMap.EN;

  const deferredData = loadDeferredData(context, {country, language});
  const criticalData = await loadCriticalData(context, {country, language});

  return {...deferredData, ...criticalData};
}

async function loadCriticalData(context, {country, language}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY, {
      variables: {country, language},
    }),
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData(context, {country, language}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {country, language},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

function Homepage() {
  const data = useLoaderData();

  // Bu sadece client tarafında log gösterir
  useEffect(() => {
    console.log('✅ RENDER: ($locale).index.jsx component çalıştı');
  }, []);

  return (
    <div className="home">
      <h2 style={{color: 'green'}}>✅ Bu sayfa render edildi</h2>
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

export default Homepage;

function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link className="featured-collection" to={`/collections/${collection.handle}`}>
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;
