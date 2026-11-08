import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthShell from '../components/common/AuthShell.jsx';
import FormField from '../components/common/FormField.jsx';
import useForm from '../hooks/useForm.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { login, selectUser, selectAuthStatus } from '../store/slices/authSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { validateLogin } from '../utils/validators.js';
import { getErrorMessage } from '../utils/errors.js';

const DEMO_ACCOUNTS = [
  { label: 'Customer demo', email: 'user@shopsphere.pk', password: 'User@1234' },
  { label: 'Admin demo', email: 'admin@shopsphere.pk', password: 'Admin@123' },
];

export default function Login() {
  useDocumentTitle('Log in');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthStatus) === 'loading';
  const [serverError, setServerError] = useState('');

  const form = useForm({ email: '', password: '' }, validateLogin);

  // A protected page can send the visitor here and remember where they wanted to go.
  const from = location.state?.from;

  // As soon as there is a logged-in user (after login, or if they were already signed in) leave this page.
  useEffect(() => {
    if (user) navigate(from || (user.role === 'admin' ? '/admin' : '/'), { replace: true });
  }, [user, from, navigate]);

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const signedIn = await dispatch(login(values)).unwrap();
      dispatch(showToast(`Welcome back, ${signedIn.name.split(' ')[0]}!`));
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your orders and wishlist."
      footer={
        <>
          New to ShopSphere? <Link to="/register">Create an account</Link>
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

        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.email}
        />
        <FormField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.errors.password}
        />

        <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            'Log in'
          )}
        </button>
      </form>

      <div className="ss-demo">
        <strong>Demo accounts</strong>
        <div className="d-flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              type="button"
              key={account.label}
              className="btn btn-outline-dark"
              onClick={() => form.setValues({ email: account.email, password: account.password })}
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
