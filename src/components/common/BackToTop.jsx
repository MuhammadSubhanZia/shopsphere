import { useEffect, useState } from 'react';
import './BackToTop.css';

/** Round button that appears after scrolling down and jumps back to the top of the page. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button type="button" className="ss-back-top ss-no-print" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <i className="bi bi-arrow-up" aria-hidden="true" />
    </button>
  );
}
