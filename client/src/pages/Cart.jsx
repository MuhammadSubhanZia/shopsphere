import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import CartItemRow from '../components/cart/CartItemRow.jsx';
import OrderSummary from '../components/cart/OrderSummary.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import {
  selectCartItems,
  selectCartTotals,
  selectPromoCode,
  setQuantity,
  removeFromCart,
  applyPromo,
  removePromo,
  clearCart,
} from '../store/slices/cartSlice.js';
import { selectWishlistIds, toggleWishlist } from '../store/slices/wishlistSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { pluralize } from '../utils/formatters.js';
import { PROMO_CODES } from '../utils/pricing.js';

export default function Cart() {
  useDocumentTitle('Shopping cart');
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const promoCode = useSelector(selectPromoCode);
  const wishlistIds = useSelector(selectWishlistIds);

  const handleQuantity = (item, quantity) => dispatch(setQuantity({ id: item.id, quantity }));

  const handleRemove = (item) => {
    dispatch(removeFromCart(item.id));
    dispatch(showToast(`${item.name} removed from cart`, 'info'));
  };

  // Moves an item from the cart to the wishlist.
  const handleSaveForLater = (item) => {
    if (!wishlistIds.includes(item.id)) dispatch(toggleWishlist(item.id));
    dispatch(removeFromCart(item.id));
    dispatch(showToast('Saved to your wishlist'));
  };

  const handleApplyPromo = (code) => {
    dispatch(applyPromo(code));
    dispatch(showToast(`Promo applied: ${PROMO_CODES[code].label}`));
  };

  const handleClear = () => {
    dispatch(clearCart());
    dispatch(showToast('Your cart is now empty', 'info'));
  };

  return (
    <>
      <PageHeader
        title="Shopping cart"
        subtitle={items.length ? `You have ${pluralize(totals.itemCount, 'item')} in your cart.` : 'Review the items you are about to buy.'}
      />

      <div className="container py-4 py-lg-5">
        {items.length === 0 ? (
          <EmptyState icon="bi-bag" title="Your cart is empty" message="Looks like you have not added anything yet. Explore our catalogue and find something you love.">
            <Link to="/products" className="btn btn-primary rounded-pill px-4">
              Start shopping
            </Link>
          </EmptyState>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ss-card">
                <ul className="list-unstyled m-0">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantity}
                      onRemove={handleRemove}
                      onSaveForLater={handleSaveForLater}
                    />
                  ))}
                </ul>
              </div>

              <div className="d-flex flex-wrap justify-content-between gap-2 mt-3">
                <Link to="/products" className="btn btn-outline-dark rounded-pill">
                  <i className="bi bi-arrow-left me-2" />
                  Continue shopping
                </Link>
                <button type="button" className="btn btn-link text-danger fw-bold text-decoration-none" onClick={handleClear}>
                  <i className="bi bi-trash3 me-2" />
                  Clear cart
                </button>
              </div>
            </div>

            <div className="col-lg-4">
              <OrderSummary
                totals={totals}
                promoCode={promoCode}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={() => dispatch(removePromo())}
              >
                <Link to="/checkout" className="btn btn-primary btn-lg rounded-pill">
                  Proceed to checkout <i className="bi bi-arrow-right ms-2" />
                </Link>
                <small className="text-center ss-muted">
                  <i className="bi bi-lock-fill me-1" />
                  Secure checkout. Pay by card or cash on delivery.
                </small>
              </OrderSummary>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
