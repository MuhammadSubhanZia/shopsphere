import './Rating.css';

/** Five-star rating display with optional numeric value and review count. */
export default function Rating({ value = 0, count, showValue = true, size = 'sm' }) {
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (value >= n) return 'bi-star-fill';
    if (value >= n - 0.5) return 'bi-star-half';
    return 'bi-star';
  });

  return (
    <span className={`ss-rating ss-rating--${size}`} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span className="ss-rating__stars" aria-hidden="true">
        {stars.map((cls, index) => (
          <i key={index} className={`bi ${cls}`} />
        ))}
      </span>
      {showValue && <span className="ss-rating__value">{value.toFixed(1)}</span>}
      {count != null && <span className="ss-rating__count">({count.toLocaleString('en-US')})</span>}
    </span>
  );
}
