import './ProductImage.css';

/**
 * Placeholder product picture: a coloured tile with the product's icon.
 * The colour comes from `product.tint` (a hue), so every product looks a little different
 * without needing image files. Replace this component with an <img> once real photos exist.
 *
 * size: 'sm' (thumbnail) | 'md' (card, fills its container) | 'lg' (detail page)
 */
export default function ProductImage({ product, size = 'md', className = '' }) {
  return (
    <div
      className={`ss-product-image ss-product-image--${size} ${className}`.trim()}
      style={{ '--tint': product.tint ?? 20 }}
      role="img"
      aria-label={product.name}
    >
      <i className={`bi ${product.icon || 'bi-box-seam'}`} aria-hidden="true" />
    </div>
  );
}
