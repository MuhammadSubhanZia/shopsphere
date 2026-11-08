import { useState } from 'react';

/**
 * Small form helper used by every form in the app.
 *
 *   const form = useForm({ email: '' }, validateLogin);
 *   <input name="email" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} />
 *   <form onSubmit={form.handleSubmit((values) => ...)}>
 *
 * `validate(values)` must return an object of { field: 'message' }.
 * Errors are only shown for fields the user has already touched, or after a submit attempt.
 */
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = validate(values);
  const errors = {};
  Object.keys(allErrors).forEach((field) => {
    if (submitted || touched[field]) errors[field] = allErrors[field];
  });

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setValues((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
  };

  const setValue = (name, value) => setValues((previous) => ({ ...previous, [name]: value }));

  // Returns an onSubmit handler that only calls `onValid` when there are no errors.
  const handleSubmit = (onValid) => (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(allErrors).length === 0) onValid(values);
  };

  const reset = (next = initialValues) => {
    setValues(next);
    setTouched({});
    setSubmitted(false);
  };

  return {
    values,
    errors,
    isValid: Object.keys(allErrors).length === 0,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setValues,
    reset,
  };
}
