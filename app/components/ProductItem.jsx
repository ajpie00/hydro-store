import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {useWishlist} from '~/hooks/useWishlist';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  const {toggle, isInWishlist, hydrated} = useWishlist();
  if (!hydrated) return null;
  const isFavorite = isInWishlist(product.id);

  return (
    <div className="product-item">
      <Link prefetch="intent" to={variantUrl}>
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
        <h4>{product.title}</h4>
        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>
      </Link>

      <button
        onClick={() => toggle(product)}
        style={{
          marginTop: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
        }}
        aria-label={isFavorite ? 'Favoriden kaldır' : 'Favorilere ekle'}
      >
        {isFavorite ? '♥ Kaldır' : '♡ Favori'}
      </button>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
