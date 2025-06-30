import {useEffect, useState} from 'react';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
    setHydrated(true); // ✅ Hydration tamamlandığında
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, hydrated]);

  function toggle(product) {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }

  function isInWishlist(productId) {
    return wishlist.some((p) => p.id === productId);
  }

  return {wishlist, toggle, isInWishlist, hydrated};
}
