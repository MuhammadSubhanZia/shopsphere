import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from '../routing/ScrollToTop.jsx';
import ToastHost from '../common/ToastHost.jsx';
import Spinner from '../common/Spinner.jsx';

/**
 * Shared page frame: sticky navbar on top, footer at the bottom, routed page in between.
 * Pages are lazy-loaded, so <Suspense> shows a spinner while a page's code is downloading.
 */
export default function Layout() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<Spinner label="Loading page..." />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ToastHost />
    </div>
  );
}
