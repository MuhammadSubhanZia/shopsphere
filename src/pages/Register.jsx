import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthShell from '../components/common/AuthShell.jsx';
import FormField from '../components/common/FormField.jsx';
import PasswordChecklist from '../components/common/PasswordChecklist.jsx';
import useForm from '../hooks/useForm.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { register, selectUser, selectAuthStatus } from '../store/slices/authSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { validateRegister } from '../utils/validators.js';
import { getErrorMessage } from '../utils/errors.js';

export default function Register() {
  useDocumentTitle('Create account');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthStatus) === 'loading';
  const [serverError, setServerError] = useState('');

  const form = useForm(
    { name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false },
    validateRegister
  );

  // Registration signs the new customer in automatically, so move on to the home page.
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const onSubmit = async ({ name, email, phone, password }) => {
    setServerError('');
    try {
      const created = await dispatch(register({ name, email, phone, password })).unwrap();
      dispatch(showToast(`Welcome to ShopSphere, ${created.name.split(' ')[0]}!`));
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const field = (name) => ({
    name,
    value: form.values[name],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.errors[name],
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="It only takes a minute."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="alert alert-danger py-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {serverError}
          </div>
        )}

        <FormField id="reg-name" label="Full name" placeholder="Ayesha Khan" autoComplete="name" {...field('name')} />
        <FormField
          id="reg-email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          {...field('email')}
        />
        <FormField
          id="reg-phone"
          type="tel"
          label="Mobile number"
          placeholder="0300-1234567"
          autoComplete="tel"
          {...field('phone')}
        />
        <FormField
          id="reg-password"
          type="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          {...field('password')}
        />
        <PasswordChecklist password={form.values.password} />
        <FormField
          id="reg-confirm"
          type="password"
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          {...field('confirmPassword')}
        />

        <div className="form-check mb-3">
          <input
            className={`form-check-input ${form.errors.terms ? 'is-invalid' : ''}`}
            type="checkbox"
            id="reg-terms"
            name="terms"
            checked={form.values.terms}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
          />
          <label className="form-check-label" htmlFor="reg-terms">
            I agree to the terms of use and privacy policy
          </label>
          {form.errors.terms && <div className="invalid-feedback d-block fw-semibold">{form.errors.terms}</div>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthShell>
  );
}
