import { useEffect, useState } from 'react';
import { formatPrice } from '../../utils/formatters.js';
import './FilterSidebar.css';

const PRICE_PRESETS = [
  { label: 'Under Rs. 3,000', min: '', max: 3000 },
  { label: 'Rs. 3,000 – 10,000', min: 3000, max: 10000 },
  { label: 'Over Rs. 10,000', min: 10000, max: '' },
];

/**
 * Left-hand filter panel on the shop page. It is a "controlled" component:
 * the current filter values come in as props and every change is reported through onChange.
 */
export default function FilterSidebar({ categories, counts, totalCount, category, min, max, inStock, hasFilters, onChange, onReset }) {
  const [open, setOpen] = useState(false); // collapsed state on small screens
  const [range, setRange] = useState({ min: min ?? '', max: max ?? '' });

  // Keep the inputs in sync when the URL changes (e.g. a filter chip is removed).
  useEffect(() => {
    setRange({ min: min ?? '', max: max ?? '' });
  }, [min, max]);

  const applyRange = (event) => {
    event.preventDefault();
    let low = range.min === '' ? '' : Math.max(0, Number(range.min));
    let high = range.max === '' ? '' : Math.max(0, Number(range.max));
    if (low !== '' && high !== '' && low > high) [low, high] = [high, low];
    onChange({ min: low, max: high });
  };

  const presetActive = (preset) => (min ?? '') === preset.min && (max ?? '') === preset.max;

  return (
    <aside className="ss-filters" aria-label="Product filters">
      <button
        type="button"
        className="ss-filters__toggle d-lg-none"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <i className="bi bi-funnel me-2" />
          Filters {hasFilters && <span className="ss-filters__dot" aria-label="filters active" />}
        </span>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
      </button>

      <div className={`ss-filters__panel ${open ? 'is-open' : ''}`}>
        <section className="ss-filters__group">
          <h2>Category</h2>
          <ul className="ss-filters__list">
            <li>
              <button
                type="button"
                className={`ss-filter-link ${category === '' ? 'is-active' : ''}`}
                onClick={() => onChange({ category: '' })}
              >
                <span>All categories</span>
                <small>{totalCount}</small>
              </button>
            </li>
            {categories.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`ss-filter-link ${category === item.slug ? 'is-active' : ''}`}
                  onClick={() => onChange({ category: item.slug })}
                >
                  <span>
                    <i className={`bi ${item.icon} me-2`} />
                    {item.name}
                  </span>
                  <small>{counts[item.slug] || 0}</small>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="ss-filters__group">
          <h2>Price (PKR)</h2>
          <form className="ss-filters__range" onSubmit={applyRange}>
            <input
              type="number"
              min="0"
              className="form-control form-control-sm"
              placeholder="Min"
              aria-label="Minimum price"
              value={range.min}
              onChange={(event) => setRange({ ...range, min: event.target.value })}
            />
            <span>–</span>
            <input
              type="number"
              min="0"
              className="form-control form-control-sm"
              placeholder="Max"
              aria-label="Maximum price"
              value={range.max}
              onChange={(event) => setRange({ ...range, max: event.target.value })}
            />
            <button type="submit" className="btn btn-dark btn-sm">
              Go
            </button>
          </form>
          <div className="ss-filters__chips">
            {PRICE_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.label}
                className={`ss-chip ${presetActive(preset) ? 'is-active' : ''}`}
                onClick={() => onChange({ min: preset.min, max: preset.max })}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {(min !== null || max !== null) && (
            <p className="ss-filters__hint">
              Showing {min !== null ? formatPrice(min) : 'any price'} to {max !== null ? formatPrice(max) : 'any price'}
            </p>
          )}
        </section>

        <section className="ss-filters__group">
          <h2>Availability</h2>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="filter-in-stock"
              checked={inStock}
              onChange={(event) => onChange({ inStock: event.target.checked })}
            />
            <label className="form-check-label" htmlFor="filter-in-stock">
              In stock only
            </label>
          </div>
        </section>

        <button type="button" className="btn btn-outline-dark btn-sm w-100" disabled={!hasFilters} onClick={onReset}>
          <i className="bi bi-arrow-counterclockwise me-2" />
          Reset filters
        </button>
      </div>
    </aside>
  );
}
