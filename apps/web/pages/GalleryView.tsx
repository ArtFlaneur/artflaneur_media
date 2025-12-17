import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Globe, ExternalLink } from 'lucide-react';
import {
  fetchExhibitionsByGallery,
  fetchGalleryById,
  GraphqlExhibition,
  GraphqlGallery,
} from '../lib/graphql';
import { formatWorkingHoursSchedule, getDisplayDomain } from '../lib/formatters';
import SecureImage from '../components/SecureImage';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80';

const parseCoordinate = (value?: string | number | null): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildGoogleMapsLink = (gallery: GraphqlGallery | null) => {
  if (!gallery) return undefined;

  const lat = parseCoordinate(gallery.lat);
  const lon = parseCoordinate(gallery.lon);

  if (lat !== null && lon !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }

  if (gallery.fulladdress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gallery.fulladdress)}`;
  }

  return undefined;
};

const buildHeroImage = (gallery: GraphqlGallery | null) => {
  if (!gallery) return FALLBACK_IMAGE;
  return gallery.gallery_img_url ?? gallery.logo_img_url ?? FALLBACK_IMAGE;
};

const normalizeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : 'TBA';

const GalleryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<GraphqlGallery | null>(null);
  const [exhibitions, setExhibitions] = useState<GraphqlExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      if (!id) {
        setError('Missing gallery identifier.');
        setGallery(null);
        setExhibitions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [galleryData, exhibitionsData] = await Promise.all([
          fetchGalleryById(id),
          fetchExhibitionsByGallery(id, 12),
        ]);

        if (!isMounted) return;

        if (!galleryData) {
          setGallery(null);
          setExhibitions([]);
          setError('Gallery not found.');
        } else {
          setGallery(galleryData);
          setExhibitions(exhibitionsData ?? []);
          setError(null);
        }
      } catch (err) {
        console.error('❌ Error fetching gallery:', err);
        if (!isMounted) return;
        setGallery(null);
        setExhibitions([]);
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

  const workingHours = useMemo(() => formatWorkingHoursSchedule(gallery?.openinghours), [gallery?.openinghours]);
  const mapsLink = useMemo(() => buildGoogleMapsLink(gallery), [gallery]);
  const galleryDescription = gallery?.specialevent?.trim() ?? null;

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
    gallery.fulladdress && {
      icon: MapPin,
      label: 'Visit',
      value: gallery.fulladdress,
      href: mapsLink,
    },
    gallery.placeurl && {
      icon: Globe,
      label: 'Website',
      value:
        getDisplayDomain(gallery.placeurl) ?? gallery.placeurl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      href: normalizeUrl(gallery.placeurl),
    },
  ].filter(Boolean) as Array<{
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
  }>;

  return (
    <div className="bg-art-paper min-h-screen">
      <section className="relative h-[60vh] border-b-2 border-black">
        <SecureImage
          src={heroImage}
          alt={gallery.galleryname ?? 'Gallery'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 text-white">
          {locationLabel && (
            <p className="font-mono text-xs uppercase tracking-[0.4em] mb-4">{locationLabel}</p>
          )}
          <h1 className="text-4xl md:text-7xl font-black uppercase leading-[0.9]">
            {gallery.galleryname ?? 'Gallery'}
          </h1>
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
                  <p className="font-mono text-xs text-gray-500">
                    {gallery.openinghours?.trim() ?? 'Opening hours available soon.'}
                  </p>
                )}
              </div>
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
              {exhibitions.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {exhibitions.map((exhibition) => (
                    <Link
                      key={exhibition.id}
                      to={`/exhibitions/${exhibition.id}`}
                      className="group border-2 border-black bg-white hover:-translate-y-1 transition-all"
                    >
                      <div className="aspect-[4/3] border-b-2 border-black overflow-hidden">
                        <SecureImage
                          src={
                            exhibition.exhibition_img_url ??
                            exhibition.logo_img_url ??
                            `https://picsum.photos/seed/${exhibition.id}/800/600`
                          }
                          alt={exhibition.title ?? 'Exhibition'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-5 space-y-2">
                        <p className="font-mono text-xs uppercase text-gray-500">
                          {formatDate(exhibition.datefrom)} — {formatDate(exhibition.dateto)}
                        </p>
                        <h3 className="text-xl font-black uppercase leading-tight">
                          {exhibition.title ?? 'Untitled exhibition'}
                        </h3>
                        <p className="font-mono text-sm text-gray-600 line-clamp-2">
                          {exhibition.description ?? exhibition.eventtype ?? 'Details coming soon.'}
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
