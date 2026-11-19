import './QuantityStepper.css';

/** "- 2 +" control. Always keeps the value between `min` and `max`. */
export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', label = 'Quantity' }) {
  const clamp = (n) => (Number.isNaN(n) ? min : Math.max(min, Math.min(max, n)));

  return (
    <div className={`ss-stepper ss-stepper--${size}`} role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <i className="bi bi-dash" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(clamp(parseInt(event.target.value, 10)))}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <i className="bi bi-plus" />
      </button>
    </div>
  );
}
