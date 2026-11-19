import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice.js';

/**
 * Wrap a page in <ProtectedRoute> to make it available to logged-in users only.
 * Visitors are sent to the login page and brought back here afterwards.
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}
