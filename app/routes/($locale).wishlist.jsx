import {useWishlist} from '~/hooks/useWishlist';
import {ProductItem} from '~/components/ProductItem';

export default function WishlistPage() {
  const {wishlist} = useWishlist();

  return (
    <div className="wishlist">
      <h1>Favorilerim</h1>
      {wishlist.length === 0 ? (
        <p>Hiç favori ürün yok.</p>
      ) : (
        <div className="products-grid">
          {wishlist.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
