import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {useSearchParams} from 'react-router'; // 👈 filtre için eklendi

export async function loader({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {...paginationVariables},
  });

  return {products};
}

export default function CollectionPage() {
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
    <div>
      <h1>Ürünler</h1>

      {/* 🔍 Filtre Arayüzü */}
      <form method="GET" style={{marginBottom: '2rem'}}>
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
