import Link from "next/link";

export function ChatbotTeaser() {
  return (
    <section className="container grid gap-8 rounded-3xl border border-brand-rust bg-brand-bone/80 p-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-rust">AI concierge</p>
        <h2 className="text-3xl font-semibold text-brand-charcoal">Meet the Art Flaneur chatbot</h2>
        <p className="text-base text-text-muted">
          Ask for openings tonight, craft a weekend trail, or get sponsor-friendly analytics. Exclusive to the mobile app—pre-release testers report 2× faster planning.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/app" className="rounded-full bg-brand-rust px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white">
            Tell me more
          </Link>
          <Link href="/for-galleries" className="rounded-full border border-brand-rust px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-rust">
            For partners
          </Link>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-rust">On app only</p>
      </div>
  <div className="rounded-2xl bg-linear-to-br from-brand-cobalt via-brand-flame to-brand-amber p-6 text-white shadow-card">
        <div className="rounded-2xl border border-white/40 bg-white/10 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.4em]">Preview</p>
          <p className="mt-6 text-lg font-semibold">
            “Suggest three immersive shows in Chelsea this Friday and add them to my planner.”
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <div className="rounded-xl bg-white/15 px-4 py-3">
              Bot → Adds “Fragments of Memory”, “Digital Horizons”, and “Subterranean Bloom” to NYC trail.
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              Bot → Sends sponsor badge analytics to gallery dashboard.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
