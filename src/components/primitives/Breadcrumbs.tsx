// Breadcrumbs (owner's request, DESIGN.md): each step is a 16px icon and its name, separated by a chevron.
// Earlier steps are links in --text-2 that turn --text-1 on hover; the current page is --text-1, not a link.
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type Crumb = { label: string; to?: string; icon?: ReactNode };

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", color: "var(--text-3)" }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="kcrumbs">
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          const body = (
            <>
              {c.icon ? <span className="kcrumb-ic">{c.icon}</span> : null}
              <span className="kcrumb-t">{c.label}</span>
            </>
          );
          return (
            <li key={`${i}-${c.label}`}>
              {last || !c.to ? (
                <span className="kcrumb kcrumb-now" aria-current={last ? "page" : undefined}>
                  {body}
                </span>
              ) : (
                <Link to={c.to} className="kcrumb">
                  {body}
                </Link>
              )}
              {last ? null : <Chevron />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
