import Image from "next/image";
import Link from "next/link";

const guide = {
  title: "Spring 2024 Art Guide — Top Exhibitions in New York",
  excerpt: "Seven shows from Chelsea to the LES, mapped with walking trails and app-exclusive reminders.",
  image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80",
  locations: ["Whitespace", "MoMA PS1", "Pace"],
};

export function GuideHighlight() {
  return (
    <section className="container grid gap-8 rounded-3xl border border-border-soft bg-white/80 p-8 shadow-card lg:grid-cols-2">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-rust">Weekend guide</p>
        <h2 className="text-3xl font-semibold text-brand-charcoal">{guide.title}</h2>
        <p className="text-base text-text-muted">{guide.excerpt}</p>
        <ul className="flex flex-wrap gap-3 text-sm text-text-muted">
          {guide.locations.map((location) => (
            <li key={location} className="rounded-full border border-border-soft px-4 py-1">
              {location}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link href="/guides" className="rounded-full bg-brand-charcoal px-5 py-2 text-sm font-semibold text-white">
            Save places
          </Link>
          <Link href="/map" className="rounded-full border border-border-soft px-5 py-2 text-sm font-semibold text-brand-charcoal">
            Open map
          </Link>
        </div>
      </div>
      <div className="relative aspect-4/3 rounded-2xl">
        <Image src={guide.image} alt={guide.title} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
      </div>
    </section>
  );
}
