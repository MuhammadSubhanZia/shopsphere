import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Spinner from '../components/common/Spinner.jsx';
import FormField from '../components/common/FormField.jsx';
import ProductImage from '../components/common/ProductImage.jsx';
import OrderSummary from '../components/cart/OrderSummary.jsx';
import useForm from '../hooks/useForm.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectUser } from '../store/slices/authSlice.js';
import { selectCartItems, selectCartTotals, selectPromoCode, clearCart } from '../store/slices/cartSlice.js';
import { placeOrder } from '../store/slices/ordersSlice.js';
import { fetchProducts } from '../store/slices/productsSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { validateShipping, validatePayment } from '../utils/validators.js';
import { getErrorMessage } from '../utils/errors.js';
import { formatPrice } from '../utils/formatters.js';
import { CITIES } from '../data/cities.js';
import './Checkout.css';

// Both forms are validated together.
const validateCheckout = (values) => ({ ...validateShipping(values), ...validatePayment(values) });

// Card input helpers: format while typing so the number is easy to read.
const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const PAYMENT_OPTIONS = [
  { value: 'cod', icon: 'bi-cash-coin', title: 'Cash on delivery', text: 'Pay when your order arrives' },
  { value: 'card', icon: 'bi-credit-card-2-front', title: 'Credit / debit card', text: 'Visa, Mastercard' },
];

