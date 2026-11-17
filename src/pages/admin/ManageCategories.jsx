import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import CategoryFormModal from '../../components/admin/CategoryFormModal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { selectCategories, selectCategoriesStatus, removeCategory } from '../../store/slices/categoriesSlice.js';
import { selectAllProducts } from '../../store/slices/productsSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { getErrorMessage } from '../../utils/errors.js';
import './ManageCategories.css';

export default function ManageCategories() {
  useDocumentTitle('Manage categories');
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const status = useSelector(selectCategoriesStatus);
  const products = useSelector(selectAllProducts);

  const [editing, setEditing] = useState(null); // null = closed, 'new' = add dialog, category = edit dialog
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const productCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await dispatch(removeCategory(deleting.id)).unwrap();
      dispatch(showToast(`Category "${deleting.name}" was deleted`, 'info'));
      setDeleting(null);
    } catch (error) {
      // e.g. the category still contains products
      dispatch(showToast(getErrorMessage(error), 'error'));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  let content;
  if (status !== 'succeeded') {
    content = <Spinner label="Loading categories..." />;
  } else if (categories.length === 0) {
    content = <EmptyState icon="bi-tags" title="No categories yet" message="Create your first category to organise the catalogue." />;
  } else {
    content = (
      <div className="row row-cols-1 row-cols-md-2 g-3">
        {categories.map((category) => {
          const count = productCounts[category.slug] || 0;
          return (
            <div className="col" key={category.id}>
              <article className="ss-cat-card" style={{ '--tint': category.tint }}>
                <span className="ss-cat-card__icon">
                  <i className={`bi ${category.icon}`} />
                </span>
                <div className="ss-cat-card__body">
                  <h2>{category.name}</h2>
                  <p>{category.description || 'No description.'}</p>
                  <small>
                    <code>{category.slug}</code> · {count} {count === 1 ? 'product' : 'products'}
                  </small>
                </div>
                <div className="ss-cat-card__actions">
                  <button type="button" className="btn btn-outline-dark btn-sm rounded-pill" onClick={() => setEditing(category)}>
                    <i className="bi bi-pencil me-1" /> Edit
                  </button>
                  <button type="button" className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setDeleting(category)}>
                    <i className="bi bi-trash3 me-1" /> Delete
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader title="Categories" subtitle={`${categories.length} categories`}>
        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setEditing('new')}>
          <i className="bi bi-plus-lg me-2" />
          Add category
        </button>
      </AdminPageHeader>

      {content}

      {editing && <CategoryFormModal category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}

      {deleting && (
        <ConfirmModal
          title="Delete this category?"
          message={
            (productCounts[deleting.slug] || 0) > 0
              ? `"${deleting.name}" still contains ${productCounts[deleting.slug]} products and cannot be deleted until they are moved or removed.`
              : `"${deleting.name}" will be removed. This cannot be undone.`
          }
          confirmLabel="Delete category"
          busy={busy}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
