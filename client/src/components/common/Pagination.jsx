import './Pagination.css';

// Builds [1, '…', 4, 5, 6, '…', 12]: first, last and the pages around the current one.
function buildPages(page, total) {
  const wanted = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const items = [];
  wanted.forEach((n, index) => {
    if (index > 0 && n - wanted[index - 1] > 1) items.push(`gap-${n}`);
    items.push(n);
  });
  return items;
}

/** Bootstrap pagination bar. Renders nothing when there is only one page. */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="ss-pagination">
      <ul className="pagination justify-content-center flex-wrap mb-0">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)} disabled={page === 1}>
            <i className="bi bi-chevron-left" /> <span className="d-none d-sm-inline">Previous</span>
          </button>
        </li>

        {buildPages(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <li className="page-item disabled" key={item}>
              <span className="page-link">…</span>
            </li>
          ) : (
            <li className={`page-item ${item === page ? 'active' : ''}`} key={item}>
              <button
                type="button"
                className="page-link"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          )
        )}

        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
          >
            <span className="d-none d-sm-inline">Next</span> <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
