import Image from "next/image";
import Link from "next/link";

const heroReview = {
  title: "Fragments of Memory — Whitespace Gallery",
  excerpt:
    "A layered study of displacement and belonging told through immersive installations curated by Sophie Anderson.",
  author: "Eva Gorobets",
  tag: "Review of the Week",
  image:
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1400&q=80",
};

export function HeroFeature() {
  return (
    <section className="container grid gap-8 py-12 lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-rust">
          {heroReview.tag}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-brand-charcoal lg:text-5xl">
          {heroReview.title}
        </h1>
        <p className="text-lg text-text-muted">{heroReview.excerpt}</p>
        <p className="text-sm font-semibold text-brand-charcoal">By {heroReview.author}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/reviews/fragments-of-memory"
            className="rounded-full bg-brand-rust px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition hover:bg-brand-flame"
          >
            Read review
          </Link>
          <Link
            href="/guides"
            className="rounded-full border border-brand-rust px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brand-rust"
          >
            Weekend guide
          </Link>
        </div>
      </div>
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-card">
        <Image
          src={heroReview.image}
          alt={heroReview.title}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}