export default function Checkout() {
  useDocumentTitle('Checkout');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const promoCode = useSelector(selectPromoCode);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false); // true once the order is saved and we are leaving the page
  const [serverError, setServerError] = useState('');

  // Pre-fill the delivery details from the customer's profile.
  const form = useForm(
    {
      fullName: user.name,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      postalCode: '',
      notes: '',
      method: 'cod',
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: '',
    },
    validateCheckout
  );

  // The cart is emptied right after the order is placed. This avoids a flash of the "cart is empty" screen.
  if (done) return <Spinner label="Order placed! Redirecting..." />;

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-bag" title="Your cart is empty" message="Add some products to your cart before checking out.">
          <Link to="/products" className="btn btn-primary rounded-pill px-4">
            Browse products
          </Link>
        </EmptyState>
      </div>
    );
  }

  const onSubmit = async (values) => {
    setServerError('');
    setPlacing(true);
    try {
      const order = await dispatch(
        placeOrder({
          userId: user.id,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          shipping: {
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            address: values.address.trim(),
            city: values.city,
            postalCode: values.postalCode.trim(),
            notes: values.notes.trim(),
          },
          paymentMethod: values.method,
          // Only the last 4 digits are kept. The full card number never leaves this form.
          cardLast4: values.method === 'card' ? values.cardNumber.replace(/\s/g, '').slice(-4) : null,
          promoCode,
        })
      ).unwrap();

      setDone(true);
      navigate(`/order-success/${order.id}`, { replace: true });
      dispatch(clearCart());
      dispatch(fetchProducts()); // stock levels changed
    } catch (error) {
      const message = getErrorMessage(error);
      setServerError(message);
      dispatch(showToast(message, 'error'));
      dispatch(fetchProducts()); // refresh stock (this also corrects the cart)
      setPlacing(false);
    }
  };

  const field = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errors[name],
  });

  const setFormatted = (name, formatter) => (event) => form.setValue(name, formatter(event.target.value));

  return (
    <>
      <PageHeader title="Checkout" subtitle="Just a few details and your order is on its way." />

      <div className="container py-4 py-lg-5">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="row g-4">
            <div className="col-lg-7 col-xl-8">
              {serverError && (
                <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert">
                  <span>
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {serverError}
                  </span>
                  <Link to="/cart" className="btn btn-sm btn-outline-danger">
                    Review cart
                  </Link>
                </div>
              )}

              {/* ---------- Delivery ---------- */}
              <section className="ss-card ss-checkout-block">
                <h2>
                  <span>1</span> Delivery details
                </h2>
                <div className="row">
                  <div className="col-md-6">
                    <FormField id="co-name" label="Full name" required autoComplete="name" {...field('fullName')} />
                  </div>
                  <div className="col-md-6">
                    <FormField
                      id="co-phone"
                      type="tel"
                      label="Mobile number"
                      required
                      placeholder="0300-1234567"
                      autoComplete="tel"
                      {...field('phone')}
                    />
                  </div>
                  <div className="col-12">
                    <FormField
                      id="co-address"
                      as="textarea"
                      label="Street address"
                      required
                      placeholder="House / flat number, street, area"
                      autoComplete="street-address"
                      {...field('address')}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormField id="co-city" as="select" label="City" required {...field('city')}>
                      <option value="">Select your city</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </FormField>
                  </div>
                  <div className="col-md-6">
                    <FormField
                      id="co-postal"
                      label="Postal code (optional)"
                      placeholder="54000"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      {...field('postalCode')}
                    />
                  </div>
                  <div className="col-12">
                    <FormField
                      id="co-notes"
                      as="textarea"
                      label="Delivery notes (optional)"
                      placeholder="Anything the courier should know?"
                      className="mb-0"
                      {...field('notes')}
                    />
                  </div>
                </div>
              </section>

              {/* ---------- Payment ---------- */}
              <section className="ss-card ss-checkout-block">
                <h2>
                  <span>2</span> Payment method
                </h2>

                <div className="ss-pay-options" role="radiogroup" aria-label="Payment method">
                  {PAYMENT_OPTIONS.map((option) => (
                    <label key={option.value} className={`ss-pay-option ${form.values.method === option.value ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="method"
                        value={option.value}
                        checked={form.values.method === option.value}
                        onChange={form.handleChange}
                      />
                      <i className={`bi ${option.icon}`} />
                      <span>
                        <strong>{option.title}</strong>
                        <small>{option.text}</small>
                      </span>
                    </label>
                  ))}
                </div>

                {form.values.method === 'card' && (
                  <div className="ss-card-form">
                    <div className="alert alert-light border small mb-3">
                      <i className="bi bi-info-circle me-2" />
                      Demo store: no real payment is taken and the card number is never saved. Try 4242 4242 4242 4242.
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <FormField
                          id="co-card"
                          label="Card number"
                          placeholder="1234 5678 9012 3456"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          name="cardNumber"
                          value={form.values.cardNumber}
                          onChange={setFormatted('cardNumber', formatCardNumber)}
                          onBlur={form.handleBlur}
                          error={form.errors.cardNumber}
                        />
                      </div>
                      <div className="col-12">
                        <FormField id="co-card-name" label="Name on card" autoComplete="cc-name" {...field('cardName')} />
                      </div>
                      <div className="col-6">
                        <FormField
                          id="co-expiry"
                          label="Expiry (MM/YY)"
                          placeholder="08/29"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          name="expiry"
                          value={form.values.expiry}
                          onChange={setFormatted('expiry', formatExpiry)}
                          onBlur={form.handleBlur}
                          error={form.errors.expiry}
                        />
                      </div>
                      <div className="col-6">
                        <FormField
                          id="co-cvv"
                          label="CVV"
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          name="cvv"
                          value={form.values.cvv}
                          onChange={setFormatted('cvv', (value) => value.replace(/\D/g, '').slice(0, 4))}
                          onBlur={form.handleBlur}
                          error={form.errors.cvv}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ---------- Summary ---------- */}
            <div className="col-lg-5 col-xl-4">
              <div className="ss-checkout-summary">
                <OrderSummary title="Your order" totals={totals} promoCode={promoCode}>
                  <button type="submit" className="btn btn-primary btn-lg rounded-pill" disabled={placing}>
                    {placing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-lock-fill me-2" />
                        Place order · {formatPrice(totals.total)}
                      </>
                    )}
                  </button>
                  <Link to="/cart" className="btn btn-link text-decoration-none fw-bold">
                    <i className="bi bi-arrow-left me-1" /> Edit cart
                  </Link>
                </OrderSummary>

                <ul className="ss-checkout-items">
                  {items.map((item) => (
                    <li key={item.id}>
                      <ProductImage product={item} size="sm" />
                      <span>
                        {item.name}
                        <small>Qty {item.quantity}</small>
                      </span>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
