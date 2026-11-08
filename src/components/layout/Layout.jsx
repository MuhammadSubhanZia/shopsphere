import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from '../routing/ScrollToTop.jsx';
import ToastHost from '../common/ToastHost.jsx';

/** Shared page frame: sticky navbar on top, footer at the bottom, routed page in between. */
export default function Layout() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <ToastHost />
    </div>
  );
}
