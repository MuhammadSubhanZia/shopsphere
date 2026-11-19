import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <p className="ss-eyebrow">Error 404</p>
      <h1 className="display-4 fw-bold mb-3">Page not found</h1>
      <p className="ss-muted mb-4">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary rounded-pill px-4">
        Back to home
      </Link>
    </div>
  );
}
