import { useState } from 'react';
import './FormField.css';

/**
 * Label + input + validation message in one component.
 * as: 'input' (default) | 'textarea' | 'select' (pass <option>s as children).
 * Password fields get a show / hide button automatically.
 */
export default function FormField({
  id,
  label,
  type = 'text',
  as = 'input',
  error,
  hint,
  required = false,
  className = '',
  children,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  const controlProps = {
    id,
    className: `${as === 'select' ? 'form-select' : 'form-control'} ${error ? 'is-invalid' : ''}`.trim(),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    ...inputProps,
  };

  let control;
  if (as === 'textarea') control = <textarea rows={3} {...controlProps} />;
  else if (as === 'select') control = <select {...controlProps}>{children}</select>;
  else control = <input type={isPassword && visible ? 'text' : type} {...controlProps} />;

  return (
    <div className={`ss-field ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={isPassword ? 'ss-field__password' : undefined}>
        {control}
        {isPassword && (
          <button
            type="button"
            className="ss-field__toggle"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((value) => !value)}
          >
            <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
        )}
      </div>

      {error && (
        <div id={`${id}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
      {!error && hint && (
        <div id={`${id}-hint`} className="form-text">
          {hint}
        </div>
      )}
    </div>
  );
}
