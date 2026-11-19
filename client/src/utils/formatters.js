// Small, pure helper functions used all over the UI.

/** 12500 -> "Rs. 12,500" */
export const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString('en-US')}`;

/** Percentage saved when `price` is lower than `oldPrice` (0 if there is no discount). */
export const discountPercent = (price, oldPrice) =>
  oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

/** "2026-11-05T10:30:00Z" -> "5 Nov 2026" */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** "2026-11-05T10:30:00Z" -> "5 Nov 2026, 3:30 pm" */
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

/** "Home & Living" -> "home-living" */
export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** pluralize(3, 'item') -> "3 items" */
export const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** "Ayesha Khan" -> "AK" */
export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
