import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { fetchProducts, selectAllProducts, selectProductsStatus } from '../store/slices/productsSlice.js';
import { selectCategories } from '../store/slices/categoriesSlice.js';
import { filterProducts, sortProducts, SORT_OPTIONS } from '../utils/productFilters.js';
import { formatPrice } from '../utils/formatters.js';
import './Products.css';

const PAGE_SIZE = 12;

// "1500" -> 1500, "" or junk -> null
const toNumber = (value) => {
  if (value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export default function Products() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const categories = useSelector(selectCategories);

  // The URL is the single source of truth for every filter, so pages can be bookmarked and shared.
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = SORT_OPTIONS.some((option) => option.value === params.get('sort')) ? params.get('sort') : 'featured';
  const min = toNumber(params.get('min'));
  const max = toNumber(params.get('max'));
  const inStock = params.get('inStock') === '1';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  const [search, setSearch] = useState(q);
  useEffect(() => {
    setSearch(q);
  }, [q]);

  const activeCategory = categories.find((c) => c.slug === category);
  useDocumentTitle(activeCategory ? activeCategory.name : q ? `Search: ${q}` : 'Shop');

  // Merge changes into the query string. Changing any filter sends the shopper back to page 1.
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === false) next.delete(key);
      else next.set(key, value === true ? '1' : String(value));
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const reset = () => setParams(new URLSearchParams(sort !== 'featured' ? { sort } : {}));

  const goToPage = (next) => {
    update({ page: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    update({ q: search.trim() });
  };

  // Heavy work is memoized so it only reruns when the inputs really change.
  const filtered = useMemo(
    () => sortProducts(filterProducts(products, { q, category, min, max, inStock }), sort),
    [products, q, category, min, max, inStock, sort]
  );

  // Category counts respect the other filters (search, price, stock) but not the category itself.
  const { counts, totalCount } = useMemo(() => {
    const base = filterProducts(products, { q, min, max, inStock });
    const map = {};
    base.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return { counts: map, totalCount: base.length };
  }, [products, q, min, max, inStock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstShown = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const hasFilters = Boolean(q || category || min !== null || max !== null || inStock);

  const chips = [];
  if (q) chips.push({ key: 'q', label: `“${q}”`, clear: { q: '' } });
  if (activeCategory) chips.push({ key: 'category', label: activeCategory.name, clear: { category: '' } });
  if (min !== null || max !== null) {
    const label = `${min !== null ? formatPrice(min) : 'Any'} – ${max !== null ? formatPrice(max) : 'Any'}`;
    chips.push({ key: 'price', label, clear: { min: '', max: '' } });
  }
  if (inStock) chips.push({ key: 'inStock', label: 'In stock', clear: { inStock: false } });

  let content;
  if (status === 'failed') {
    content = (
      <EmptyState icon="bi-wifi-off" title="Could not load products" message="Please check your connection and try again.">
        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => dispatch(fetchProducts())}>
          Try again
        </button>
      </EmptyState>
    );
  } else if (status !== 'succeeded') {
    content = <Spinner label="Loading products..." />;
  } else if (filtered.length === 0) {
    content = (
      <EmptyState icon="bi-search" title="No products found" message="Try a different search term or remove some filters.">
        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={reset}>
          Clear all filters
        </button>
      </EmptyState>
    );
  } else {
    content = (
      <>
        <ProductGrid products={pageItems} columns={3} />
        <div className="mt-5">
          <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={activeCategory ? activeCategory.name : q ? `Results for “${q}”` : 'Shop all products'}
        subtitle={activeCategory ? activeCategory.description : 'Browse, search and filter our full catalogue.'}
      >
        <form className="ss-shop-search" role="search" onSubmit={handleSearch}>
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            className="form-control"
            placeholder="Search by name, brand or keyword..."
            aria-label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </PageHeader>

      <div className="container py-4 py-lg-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <FilterSidebar
              categories={categories}
              counts={counts}
              totalCount={totalCount}
              category={category}
              min={min}
              max={max}
              inStock={inStock}
              hasFilters={hasFilters}
              onChange={update}
              onReset={reset}
            />
          </div>

          <div className="col-lg-9">
            {status === 'succeeded' && (
              <div className="ss-toolbar">
                <p className="ss-toolbar__count">
                  {filtered.length === 0
                    ? '0 products'
                    : `Showing ${firstShown}–${lastShown} of ${filtered.length} products`}
                </p>
                <div className="ss-toolbar__sort">
                  <label htmlFor="sort-by">Sort by</label>
                  <select
                    id="sort-by"
                    className="form-select form-select-sm"
                    value={sort}
                    onChange={(event) => update({ sort: event.target.value === 'featured' ? '' : event.target.value })}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {chips.length > 0 && (
              <div className="ss-active-filters" aria-label="Active filters">
                {chips.map((chip) => (
                  <button type="button" key={chip.key} className="ss-active-chip" onClick={() => update(chip.clear)}>
                    {chip.label} <i className="bi bi-x-lg" aria-label="Remove filter" />
                  </button>
                ))}
                <button type="button" className="ss-active-clear" onClick={reset}>
                  Clear all
                </button>
              </div>
            )}

            {content}
          </div>
        </div>
      </div>
    </>
  );
}
