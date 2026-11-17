/** Title row at the top of every admin page. Buttons passed as children appear on the right. */
export default function AdminPageHeader({ title, subtitle, children }) {
  return (
    <div className="ss-admin-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
