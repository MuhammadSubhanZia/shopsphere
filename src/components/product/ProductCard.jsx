import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductImage from '../common/ProductImage.jsx';
import Rating from '../common/Rating.jsx';
import { formatPrice, discountPercent } from '../../utils/formatters.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import './ProductCard.css';

const LOW_STOCK_LIMIT = 10;
const NEW_FOR_DAYS = 30;

const isNew = (createdAt) => Date.now() - new Date(createdAt).getTime() < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;

/** One product tile used in every grid (home, shop, wishlist, related products). */
export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const wished = useSelector(selectIsWishlisted(product.id));
  const inCart = useSelector((state) => state.cart.items.find((item) => item.id === product.id)?.quantity || 0);

  const off = discountPercent(product.price, product.oldPrice);
  const soldOut = product.stock < 1;
  const lowStock = !soldOut && product.stock <= LOW_STOCK_LIMIT;

  const handleAdd = () => {
    if (inCart >= product.stock) {
      dispatch(showToast('You already have all available stock in your cart', 'warning'));
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(showToast(`${product.name} added to cart`));
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product.id));
    dispatch(showToast(wished ? 'Removed from wishlist' : 'Saved to your wishlist', wished ? 'info' : 'success'));
  };

  return (
    <article className="ss-product-card">
      <div className="ss-product-card__media">
        <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
          <ProductImage product={product} />
        </Link>

        <div className="ss-product-card__badges">
          {soldOut && <span className="ss-badge ss-badge--out">Sold out</span>}
          {!soldOut && off > 0 && <span className="ss-badge ss-badge--sale">-{off}%</span>}
          {!soldOut && off === 0 && isNew(product.createdAt) && <span className="ss-badge ss-badge--new">New</span>}
        </div>

        <button
          type="button"
          className={`ss-product-card__wish ${wished ? 'is-active' : ''}`}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          onClick={handleWishlist}
        >
          <i className={`bi ${wished ? 'bi-heart-fill' : 'bi-heart'}`} />
        </button>
      </div>

      <div className="ss-product-card__body">
        <span className="ss-product-card__brand">{product.brand}</span>
        <h3 className="ss-product-card__title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <Rating value={product.rating} count={product.reviews} />

        <div className="ss-product-card__price">
          <span className="ss-price">{formatPrice(product.price)}</span>
          {off > 0 && <span className="ss-price-old">{formatPrice(product.oldPrice)}</span>}
        </div>

        {lowStock && <span className="ss-product-card__low">Only {product.stock} left</span>}

        <button type="button" className="btn btn-dark btn-sm rounded-pill mt-2" disabled={soldOut} onClick={handleAdd}>
          <i className="bi bi-bag-plus me-2" />
          {soldOut ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
