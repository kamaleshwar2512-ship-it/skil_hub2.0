/**
 * SectionRow — Reusable horizontal-scroll section for the Dashboard.
 *
 * Props:
 *  - title: string (required) — section heading
 *  - subtitle: string (optional) — small descriptor below title
 *  - icon: string (optional) — emoji icon for the section
 *  - ctaLabel: string (optional) — call-to-action link text
 *  - ctaTo: string (optional) — route for CTA link
 *  - loading: bool — show skeleton placeholders
 *  - empty: node — JSX to show when there's nothing to display
 *  - children: card nodes displayed in the horizontal scroll row
 */
import { Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

export default function SectionRow({
  title,
  subtitle,
  icon,
  ctaLabel,
  ctaTo,
  loading = false,
  empty,
  children,
}) {
  return (
    <ErrorBoundary>
      <section className="section-row animate-fade-in-up">
        {/* Header */}
        <div className="section-row-header">
          <div>
            <div className="section-row-title">
              {icon && <span>{icon}</span>}
              <span>{title}</span>
            </div>
            {subtitle && (
              <p className="section-row-subtitle">{subtitle}</p>
            )}
          </div>
          {ctaLabel && ctaTo && (
            <Link to={ctaTo} className="section-row-cta">
              {ctaLabel} →
            </Link>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="section-row-scroll">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="discovery-card animate-pulse"
                style={{ height: 180, background: 'var(--color-border)', borderRadius: 'var(--radius-xl)' }}
              />
            ))}
          </div>
        ) : !children || (Array.isArray(children) && children.length === 0) ? (
          <div className="card text-center text-secondary" style={{ padding: '2rem' }}>
            {empty ?? 'Nothing to show here yet.'}
          </div>
        ) : (
          <div className="section-row-scroll">
            {children}
          </div>
        )}
      </section>
    </ErrorBoundary>
  );
}
