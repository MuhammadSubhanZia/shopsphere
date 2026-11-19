import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../common/Modal.jsx';
import FormField from '../common/FormField.jsx';
import useForm from '../../hooks/useForm.js';
import { addCategory, editCategory } from '../../store/slices/categoriesSlice.js';
import { showToast } from '../../store/slices/uiSlice.js';
import { validateCategory } from '../../utils/validators.js';
import { getErrorMessage } from '../../utils/errors.js';
import { ICON_OPTIONS } from '../../data/icons.js';

/** Add (category = null) or edit a category. Closes itself after a successful save. */
export default function CategoryFormModal({ category, onClose }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(category);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useForm(
    {
      name: category?.name ?? '',
      description: category?.description ?? '',
      icon: category?.icon ?? 'bi-tag',
      tint: category?.tint ?? 20,
    },
    validateCategory
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
    const data = { name: values.name, description: values.description, icon: values.icon, tint: Number(values.tint) };

    try {
      if (isEdit) await dispatch(editCategory({ id: category.id, changes: data })).unwrap();
      else await dispatch(addCategory(data)).unwrap();
      dispatch(showToast(isEdit ? 'Category updated' : 'Category added'));
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit "${category.name}"` : 'Add a category'}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline-dark rounded-pill px-4" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="category-form" className="btn btn-primary rounded-pill px-4" disabled={saving}>
            {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {isEdit ? 'Save changes' : 'Add category'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="alert alert-danger py-2" role="alert">
            {serverError}
          </div>
        )}

        <FormField id="cf-name" label="Category name" required {...field('name')} />
        <FormField id="cf-desc" as="textarea" label="Description" hint="Shown on the shop page. Max 120 characters." {...field('description')} />

        <div className="row">
          <div className="col-sm-6">
            <FormField id="cf-icon" as="select" label="Icon" {...field('icon')}>
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormField>
          </div>
          <div className="col-sm-6">
            <label htmlFor="cf-tint" className="form-label">
              Colour
            </label>
            <input
              id="cf-tint"
              name="tint"
              type="range"
              className="form-range ss-hue-range"
              min="0"
              max="360"
              value={form.values.tint}
              onChange={form.handleChange}
            />
          </div>
        </div>

        <div className="ss-cat-preview" style={{ '--tint': form.values.tint }}>
          <span>
            <i className={`bi ${form.values.icon}`} />
          </span>
          <div>
            <strong>{form.values.name || 'Category preview'}</strong>
            <small>This is how the category tile looks on the home page.</small>
          </div>
        </div>
      </form>
    </Modal>
  );
}
