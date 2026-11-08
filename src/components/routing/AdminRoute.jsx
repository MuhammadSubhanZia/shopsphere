import { Link, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EmptyState from '../common/EmptyState.jsx';
import { selectIsAuthenticated, selectIsAdmin } from '../../store/slices/authSlice.js';

/** Like ProtectedRoute, but only administrators get through. Customers see an "access denied" page. */
export default function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-shield-lock"
          title="Access denied"
          message="You need an administrator account to open this page."
        >
          <Link to="/" className="btn btn-primary rounded-pill px-4">
            Back to home
          </Link>
        </EmptyState>
      </div>
    );
  }

  return children;
}
