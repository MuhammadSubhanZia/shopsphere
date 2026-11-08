import { useState } from 'react';
import { formatPrice } from '../../utils/formatters.js';
import { FREE_SHIPPING_THRESHOLD, PROMO_CODES, isValidPromo, normalizePromo } from '../../utils/pricing.js';
import './OrderSummary.css';

/**
 * Price breakdown used on the cart and checkout pages.
 *  - totals:       result of calculateTotals()
 *  - promoCode:    the applied code (or null)
 *  - onApplyPromo / onRemovePromo: when given, a promo-code box is shown
 *  - children:     buttons rendered at the bottom (checkout, place order...)
 */
export default function OrderSummary({ title = 'Order summary', totals, promoCode, onApplyPromo, onRemovePromo, children }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const applyCode = (event) => {
    event.preventDefault();
    const normalized = normalizePromo(code);
    if (!normalized) return setError('Enter a promo code');
    if (!isValidPromo(normalized)) return setError('This promo code is not valid');
    setError('');
    setCode('');
    onApplyPromo(normalized);
  };

  const freeDelivery = totals.amountToFreeShipping <= 0 || promoCode === 'FREESHIP';
  const progress = freeDelivery
    ? 100
    : Math.round(((FREE_SHIPPING_THRESHOLD - totals.amountToFreeShipping) / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="ss-summary">
      <h2 className="ss-summary__title">{title}</h2>

      {totals.subtotal > 0 && (
        <div className="ss-summary__shipping">
          {!freeDelivery ? (
            <p>
              Add <strong>{formatPrice(totals.amountToFreeShipping)}</strong> more for free delivery
            </p>
          ) : (
            <p className="is-unlocked">
              <i className="bi bi-check-circle-fill" /> You have free delivery!
            </p>
          )}
          <div className="progress" role="progressbar" aria-label="Progress to free delivery" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <dl className="ss-summary__rows">
        <div>
          <dt>Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="is-discount">
            <dt>Discount ({promoCode})</dt>
            <dd>-{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>{totals.shippingFee === 0 ? 'Free' : formatPrice(totals.shippingFee)}</dd>
        </div>
        <div className="is-total">
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {onApplyPromo &&
        (promoCode ? (
          <div className="ss-summary__promo-applied">
            <span>
              <i className="bi bi-ticket-perforated me-2" />
              <strong>{promoCode}</strong> – {PROMO_CODES[promoCode]?.label}
            </span>
            <button type="button" onClick={onRemovePromo} aria-label="Remove promo code">
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ) : (
          <form className="ss-summary__promo" onSubmit={applyCode}>
            <label htmlFor="promo-code" className="form-label">
              Have a promo code?
            </label>
            <div className="d-flex gap-2">
              <input
                id="promo-code"
                className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
                placeholder="e.g. SAVE10"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
              <button type="submit" className="btn btn-dark btn-sm px-3">
                Apply
              </button>
            </div>
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </form>
        ))}

      {children && <div className="ss-summary__actions">{children}</div>}
    </div>
  );
}
