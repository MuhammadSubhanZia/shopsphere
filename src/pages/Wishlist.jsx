import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectAllProducts, selectProductsStatus } from '../store/slices/productsSlice.js';
import { selectWishlistIds, clearWishlist } from '../store/slices/wishlistSlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { pluralize } from '../utils/formatters.js';

export default function Wishlist() {
  useDocumentTitle('My wishlist');
  const dispatch = useDispatch();
  const ids = useSelector(selectWishlistIds);
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);

  // The wishlist stores ids only, so look the products up in the catalogue.
  const saved = useMemo(() => products.filter((p) => ids.includes(p.id)), [products, ids]);
  const available = saved.filter((p) => p.stock > 0);

  const handleAddAll = () => {
    available.forEach((product) => dispatch(addToCart({ product, quantity: 1 })));
    dispatch(showToast(`${pluralize(available.length, 'item')} added to your cart`));
  };

  const handleClear = () => {
    dispatch(clearWishlist());
    dispatch(showToast('Wishlist cleared', 'info'));
  };

  let content;
  if (status !== 'succeeded' && ids.length > 0) {
    content = <Spinner label="Loading your wishlist..." />;
  } else if (saved.length === 0) {
    content = (
      <EmptyState
        icon="bi-heart"
        title="Your wishlist is empty"
        message="Tap the heart on any product to save it here for later."
      >
        <Link to="/products" className="btn btn-primary rounded-pill px-4">
          Discover products
        </Link>
      </EmptyState>
    );
  } else {
    content = (
      <>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <p className="m-0 fw-bold">{pluralize(saved.length, 'saved item')}</p>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-dark rounded-pill btn-sm px-3" disabled={available.length === 0} onClick={handleAddAll}>
              <i className="bi bi-bag-plus me-2" />
              Add all to cart
            </button>
            <button type="button" className="btn btn-outline-dark rounded-pill btn-sm px-3" onClick={handleClear}>
              Clear wishlist
            </button>
          </div>
        </div>
        <ProductGrid products={saved} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="My wishlist" subtitle="Products you have saved for later." />
      <div className="container py-4 py-lg-5">{content}</div>
    </>
  );
}
