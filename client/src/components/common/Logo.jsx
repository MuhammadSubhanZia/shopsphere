/**
 * ShopSphere logo mark + wordmark.
 * `light` renders the wordmark in white for dark backgrounds (footer).
 */
export default function Logo({ size = 34, withText = true, light = false }) {
  return (
    <span className="ss-logo d-inline-flex align-items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle cx="32" cy="32" r="30" fill="#ff5a36" />
        <g fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.9">
          <path d="M10 22c13-6 31-6 44 0" />
          <path d="M7 34h50" />
          <path d="M10 46c13 6 31 6 44 0" />
        </g>
      </svg>
      {withText && (
        <span
          className="font-display fw-bold"
          style={{ fontSize: size * 0.62, letterSpacing: '-0.03em', color: light ? '#fff' : 'var(--ss-ink)' }}
        >
          Shop<span style={{ color: 'var(--ss-accent)' }}>Sphere</span>
        </span>
      )}
    </span>
  );
}
