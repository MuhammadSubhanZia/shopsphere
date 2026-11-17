import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../common/Modal.jsx';
import FormField from '../common/FormField.jsx';
import ProductImage from '../common/ProductImage.jsx';
import useForm from '../../hooks/useForm.js';
import { addProduct, editProduct } from '../../store/slices/productsSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { validateProduct } from '../../utils/validators.js';
import { getErrorMessage } from '../../utils/errors.js';
import { ICON_OPTIONS } from '../../data/icons.js';

/**
 * Dialog used to add a new product (product = null) or edit an existing one.
 * It saves through Redux and closes itself when the request succeeds.
 */
export default function ProductFormModal({ product, categories, onClose }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(product);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  // Numbers are kept as strings while typing so the inputs can be empty.
  const form = useForm(
    {
      name: product?.name ?? '',
      category: product?.category ?? '',
      brand: product?.brand ?? '',
      price: product ? String(product.price) : '',
      oldPrice: product?.oldPrice ? String(product.oldPrice) : '',
      stock: product ? String(product.stock) : '',
      description: product?.description ?? '',
      features: product?.features?.join('\n') ?? '',
      icon: product?.icon ?? 'bi-box-seam',
      tint: product?.tint ?? 20,
      featured: product?.featured ?? false,
    },
    validateProduct
  );

  const field = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errors[name],
  });

  const onSubmit = async (values) => {
    setSaving(true);
    setServerError('');

    const data = {
      name: values.name.trim(),
      category: values.category,
      brand: values.brand.trim(),
      price: Number(values.price),
      oldPrice: values.oldPrice === '' ? null : Number(values.oldPrice),
      stock: Number(values.stock),
      description: values.description.trim(),
      features: values.features.split('\n').map((line) => line.trim()).filter(Boolean),
      icon: values.icon,
      tint: Number(values.tint),
      featured: values.featured,
    };

    try {
      if (isEdit) await dispatch(editProduct({ id: product.id, changes: data })).unwrap();
      else await dispatch(addProduct(data)).unwrap();
      dispatch(showToast(isEdit ? 'Product updated' : 'Product added'));
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSaving(false);
    }
  };

  const preview = { name: form.values.name || 'Preview', icon: form.values.icon, tint: Number(form.values.tint) };

  return (
    <Modal
      title={isEdit ? `Edit product #${product.id}` : 'Add a new product'}
      size="lg"
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline-dark rounded-pill px-4" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="btn btn-primary rounded-pill px-4" disabled={saving}>
            {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {isEdit ? 'Save changes' : 'Add product'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="alert alert-danger py-2" role="alert">
            {serverError}
          </div>
        )}

        <div className="row">
          <div className="col-md-8">
            <FormField id="pf-name" label="Product name" required {...field('name')} />
          </div>
          <div className="col-md-4">
            <FormField id="pf-category" as="select" label="Category" required {...field('category')}>
              <option value="">Choose...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </FormField>
          </div>

          <div className="col-md-6">
            <FormField id="pf-brand" label="Brand" required {...field('brand')} />
          </div>
          <div className="col-md-2 col-6">
            <FormField id="pf-price" type="number" min="0" label="Price (Rs.)" required {...field('price')} />
          </div>
          <div className="col-md-2 col-6">
            <FormField id="pf-old" type="number" min="0" label="Old price" hint="Optional" {...field('oldPrice')} />
          </div>
          <div className="col-md-2 col-12">
            <FormField id="pf-stock" type="number" min="0" label="Stock" required {...field('stock')} />
          </div>

          <div className="col-12">
            <FormField id="pf-desc" as="textarea" label="Description" required {...field('description')} />
          </div>
          <div className="col-12">
            <FormField
              id="pf-features"
              as="textarea"
              label="Key features"
              hint="One feature per line."
              {...field('features')}
            />
          </div>

          <div className="col-md-4">
            <FormField id="pf-icon" as="select" label="Icon" {...field('icon')}>
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormField>
          </div>
          <div className="col-md-5">
            <label htmlFor="pf-tint" className="form-label">
              Colour
            </label>
            <input
              id="pf-tint"
              name="tint"
              type="range"
              className="form-range ss-hue-range"
              min="0"
              max="360"
              value={form.values.tint}
              onChange={form.handleChange}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end gap-3 mb-3">
            <div style={{ width: 72 }}>
              <ProductImage product={preview} />
            </div>
          </div>

          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="pf-featured"
                name="featured"
                checked={form.values.featured}
                onChange={form.handleChange}
              />
              <label className="form-check-label" htmlFor="pf-featured">
                Show in &ldquo;Featured products&rdquo; on the home page
              </label>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
