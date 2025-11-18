import Link from "next/link";

const PRIMARY_LINKS = [
  {heading: "About", items: [{label: "About Us", href: "/about"}, {label: "Contacts", href: "/contact"}]},
  {heading: "Partners", items: [{label: "For Galleries", href: "/for-galleries"}, {label: "For Art Events", href: "/for-events"}]},
  {heading: "Explore", items: [{label: "Reviews", href: "/reviews"}, {label: "Guides", href: "/guides"}, {label: "Map", href: "/map"}]},
];

const SOCIAL_LINKS = [
  {label: "Instagram", href: "https://instagram.com/artflaneur"},
  {label: "LinkedIn", href: "https://linkedin.com/company/artflaneur"},
  {label: "YouTube", href: "https://youtube.com"},
];

const APP_STORE_LINKS = [
  {href: "https://apps.apple.com", label: "Download on App Store"},
  {href: "https://play.google.com", label: "Get it on Google Play"},
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border-soft bg-surface-card pt-12">
      <div className="container grid gap-10 pb-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-rust">
              Art Flaneur
            </p>
            <p className="mt-2 max-w-sm text-sm text-text-muted">
              Contemporary art reviews, weekend guides, ambassadors, and data-backed partnerships for galleries and events.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Subscribe to newsletter
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-border-soft px-4 py-2 text-sm"
              />
              <button className="rounded-full bg-brand-charcoal px-5 text-sm font-semibold text-white transition hover:bg-brand-rust">
                Join
              </button>
            </div>
          </div>
        </div>

        {PRIMARY_LINKS.map((section) => (
          <div key={section.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {section.heading}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-text-primary transition hover:text-brand-cobalt"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container flex flex-col gap-6 border-t border-border-soft py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          {SOCIAL_LINKS.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="hover:text-brand-cobalt">
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {APP_STORE_LINKS.map((store) => (
            <a
              key={store.label}
              href={store.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border-soft px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-primary transition hover:border-brand-cobalt hover:text-brand-cobalt"
            >
              {store.label}
            </a>
          ))}
        </div>
      </div>
      <div className="container flex flex-wrap items-center justify-between border-t border-border-soft py-4 text-xs text-text-muted">
        <span>© {new Date().getFullYear()} Art Flaneur Media</span>
        <div className="flex gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
