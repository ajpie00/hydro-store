import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {useSearchParams} from 'react-router';

export async function loader({context, request, params}) {
  const {storefront} = context;
  const {locale} = params;
  const normalizedLocale = locale?.toUpperCase() || 'EN';

  const localeMap = {
    EN: {country: 'US', language: 'EN'},
    TR: {country: 'TR', language: 'TR'},
    DE: {country: 'DE', language: 'DE'},
  };

  const {country, language} = localeMap[normalizedLocale] || localeMap.EN;

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {
      ...paginationVariables,
    },
    context: {
      country,
      language,
    },
  });

  return {products};
}

export default function CollectionAll() {
  const {products} = useLoaderData();
  const [searchParams] = useSearchParams();

  const min = Number(searchParams.get('min'));
  const max = Number(searchParams.get('max'));
  const inStock = searchParams.get('inStock') === 'true';

  const filtered = products.nodes.filter((product) => {
    const price = Number(product.priceRange?.minVariantPrice?.amount);
    const inventory = product.totalInventory ?? 0;

    if (min && price < min) return false;
    if (max && price > max) return false;
    if (inStock && inventory <= 0) return false;

    return true;
  });

  return (
    <div className="collection">
      {/* 🌍 Locale Seçici */}
      <form style={{marginBottom: '1rem'}}>
        <label htmlFor="locale">Dil:</label>
        <select
          id="locale"
          defaultValue={searchParams.get('locale') || 'en'}
          onChange={(e) => {
            const newLocale = e.target.value;
            const url = new URL(window.location.href);
            url.pathname = `/${newLocale}/collections/all`;
            window.location.href = url.toString();
          }}
        >
          <option value="en">English (USD)</option>
          <option value="tr">Türkçe (TRY)</option>
          <option value="de">Deutsch (EUR)</option>
        </select>
      </form>

      <h1>Ürünler</h1>

      {/* 🔍 Filtreleme */}
      <form method="GET" style={{marginBottom: '2rem'}}>
        <input type="hidden" name="locale" value={searchParams.get('locale') || 'en'} />
        <label>
          Min Fiyat:
          <input type="number" name="min" defaultValue={min || ''} />
        </label>
        <label>
          Max Fiyat:
          <input type="number" name="max" defaultValue={max || ''} />
        </label>
        <label style={{marginLeft: '1rem'}}>
          <input
            type="checkbox"
            name="inStock"
            value="true"
            defaultChecked={inStock}
          />
          {' '}Sadece stoktakiler
        </label>
        <button type="submit" style={{marginLeft: '1rem'}}>Filtrele</button>
      </form>

      <PaginatedResourceSection
        connection={{nodes: filtered, pageInfo: products.pageInfo}}
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

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    totalInventory
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
`;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;
