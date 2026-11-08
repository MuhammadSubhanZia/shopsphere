import { discountPercent } from './formatters.js';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'discount', label: 'Biggest discount' },
];

/**
 * Filters the catalogue.
 * filters: { q, category, min, max, inStock } – every field is optional.
 */
export function filterProducts(products, { q = '', category = '', min = null, max = null, inStock = false } = {}) {
  const term = q.trim().toLowerCase();

  return products.filter((product) => {
    if (category && product.category !== category) return false;
    if (min !== null && product.price < min) return false;
    if (max !== null && product.price > max) return false;
    if (inStock && product.stock < 1) return false;
    if (term) {
      const haystack = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
      // Every word the shopper typed has to appear somewhere in the product text.
      return term.split(/\s+/).every((word) => haystack.includes(word));
    }
    return true;
  });
}

/** Returns a new, sorted array (the original is never mutated). */
export function sortProducts(products, sort = 'featured') {
  const list = [...products];

  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case 'newest':
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
    case 'discount':
      return list.sort(
        (a, b) => discountPercent(b.price, b.oldPrice) - discountPercent(a.price, a.oldPrice) || b.rating - a.rating
      );
    default:
      // "Featured": featured items first, then best rated.
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }
}
