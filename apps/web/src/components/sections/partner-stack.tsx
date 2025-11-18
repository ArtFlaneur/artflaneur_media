import Link from "next/link";

const partnerBlocks = [
  {
    title: "For Galleries",
    description: "Feature shows, embed analytics, and drive footfall with sponsor-ready performance dashboards.",
    href: "/for-galleries",
    badge: "Beta access",
  },
  {
    title: "For Art Events",
    description: "Highlight programs on the Map trail, capture visitor intent, and unlock post-event insights.",
    href: "/for-events",
    badge: "Request demo",
  },
];

export function PartnerStack() {
  return (
    <section className="container py-16">
      <div className="rounded-3xl border border-border-soft bg-surface-card p-8 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-rust">Partners</p>
            <h2 className="text-3xl font-semibold text-brand-charcoal">Data transparency for galleries & events</h2>
          </div>
          <Link href="/for-galleries" className="rounded-full border border-brand-rust px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-rust">
            View packages
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {partnerBlocks.map((block) => (
            <article key={block.title} className="rounded-2xl border border-border-soft bg-white/80 p-6 shadow-card-soft">
              <span className="inline-flex items-center rounded-full bg-brand-bone px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-rust">
                {block.badge}
              </span>
              <h3 className="mt-4 text-2xl font-semibold text-brand-charcoal">{block.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{block.description}</p>
              <Link href={block.href} className="mt-6 inline-flex items-center text-sm font-semibold text-brand-cobalt">
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
