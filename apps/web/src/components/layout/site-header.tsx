"use client";

import Link from "next/link";
import {useState} from "react";

const NAV_ITEMS = [
  {href: "/reviews", label: "Reviews"},
  {href: "/ambassadors", label: "Ambassadors"},
  {href: "/artists", label: "Artists"},
  {href: "/guides", label: "Guides"},
  {href: "/map", label: "Map"},
];

const APP_STORE_LINKS = [
  {href: "https://apps.apple.com", label: "App Store"},
  {href: "https://play.google.com", label: "Google Play"},
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-surface-card/90 backdrop-blur-lg">
      <div className="container flex h-20 items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-md bg-brand-rust px-3 py-1 text-sm font-semibold uppercase tracking-widest text-white">
              AF
            </span>
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              Art Flaneur
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border-soft px-4 py-1.5 text-sm font-medium text-text-primary lg:hidden"
            aria-label="Open navigation"
          >
            Menu
          </button>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-muted transition hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div className="relative">
            <input
              type="search"
              placeholder="Search reviews, guides, artists"
              className="w-64 rounded-full border border-border-soft px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-cobalt focus:outline-none"
            />
          </div>
          <button className="rounded-full border border-border-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            City: Global
          </button>
          <div className="flex gap-2">
            {APP_STORE_LINKS.map((store) => (
              <a
                key={store.href}
                href={store.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-brand-charcoal px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-rust"
              >
                {store.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-40 w-80 max-w-[90%] border-l border-border-soft bg-surface-card p-6 shadow-card">
            <button
              className="mb-6 flex w-full items-center justify-between rounded-full border border-border-soft px-4 py-2 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
            >
              Close
              <span aria-hidden>×</span>
            </button>

            <nav className="flex flex-col gap-4 text-lg font-semibold">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 space-y-4">
              <input
                type="search"
                placeholder="Search Art Flaneur"
                className="w-full rounded-2xl border border-border-soft px-4 py-3 text-sm"
              />
              <button className="w-full rounded-full border border-border-soft px-4 py-2 text-sm font-semibold">
                City: Global
              </button>
              <div className="flex flex-wrap gap-2">
                {APP_STORE_LINKS.map((store) => (
                  <a
                    key={store.href}
                    href={store.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full bg-brand-charcoal px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    {store.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
