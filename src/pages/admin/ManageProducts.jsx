import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import ProductFormModal from '../../components/admin/ProductFormModal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { selectAllProducts, selectProductsStatus, removeProduct, fetchProducts } from '../../store/slices/productsSlice.js';
import { selectCategories } from '../../store/slices/categoriesSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { formatPrice } from '../../utils/formatters.js';
import { stockStatus, STOCK_META } from '../../utils/inventory.js';
import { getErrorMessage } from '../../utils/errors.js';
import { filterProducts } from '../../utils/productFilters.js';

const PAGE_SIZE = 10;

export default function ManageProducts() {
  useDocumentTitle('Manage products');
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(selectProductsStatus);
  const categories = useSelector(selectCategories);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null = closed, 'new' = add dialog, product = edit dialog
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const categoryName = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.name])), [categories]);

  const filtered = useMemo(() => filterProducts(products, { q: search, category }), [products, search, category]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await dispatch(removeProduct(deleting.id)).unwrap();
      dispatch(showToast(`"${deleting.name}" was deleted`, 'info'));
      dispatch(fetchProducts()); // also removes it from any shopper's cart
      setDeleting(null);
    } catch (error) {
      dispatch(showToast(getErrorMessage(error), 'error'));
    } finally {
      setBusy(false);
    }
  };

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  let content;
  if (status !== 'succeeded') {
    content = <Spinner label="Loading products..." />;
  } else if (filtered.length === 0) {
    content = (
      <EmptyState icon="bi-box-seam" title="No products found" message="Try a different search or add a new product." />
    );
  } else {
    content = (
      <>
        <div className="ss-table-card">
          <div className="table-responsive">
            <table className="table ss-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th className="text-center">Featured</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((product) => {
                  const level = stockStatus(product.stock);
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
                      <td>{categoryName[product.category] || product.category}</td>
                      <td className="text-nowrap">
                        <strong>{formatPrice(product.price)}</strong>
                        {product.oldPrice && <small className="d-block ss-muted text-decoration-line-through">{formatPrice(product.oldPrice)}</small>}
                      </td>
                      <td>
                        <span className={`badge rounded-pill text-bg-${STOCK_META[level].badge}`}>{product.stock}</span>
                      </td>
                      <td className="text-center">
                        {product.featured ? <i className="bi bi-star-fill text-warning" aria-label="Featured" /> : <i className="bi bi-dash text-muted" aria-label="Not featured" />}
                      </td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="ss-icon-action me-1" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button type="button" className="ss-icon-action is-danger" aria-label={`Delete ${product.name}`} onClick={() => setDeleting(product)}>
                          <i className="bi bi-trash3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Products" subtitle={`${products.length} products in the catalogue`}>
        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setEditing('new')}>
          <i className="bi bi-plus-lg me-2" />
          Add product
        </button>
      </AdminPageHeader>

      <div className="ss-admin-toolbar">
        <div className="ss-admin-search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            className="form-control"
            placeholder="Search products..."
            aria-label="Search products"
            value={search}
            onChange={updateFilter(setSearch)}
          />
        </div>
        <select className="form-select w-auto" aria-label="Filter by category" value={category} onChange={updateFilter(setCategory)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {content}

      {editing && (
        <ProductFormModal product={editing === 'new' ? null : editing} categories={categories} onClose={() => setEditing(null)} />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete this product?"
          message={`"${deleting.name}" will be removed from the store. This cannot be undone.`}
          confirmLabel="Delete product"
          busy={busy}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
