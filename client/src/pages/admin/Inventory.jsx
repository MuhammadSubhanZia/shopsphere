import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { selectAllProducts, selectProductsStatus, editProduct } from '../../store/slices/productsSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { LOW_STOCK_THRESHOLD, stockStatus, STOCK_META } from '../../utils/inventory.js';
import { getErrorMessage } from '../../utils/errors.js';
import './Inventory.css';

const TABS = [
  { key: 'all', label: 'All products' },
  { key: 'low', label: 'Low stock' },
  { key: 'out', label: 'Out of stock' },
];

export default function Inventory() {
  useDocumentTitle('Inventory');
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);

  const [threshold, setThreshold] = useState(LOW_STOCK_THRESHOLD);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState({}); // productId -> text typed in the stock box
  const [savingId, setSavingId] = useState(null);

  const summary = useMemo(() => {
    let units = 0;
    let low = 0;
    let out = 0;
    products.forEach((p) => {
      units += p.stock;
      const level = stockStatus(p.stock, threshold);
      if (level === 'low') low += 1;
      if (level === 'out') out += 1;
    });
    return { units, low, out };
  }, [products, threshold]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => {
        const level = stockStatus(p.stock, threshold);
        if (tab === 'low' && level !== 'low') return false;
        if (tab === 'out' && level !== 'out') return false;
        return !term || `${p.name} ${p.brand}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.stock - b.stock); // emptiest shelves first
  }, [products, tab, search, threshold]);

  const saveStock = async (product, nextStock) => {
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      dispatch(showToast('Stock must be a whole number of 0 or more', 'error'));
      return;
    }
    setSavingId(product.id);
    try {
      await dispatch(editProduct({ id: product.id, changes: { stock: nextStock } })).unwrap();
      setDrafts((current) => {
        const { [product.id]: _removed, ...rest } = current;
        return rest;
      });
      dispatch(showToast(`${product.name}: stock is now ${nextStock}`));
    } catch (error) {
      dispatch(showToast(getErrorMessage(error), 'error'));
    } finally {
      setSavingId(null);
    }
  };

  const handleDraftSave = (product) => {
    const raw = drafts[product.id];
    saveStock(product, raw === '' || raw === undefined ? NaN : Number(raw));
  };

  const cards = [
    { label: 'Units in stock', value: summary.units, icon: 'bi-boxes', tone: 'info' },
    { label: 'Low stock', value: summary.low, icon: 'bi-exclamation-triangle', tone: 'warning' },
    { label: 'Out of stock', value: summary.out, icon: 'bi-x-octagon', tone: 'danger' },
  ];

  let content;
  if (status !== 'succeeded') {
    content = <Spinner label="Loading inventory..." />;
  } else if (rows.length === 0) {
    content = <EmptyState icon="bi-clipboard-check" title="Nothing to show" message="No products match this view." />;
  } else {
    content = (
      <div className="ss-table-card">
        <div className="table-responsive">
          <table className="table ss-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>In stock</th>
                <th style={{ minWidth: 230 }}>Update stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => {
                const level = stockStatus(product.stock, threshold);
                const draft = drafts[product.id];
                const dirty = draft !== undefined && draft !== String(product.stock);
                const saving = savingId === product.id;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="ss-cell-product">
                        <ProductImage product={product} size="sm" />
                        <span>
                          <strong>{product.name}</strong>
                          <small>
                            {product.brand} · #{product.id}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill text-bg-${STOCK_META[level].badge}`}>{STOCK_META[level].label}</span>
                    </td>
                    <td>
                      <strong>{product.stock}</strong>
                    </td>
                    <td>
                      <div className="ss-stock-edit">
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          aria-label={`New stock for ${product.name}`}
                          value={draft ?? product.stock}
                          onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && dirty) handleDraftSave(product);
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-pill"
                          disabled={!dirty || saving}
                          onClick={() => handleDraftSave(product)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm rounded-pill text-nowrap"
                          disabled={saving}
                          onClick={() => saveStock(product, product.stock + 10)}
                          title="Add 10 units"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader title="Inventory" subtitle="Keep an eye on stock levels and restock quickly." />

      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-sm-4" key={card.label}>
            <div className={`ss-inv-card is-${card.tone}`}>
              <i className={`bi ${card.icon}`} aria-hidden="true" />
              <div>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ss-admin-toolbar align-items-center">
        <ul className="nav nav-pills ss-inv-tabs" role="tablist" aria-label="Stock filter">
          {TABS.map(({ key, label }) => (
            <li className="nav-item" key={key} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`nav-link ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="ss-admin-search ms-lg-auto">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            className="form-control"
            placeholder="Search products..."
            aria-label="Search inventory"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <label className="ss-inv-threshold">
          Low stock at
          <input
            type="number"
            min="1"
            className="form-control form-control-sm"
            value={threshold}
            onChange={(event) => setThreshold(Math.max(1, Number(event.target.value) || 1))}
          />
          units
        </label>
      </div>

      {content}
    </>
  );
}
