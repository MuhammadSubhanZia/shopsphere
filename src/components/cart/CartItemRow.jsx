import { Link } from 'react-router-dom';
import ProductImage from '../common/ProductImage.jsx';
import QuantityStepper from '../common/QuantityStepper.jsx';
import { formatPrice } from '../../utils/formatters.js';
import './CartItemRow.css';

/** One line in the shopping cart. Calls back to the parent for every change. */
export default function CartItemRow({ item, onQuantityChange, onRemove, onSaveForLater }) {
  return (
    <li className="ss-cart-row">
      <Link to={`/products/${item.id}`} className="ss-cart-row__image" aria-label={`View ${item.name}`}>
        <ProductImage product={item} size="sm" />
      </Link>

      <div className="ss-cart-row__info">
        <Link to={`/products/${item.id}`} className="ss-cart-row__name">
          {item.name}
        </Link>
        <span className="ss-cart-row__brand">{item.brand}</span>
        <span className="ss-cart-row__unit">{formatPrice(item.price)} each</span>
        {item.quantity >= item.stock && <span className="ss-cart-row__max">Maximum available quantity</span>}

        <div className="ss-cart-row__links">
          <button type="button" onClick={() => onSaveForLater(item)}>
            <i className="bi bi-heart" /> Save for later
          </button>
          <button type="button" onClick={() => onRemove(item)}>
            <i className="bi bi-trash3" /> Remove
          </button>
        </div>
      </div>

      <div className="ss-cart-row__qty">
        <QuantityStepper
          size="sm"
          value={item.quantity}
          max={item.stock}
          label={`Quantity of ${item.name}`}
          onChange={(quantity) => onQuantityChange(item, quantity)}
        />
      </div>

      <strong className="ss-cart-row__total">{formatPrice(item.price * item.quantity)}</strong>
    </li>
  );
}
