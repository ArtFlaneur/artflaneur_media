import Link from "next/link";

const reviews = [
  {
    title: "Digital Horizons: Akira Tanaka",
    gallery: "Arte Moderna",
    date: "March 20, 2024",
    score: "4.5/5",
  },
  {
    title: "The Surface Tension of Light",
    gallery: "Neue Raum Berlin",
    date: "March 18, 2024",
    score: "4/5",
  },
  {
    title: "Metropolis Reimagined",
    gallery: "Whitechapel",
    date: "March 12, 2024",
    score: "5/5",
  },
];

export function LatestReviews() {
  return (
    <section className="container py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Latest reviews</p>
          <h2 className="text-2xl font-semibold text-brand-charcoal">Fresh perspectives published this week</h2>
        </div>
        <Link href="/reviews" className="text-sm font-semibold text-brand-cobalt">
          View all
        </Link>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.title} className="space-y-4 rounded-2xl border border-border-soft bg-white/80 p-5 shadow-card-soft">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-muted">
              <span>{review.gallery}</span>
              <span>{review.date}</span>
            </div>
            <h3 className="text-lg font-semibold leading-tight text-brand-charcoal">{review.title}</h3>
            <p className="text-sm text-text-muted">Score: {review.score}</p>
            <Link href="/reviews" className="text-sm font-semibold text-brand-rust">
              Read review →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
