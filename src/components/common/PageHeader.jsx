import './PageHeader.css';

/**
 * Title banner shown at the top of most pages.
 * `children` can be used for breadcrumbs, search bars, action buttons, etc.
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <section className="ss-page-header">
      <div className="container">
        <h1 className="ss-page-header__title">{title}</h1>
        {subtitle && <p className="ss-page-header__subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
