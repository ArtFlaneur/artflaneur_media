import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
} from 'lucide-react';
import { ArticleCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import { GALLERY_QUERY } from '../sanity/lib/queries';
import { GALLERY_QUERYResult } from '../sanity/types';
import { Article, ContentType } from '../types';
import { directusClient } from '../lib/directus';
import { formatWorkingHoursSchedule, getDisplayDomain } from '../lib/formatters';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80';

const buildGoogleMapsLink = (gallery: GALLERY_QUERYResult | null) => {
  if (!gallery) return undefined;
  if (gallery.location?.lat && gallery.location?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${gallery.location.lat},${gallery.location.lng}`;
  }
  if (gallery.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gallery.address)}`;
  }
  return undefined;
};

const buildHeroImage = (gallery: GALLERY_QUERYResult | null) => {
  if (!gallery) return FALLBACK_IMAGE;
  if (gallery.directusImageFile) {
    try {
      return directusClient.getImageUrl(gallery.directusImageFile, { width: 1600, quality: 85 });
    } catch (error) {
      console.warn('Failed to build Directus gallery image URL', error);
    }
  }
  return gallery.mainImage?.asset?.url ?? FALLBACK_IMAGE;
};

const mapReviewToArticle = (review: NonNullable<GALLERY_QUERYResult>['reviews'][number]): Article => ({
  id: review._id,
  slug: review.slug?.current ?? review._id,
  type: ContentType.REVIEW,
  title: review.title ?? 'Untitled review',
  subtitle: review.excerpt ?? undefined,
  image: review.mainImage?.asset?.url ?? `https://picsum.photos/seed/${review._id}/600/600`,
  date: review.publishedAt ?? undefined,
  author: review.author
    ? {
        id: review.author._id,
        slug: review.author.slug?.current ?? review.author._id,
        name: review.author.name ?? 'Contributor',
        role: 'Ambassador',
        image: review.author.photo?.asset?.url ?? '',
      }
    : undefined,
});

const GalleryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<GALLERY_QUERYResult>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      if (!id) {
        setError('Missing gallery identifier.');
        setLoading(false);
        return;
      }

      try {
        const data = await client.fetch<GALLERY_QUERYResult>(GALLERY_QUERY, { slug: id });
        if (!isMounted) return;
        setGallery(data ?? null);
        setError(data ? null : 'Gallery not found.');
      } catch (err) {
        console.error('❌ Error fetching gallery:', err);
        if (!isMounted) return;
        setError('Unable to load this gallery right now.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const workingHours = formatWorkingHoursSchedule(gallery?.workingHours);
  const mapsLink = useMemo(() => buildGoogleMapsLink(gallery), [gallery]);
  const relatedReviews = useMemo(() => (gallery?.reviews ?? []).map(mapReviewToArticle), [gallery?.reviews]);
  const galleryDescription = gallery?.description?.trim();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-art-paper">
        <p className="font-mono text-sm uppercase tracking-[0.3em]">Loading gallery…</p>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-art-paper flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em]">{error ?? 'Gallery not found'}</p>
          <Link
            to="/galleries"
            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Back to galleries
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = buildHeroImage(gallery);
  const locationLabel = [gallery.city, gallery.country].filter(Boolean).join(', ');

  const contactItems = [
    gallery.address && {
      icon: MapPin,
      label: 'Visit',
      value: gallery.address,
      href: mapsLink,
    },
    gallery.contact?.phone && {
      icon: Phone,
      label: 'Phone',
      value: gallery.contact.phone,
      href: `tel:${gallery.contact.phone}`,
    },
    gallery.contact?.email && {
      icon: Mail,
      label: 'Email',
      value: gallery.contact.email,
      href: `mailto:${gallery.contact.email}`,
    },
    gallery.website && {
      icon: Globe,
      label: 'Website',
      value: getDisplayDomain(gallery.website) ?? gallery.website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      href: gallery.website,
    },
  ].filter(Boolean) as Array<{
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
  }>;

  const socialLinks = [
    gallery.social?.instagram && { label: 'Instagram', icon: Instagram, href: gallery.social.instagram },
    gallery.social?.facebook && { label: 'Facebook', icon: Facebook, href: gallery.social.facebook },
    gallery.social?.twitter && { label: 'Twitter', icon: Twitter, href: gallery.social.twitter },
  ].filter(Boolean) as Array<{ label: string; icon: typeof Instagram; href: string }>;

  return (
    <div className="bg-art-paper min-h-screen">
      <section className="relative h-[60vh] border-b-2 border-black">
        <img src={heroImage} alt={gallery.name ?? 'Gallery'} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 text-white">
          {locationLabel && (
            <p className="font-mono text-xs uppercase tracking-[0.4em] mb-4">{locationLabel}</p>
          )}
          <h1 className="text-4xl md:text-7xl font-black uppercase leading-[0.9]">{gallery.name ?? 'Gallery'}</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Details sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="border-2 border-black bg-white p-6 space-y-8 sticky top-24">
              <div>
                <h3 className="font-black uppercase text-sm tracking-[0.3em] mb-3">Visit</h3>
                <div className="space-y-4">
                  {contactItems.length ? (
                    contactItems.map(({ icon: Icon, label, value, href }) => (
                      <div key={label} className="flex gap-3">
                        <Icon className="w-4 h-4 mt-1" />
                        <div>
                          <p className="font-mono text-[10px] uppercase text-gray-500">{label}</p>
                          {href ? (
                            <a href={href} target="_blank" rel="noreferrer" className="font-bold hover:underline">
                              {value}
                            </a>
                          ) : (
                            <p className="font-bold">{value}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="font-mono text-xs text-gray-500">Contact details coming soon.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-black uppercase text-sm tracking-[0.3em] mb-3">Hours</h3>
                {workingHours.length ? (
                  <ul className="font-mono text-xs space-y-1">
                    {workingHours.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-xs text-gray-500">Opening hours available soon.</p>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div>
                  <h3 className="font-black uppercase text-sm tracking-[0.3em] mb-3">Social</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 border border-black font-mono text-xs uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        <link.icon className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Body content */}
          <section className="lg:col-span-8 order-1 lg:order-2 space-y-12">
            {galleryDescription && (
              <div className="border-2 border-black bg-white p-8">
                <p className="font-serif text-2xl md:text-3xl leading-relaxed">{galleryDescription}</p>
              </div>
            )}

            {/* Exhibitions */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-3">
                <h2 className="text-3xl font-black uppercase">Current & Recent Exhibitions</h2>
                <Link to="/exhibitions" className="font-mono text-xs uppercase flex items-center gap-2 hover:underline">
                  See all
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              {gallery.exhibitions?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gallery.exhibitions.map((exhibition) => (
                    <Link
                      key={exhibition._id}
                      to={`/exhibitions/${exhibition.slug?.current ?? exhibition._id}`}
                      className="group border-2 border-black bg-white hover:-translate-y-1 transition-all"
                    >
                      <div className="aspect-[4/3] border-b-2 border-black overflow-hidden">
                        <img
                          src={exhibition.image?.asset?.url ?? `https://picsum.photos/seed/${exhibition._id}/800/600`}
                          alt={exhibition.title ?? 'Exhibition'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-5 space-y-2">
                        <p className="font-mono text-xs uppercase text-gray-500">
                          {exhibition.startDate ?? 'TBA'} — {exhibition.endDate ?? 'TBA'}
                        </p>
                        <h3 className="text-xl font-black uppercase leading-tight">{exhibition.title ?? 'Untitled exhibition'}</h3>
                        <p className="font-mono text-sm text-gray-600 line-clamp-2">
                          {exhibition.description ?? 'Details coming soon.'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                  Exhibitions will appear here once scheduled.
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-3">
                <h2 className="text-3xl font-black uppercase">Featured Reviews</h2>
                <Link to="/reviews" className="font-mono text-xs uppercase flex items-center gap-2 hover:underline">
                  Read more
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              {relatedReviews.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedReviews.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                  No reviews yet. Check back soon for ambassador perspectives.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
