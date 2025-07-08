import {useLoaderData} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';

export async function loader({context, request, params}) {
  const {storefront} = context;

  const locale = params.locale?.toUpperCase() || 'EN';

  const localeMap = {
    EN: {country: 'US', language: 'EN'},
    TR: {country: 'TR', language: 'TR'},
    DE: {country: 'DE', language: 'DE'},
  };

  const {country, language} = localeMap[locale] || localeMap.EN;

  const paginationVariables = getPaginationVariables(request, {pageBy: 8});

  const {products} = await storefront.query(COLLECTIONS_ALL_QUERY, {
    variables: {
      ...paginationVariables,
    },
    context: {country, language},
  });

  return {products};
}

export default function LocaleCollectionsAll() {
  const {products} = useLoaderData();

  return (
    <div className="collection">
      <h1>All Products</h1>
      <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment ProductItemFields on Product {
    id
    handle
    title
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const COLLECTIONS_ALL_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query LocaleAllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...ProductItemFields
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
