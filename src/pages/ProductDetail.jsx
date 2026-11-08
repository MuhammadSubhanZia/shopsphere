import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductImage from '../components/common/ProductImage.jsx';
import Rating from '../components/common/Rating.jsx';
import QuantityStepper from '../components/common/QuantityStepper.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectAllProducts, selectProductsStatus, selectProductById } from '../store/slices/productsSlice.js';
import { selectCategoryBySlug } from '../store/slices/categoriesSlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { formatPrice, discountPercent } from '../utils/formatters.js';
import './ProductDetail.css';

const TABS = [
  { key: 'description', label: 'Description' },
  { key: 'specs', label: 'Specifications' },
  { key: 'delivery', label: 'Delivery & returns' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const product = useSelector(selectProductById(id));
  const category = useSelector(selectCategoryBySlug(product?.category));
  const wished = useSelector(selectIsWishlisted(Number(id)));
  const inCart = useSelector((state) => state.cart.items.find((item) => item.id === Number(id))?.quantity || 0);

  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');

  useDocumentTitle(product ? product.name : 'Product');

  // Start fresh when the shopper jumps to another product (e.g. from "Related products").
  useEffect(() => {
    setQuantity(1);
    setTab('description');
  }, [id]);

  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [products, product]
  );

  // ----- Loading / not found states -----
  if (status !== 'succeeded' && status !== 'failed') return <Spinner label="Loading product..." />;

  if (!product) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-emoji-frown" title="Product not found" message="This product may have been removed or the link is incorrect.">
          <Link to="/products" className="btn btn-primary rounded-pill px-4">
            Back to shop
          </Link>
        </EmptyState>
      </div>
    );
  }

  const off = discountPercent(product.price, product.oldPrice);
  const soldOut = product.stock < 1;
  const remaining = product.stock - inCart; // how many more can still be added
  const canAdd = !soldOut && remaining > 0;
  const lowStock = !soldOut && product.stock <= 10;

  const handleAdd = () => {
    const amount = Math.min(quantity, remaining);
    dispatch(addToCart({ product, quantity: amount }));
    dispatch(showToast(`${amount} × ${product.name} added to cart`));
    setQuantity(1);
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product.id));
    dispatch(showToast(wished ? 'Removed from wishlist' : 'Saved to your wishlist', wished ? 'info' : 'success'));
  };

  return (
    <div className="container py-4 py-lg-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb ss-breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">Shop</Link>
          </li>
          {category && (
            <li className="breadcrumb-item">
              <Link to={`/products?category=${category.slug}`}>{category.name}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-4 g-lg-5">
        {/* Picture */}
        <div className="col-lg-6">
          <div className="ss-detail__media">
            <ProductImage product={product} size="lg" />
            <div className="ss-detail__badges">
              {soldOut && <span className="ss-badge ss-badge--out">Sold out</span>}
              {off > 0 && !soldOut && <span className="ss-badge ss-badge--sale">-{off}% OFF</span>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="col-lg-6">
          <span className="ss-detail__brand">{product.brand}</span>
          <h1 className="ss-detail__title">{product.name}</h1>
          <Rating value={product.rating} count={product.reviews} size="lg" />

          <div className="ss-detail__price">
            <span className="ss-detail__price-now">{formatPrice(product.price)}</span>
            {off > 0 && (
              <>
                <span className="ss-price-old">{formatPrice(product.oldPrice)}</span>
                <span className="ss-detail__save">You save {formatPrice(product.oldPrice - product.price)}</span>
              </>
            )}
          </div>

          <p className="ss-detail__summary">{product.description}</p>

          <p className={`ss-detail__stock ${soldOut ? 'is-out' : lowStock ? 'is-low' : 'is-in'}`}>
            <i className={`bi ${soldOut ? 'bi-x-circle-fill' : 'bi-check-circle-fill'}`} />
            {soldOut ? 'Out of stock' : lowStock ? `Hurry! Only ${product.stock} left in stock` : `In stock (${product.stock} available)`}
          </p>

          <div className="ss-detail__actions">
            {canAdd && (
              <QuantityStepper value={Math.min(quantity, remaining)} onChange={setQuantity} max={remaining} />
            )}
            <button type="button" className="btn btn-primary btn-lg rounded-pill px-4 flex-grow-1" disabled={!canAdd} onClick={handleAdd}>
              <i className="bi bi-bag-plus me-2" />
              {soldOut ? 'Out of stock' : canAdd ? 'Add to cart' : 'Maximum quantity in cart'}
            </button>
            <button
              type="button"
              className={`ss-detail__wish ${wished ? 'is-active' : ''}`}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleWishlist}
            >
              <i className={`bi ${wished ? 'bi-heart-fill' : 'bi-heart'}`} />
            </button>
          </div>

          {inCart > 0 && (
            <p className="ss-detail__incart">
              <i className="bi bi-bag-check me-2" />
              You have {inCart} in your cart.{' '}
              <Link to="/cart" className="fw-bold">
                View cart
              </Link>
            </p>
          )}

          <ul className="ss-detail__perks">
            <li>
              <i className="bi bi-truck" /> Free delivery over Rs. 5,000
            </li>
            <li>
              <i className="bi bi-arrow-repeat" /> 7-day easy returns
            </li>
            <li>
              <i className="bi bi-cash-coin" /> Cash on delivery available
            </li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <section className="ss-detail__tabs">
        <ul className="nav nav-tabs" role="tablist">
          {TABS.map((item) => (
            <li className="nav-item" role="presentation" key={item.key}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === item.key}
                className={`nav-link ${tab === item.key ? 'active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="ss-detail__tab-body" role="tabpanel">
          {tab === 'description' && (
            <>
              <p>{product.description}</p>
              <h2 className="h6 mt-4">Key features</h2>
              <ul className="ss-detail__features">
                {product.features.map((feature) => (
                  <li key={feature}>
                    <i className="bi bi-check2-circle" /> {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === 'specs' && (
            <table className="table ss-detail__specs">
              <tbody>
                <tr>
                  <th scope="row">Brand</th>
                  <td>{product.brand}</td>
                </tr>
                <tr>
                  <th scope="row">Category</th>
                  <td>{category?.name || product.category}</td>
                </tr>
                <tr>
                  <th scope="row">Product code</th>
                  <td>SS-{String(product.id).padStart(4, '0')}</td>
                </tr>
                <tr>
                  <th scope="row">Customer rating</th>
                  <td>
                    {product.rating.toFixed(1)} / 5 from {product.reviews.toLocaleString('en-US')} reviews
                  </td>
                </tr>
                <tr>
                  <th scope="row">Availability</th>
                  <td>{soldOut ? 'Out of stock' : `${product.stock} in stock`}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === 'delivery' && (
            <ul className="ss-detail__features">
              <li>
                <i className="bi bi-truck" /> Standard delivery in 2–4 working days to all major cities.
              </li>
              <li>
                <i className="bi bi-gift" /> Orders over Rs. 5,000 ship free, otherwise a flat Rs. 250 applies.
              </li>
              <li>
                <i className="bi bi-arrow-repeat" /> Return unused items within 7 days of delivery for a full refund.
              </li>
              <li>
                <i className="bi bi-cash-coin" /> Pay by card or cash on delivery.
              </li>
            </ul>
          )}
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-5 pt-3">
          <h2 className="h3 mb-4">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
