import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from '../routing/ScrollToTop.jsx';
import ToastHost from '../common/ToastHost.jsx';
import Spinner from '../common/Spinner.jsx';
import BackToTop from '../common/BackToTop.jsx';

/**
 * Shared page frame: sticky navbar on top, footer at the bottom, routed page in between.
 * Pages are lazy-loaded, so <Suspense> shows a spinner while a page's code is downloading.
 */
export default function Layout() {
  return (
    <div className="app-shell">
      {/* Keyboard users can jump straight past the navbar (visible only when focused). */}
      <a href="#main" className="visually-hidden-focusable ss-skip-link">
        Skip to main content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className="app-main" tabIndex={-1}>
        <Suspense fallback={<Spinner label="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ToastHost />
      <BackToTop />
    </div>
  );
}
