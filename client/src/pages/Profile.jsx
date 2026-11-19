import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import FormField from '../components/common/FormField.jsx';
import PasswordChecklist from '../components/common/PasswordChecklist.jsx';
import useForm from '../hooks/useForm.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectUser, updateProfile } from '../store/slices/authSlice.js';
import { fetchMyOrders, selectOrders, selectOrdersStatus } from '../store/slices/ordersSlice.js';
import { showToast } from '../store/slices/uiSlice.js';
import { validateProfile, validatePasswordChange } from '../utils/validators.js';
import { getErrorMessage } from '../utils/errors.js';
import { formatPrice, formatDate, getInitials } from '../utils/formatters.js';
import { CITIES } from '../data/cities.js';
import './Profile.css';

export default function Profile() {
  useDocumentTitle('My profile');
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const orders = useSelector(selectOrders);
  const ordersStatus = useSelector(selectOrdersStatus);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    dispatch(fetchMyOrders(user.id));
  }, [dispatch, user.id]);

  const profileForm = useForm(
    { name: user.name, phone: user.phone || '', address: user.address || '', city: user.city || '' },
    validateProfile
  );
  const passwordForm = useForm({ currentPassword: '', newPassword: '', confirmPassword: '' }, validatePasswordChange);

  // Cancelled orders do not count towards the amount spent.
  const activeOrders = orders.filter((order) => order.status !== 'cancelled');
  const totalSpent = activeOrders.reduce((sum, order) => sum + order.total, 0);

  const saveProfile = async (values) => {
    setSavingProfile(true);
    try {
      await dispatch(updateProfile({ id: user.id, changes: values })).unwrap();
      dispatch(showToast('Profile updated'));
    } catch (error) {
      dispatch(showToast(getErrorMessage(error), 'error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async ({ currentPassword, newPassword }) => {
    setSavingPassword(true);
    setPasswordError('');
    try {
      await dispatch(updateProfile({ id: user.id, changes: { currentPassword, newPassword } })).unwrap();
      passwordForm.reset();
      dispatch(showToast('Password changed successfully'));
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  const profileField = (name) => ({
    name,
    value: profileForm.values[name],
    onChange: profileForm.handleChange,
    onBlur: profileForm.handleBlur,
    error: profileForm.errors[name],
  });

  const passwordField = (name) => ({
    name,
    value: passwordForm.values[name],
    onChange: passwordForm.handleChange,
    onBlur: passwordForm.handleBlur,
    error: passwordForm.errors[name],
  });

  return (
    <>
      <PageHeader title="My profile" subtitle="Manage your personal details and password." />

      <div className="container py-4 py-lg-5">
        <div className="row g-4">
          {/* ---------- Left: summary ---------- */}
          <div className="col-lg-4">
            <section className="ss-card ss-profile-card">
              <span className="ss-profile-card__avatar">{getInitials(user.name)}</span>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className={`badge rounded-pill ${user.role === 'admin' ? 'text-bg-dark' : 'text-bg-light border'}`}>
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
              <p className="ss-profile-card__since">Member since {formatDate(user.createdAt)}</p>

              <div className="ss-profile-stats">
                <div>
                  <strong>{ordersStatus === 'succeeded' ? activeOrders.length : '–'}</strong>
                  <span>Orders</span>
                </div>
                <div>
                  <strong>{ordersStatus === 'succeeded' ? formatPrice(totalSpent) : '–'}</strong>
                  <span>Total spent</span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Link to="/orders" className="btn btn-outline-dark rounded-pill">
                  <i className="bi bi-receipt me-2" />
                  My orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn btn-dark rounded-pill">
                    <i className="bi bi-speedometer2 me-2" />
                    Admin panel
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* ---------- Right: forms ---------- */}
          <div className="col-lg-8">
            <section className="ss-card p-4 mb-4">
              <h2 className="h5 mb-1">Personal information</h2>
              <p className="ss-muted small mb-4">This is also used to pre-fill your delivery details at checkout.</p>

              <form onSubmit={profileForm.handleSubmit(saveProfile)} noValidate>
                <div className="row">
                  <div className="col-md-6">
                    <FormField id="pf-name" label="Full name" autoComplete="name" {...profileField('name')} />
                  </div>
                  <div className="col-md-6">
                    <FormField id="pf-email" label="Email address" value={user.email} disabled readOnly hint="Email cannot be changed." />
                  </div>
                  <div className="col-md-6">
                    <FormField id="pf-phone" type="tel" label="Mobile number" placeholder="0300-1234567" autoComplete="tel" {...profileField('phone')} />
                  </div>
                  <div className="col-md-6">
                    <FormField id="pf-city" as="select" label="City" {...profileField('city')}>
                      <option value="">Select your city</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </FormField>
                  </div>
                  <div className="col-12">
                    <FormField
                      id="pf-address"
                      as="textarea"
                      label="Street address"
                      placeholder="House / flat number, street, area"
                      autoComplete="street-address"
                      {...profileField('address')}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </form>
            </section>

            <section className="ss-card p-4">
              <h2 className="h5 mb-4">Change password</h2>

              <form onSubmit={passwordForm.handleSubmit(savePassword)} noValidate>
                {passwordError && (
                  <div className="alert alert-danger py-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {passwordError}
                  </div>
                )}
                <FormField
                  id="pw-current"
                  type="password"
                  label="Current password"
                  autoComplete="current-password"
                  {...passwordField('currentPassword')}
                />
                <FormField id="pw-new" type="password" label="New password" autoComplete="new-password" {...passwordField('newPassword')} />
                <PasswordChecklist password={passwordForm.values.newPassword} />
                <FormField
                  id="pw-confirm"
                  type="password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  {...passwordField('confirmPassword')}
                />
                <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={savingPassword}>
                  {savingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                      Updating...
                    </>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
