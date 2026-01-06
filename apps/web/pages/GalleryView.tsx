import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Globe, ExternalLink } from 'lucide-react';
import {
  fetchExhibitionsByGalleryAll,
  fetchHistoricalExhibitionsByGalleryIdAll,
  fetchHistoricalExhibitionsByGalleryNameAll,
  fetchGalleryById,
  isGalleryExcluded,
  GraphqlExhibition,
  GraphqlGallery,
} from '../lib/graphql';
import { buildExhibitionSlug, formatWorkingHoursSchedule, getAppDownloadLink, getDisplayDomain } from '../lib/formatters';
import SecureImage from '../components/SecureImage';
import { useSeo } from '../lib/useSeo';

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

const buildHeroImage = (gallery: GraphqlGallery | null) => {
  if (!gallery) return FALLBACK_IMAGE;
  return gallery.gallery_img_url ?? gallery.logo_img_url ?? FALLBACK_IMAGE;
};

const normalizeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);

const slugifyName = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildGallerySlug = (gallery: GraphqlGallery) => {
  const nameSlug = gallery.galleryname ? slugifyName(gallery.galleryname) : '';
  return nameSlug ? `${nameSlug}-${gallery.id}` : String(gallery.id);
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : 'TBA';

const toEpochSeconds = (value?: string | null): number | null => {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
};

const normalizeEpochSeconds = (value?: number | string | null): number | null => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;

  // Some API fields can be in milliseconds. Seconds are ~1.7e9 (2025), ms are ~1.7e12.
  if (numeric > 10_000_000_000) {
    return Math.floor(numeric / 1000);
  }

  return Math.floor(numeric);
};

const formatEpochDate = (epochSeconds?: number | null) => {
  if (!epochSeconds) return 'TBA';
  const ms = epochSeconds * 1000;
  return Number.isFinite(ms) ? new Date(ms).toLocaleDateString('en-US', DATE_FORMAT) : 'TBA';
};

const formatExhibitionDate = (exhibition: GraphqlExhibition, which: 'start' | 'end') => {
  const iso = which === 'start' ? exhibition.datefrom : exhibition.dateto;
  if (iso) return formatDate(iso);

  const epochRaw = which === 'start' ? exhibition.datefrom_epoch : exhibition.dateto_epoch;
  const epochSeconds = normalizeEpochSeconds(epochRaw);
  return formatEpochDate(epochSeconds);
};

const mergeUniqueExhibitions = (existing: GraphqlExhibition[], incoming: GraphqlExhibition[]) => {
  if (!incoming.length) return existing;
  const byId = new Map<string, GraphqlExhibition>();
  existing.forEach((item) => {
    if (item?.id) byId.set(item.id, item);
  });
  incoming.forEach((item) => {
    if (item?.id && !byId.has(item.id)) {
      byId.set(item.id, item);
    }
  });
  return Array.from(byId.values());
};

const GalleryView: React.FC = () => {
  const { id: slugParam } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<GraphqlGallery | null>(null);
  const [exhibitions, setExhibitions] = useState<GraphqlExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract the gallery ID from slug (format: "gallery-name-id" or just "id")
  const galleryId = useMemo(() => {
    if (!slugParam) return null;
    // If slug contains dashes, the ID is the last segment
    const parts = slugParam.split('-');
    const lastPart = parts[parts.length - 1];
    // Check if lastPart is numeric (the ID)
    if (/^\d+$/.test(lastPart)) {
      return lastPart;
    }
    // If no numeric suffix, assume the whole slug is the ID (for backwards compatibility)
    return slugParam;
  }, [slugParam]);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      if (!galleryId) {
        setError('Missing gallery identifier.');
        setGallery(null);
        setExhibitions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadingHistorical(false);
        const [galleryData, exhibitionsData] = await Promise.all([
          fetchGalleryById(galleryId),
          fetchExhibitionsByGalleryAll(galleryId),
        ]);

        if (!isMounted) return;

        if (!galleryData) {
          setGallery(null);
          setExhibitions([]);
          setError('Gallery not found.');
        } else if (isGalleryExcluded(galleryData)) {
          // Don't show excluded galleries (not allowed or temporary venues)
          setGallery(null);
          setExhibitions([]);
          setError('This gallery is not available.');
        } else {
          setGallery(galleryData);
          setExhibitions(exhibitionsData ?? []);
          setError(null);

          // Load historical exhibitions in the background so the page can render quickly.
          const targetGalleryName = galleryData.galleryname?.trim();
          if (targetGalleryName) {
            const schedule = (callback: () => void) => {
              const win = window as unknown as {
                requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
              };
              if (typeof win.requestIdleCallback === 'function') {
                win.requestIdleCallback(callback, { timeout: 1500 });
              } else {
                window.setTimeout(callback, 50);
              }
            };

            schedule(() => {
              if (!isMounted) return;
              setLoadingHistorical(true);

              (async () => {
                let historical: GraphqlExhibition[] = [];
                try {
                  historical = await fetchHistoricalExhibitionsByGalleryIdAll(galleryId);
                } catch (err) {
                  console.warn(
                    '⚠️ listHistoricalExhibitionsByGalleryId failed; falling back to listAllHistoricalExhibitions scan',
                    err,
                  );
                  historical = await fetchHistoricalExhibitionsByGalleryNameAll(targetGalleryName);
                }

                if (historical.length && isMounted) {
                  setExhibitions((prev) => mergeUniqueExhibitions(prev, historical));
                }

                if (isMounted) setLoadingHistorical(false);
              })().catch((err) => {
                console.error('❌ Error fetching historical exhibitions:', err);
                if (isMounted) setLoadingHistorical(false);
              });
            });
          }
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
  }, [galleryId]);

  const workingHours = useMemo(() => formatWorkingHoursSchedule(gallery?.openinghours), [gallery?.openinghours]);
  const appDownloadLink = useMemo(() => getAppDownloadLink(), []);
  const heroImage = useMemo(() => buildHeroImage(gallery), [gallery]);
  const locationLabel = useMemo(() => [gallery?.city, gallery?.country].filter(Boolean).join(', '), [gallery]);

  const claimGalleryUrl = useMemo(() => {
    if (!galleryId) return '/gallery-login?mode=register';

    const params = new URLSearchParams();
    params.set('mode', 'register');
    params.set('claimGalleryId', galleryId);
    if (gallery?.galleryname) params.set('claimGalleryName', gallery.galleryname);
    if (gallery?.city) params.set('claimGalleryCity', gallery.city);
    if (gallery?.country) params.set('claimGalleryCountry', gallery.country);
    return `/gallery-login?${params.toString()}`;
  }, [gallery?.city, gallery?.country, gallery?.galleryname, galleryId]);

  const { currentAndFutureExhibitions, pastExhibitions } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);

    const getStart = (exhibition: GraphqlExhibition) =>
      normalizeEpochSeconds(exhibition.datefrom_epoch) ?? toEpochSeconds(exhibition.datefrom);
    const getEnd = (exhibition: GraphqlExhibition) =>
      normalizeEpochSeconds(exhibition.dateto_epoch) ?? toEpochSeconds(exhibition.dateto) ?? getStart(exhibition);

    const isPast = (exhibition: GraphqlExhibition) => {
      const end = getEnd(exhibition);
      return end !== null ? end < now : false;
    };

    const currentFuture = exhibitions.filter((exhibition) => !isPast(exhibition));
    const past = exhibitions.filter(isPast);

    currentFuture.sort((a, b) => {
      const aStart = getStart(a) ?? Number.POSITIVE_INFINITY;
      const bStart = getStart(b) ?? Number.POSITIVE_INFINITY;
      return aStart - bStart;
    });

    past.sort((a, b) => {
      const aEnd = getEnd(a) ?? 0;
      const bEnd = getEnd(b) ?? 0;
      return bEnd - aEnd;
    });

    return {
      currentAndFutureExhibitions: currentFuture,
      pastExhibitions: past,
    };
  }, [exhibitions]);
  
  // Only use specialevent as description if it's not just "yes"/"no" flags
  const rawDescription = gallery?.specialevent?.trim() ?? null;
  const galleryDescription = rawDescription && 
    !['yes', 'no'].includes(rawDescription.toLowerCase()) 
    ? rawDescription 
    : null;

  useSeo({
    title: gallery?.galleryname
      ? `${gallery.galleryname} | Art Flaneur`
      : error
        ? 'Gallery not found | Art Flaneur'
        : 'Gallery | Art Flaneur',
    description: gallery?.galleryname
      ? `${gallery.galleryname}${locationLabel ? ` — ${locationLabel}` : ''}. ${galleryDescription ?? 'Discover exhibitions, details and directions.'}`
      : 'Gallery details on Art Flaneur.',
    imageUrl: heroImage,
    canonicalUrl: gallery ? `https://www.artflaneur.art/galleries/${buildGallerySlug(gallery)}` : undefined,
    ogType: 'website',
    jsonLd: gallery?.galleryname
      ? {
          '@context': 'https://schema.org',
          '@type': 'ArtGallery',
          name: gallery.galleryname,
          url: `https://www.artflaneur.art/galleries/${buildGallerySlug(gallery)}`,
          image: heroImage,
          sameAs: gallery.placeurl ? [gallery.placeurl] : undefined,
          address: gallery.fulladdress
            ? {
                '@type': 'PostalAddress',
                streetAddress: gallery.fulladdress,
              }
            : undefined,
          geo:
            parseCoordinate(gallery.lat) !== null && parseCoordinate(gallery.lon) !== null
              ? {
                  '@type': 'GeoCoordinates',
                  latitude: parseCoordinate(gallery.lat) as number,
                  longitude: parseCoordinate(gallery.lon) as number,
                }
              : undefined,
        }
      : undefined,
  });

  useEffect(() => {
    if (!gallery || !slugParam) return;
    const desiredSlug = buildGallerySlug(gallery);

    // If the user landed on the legacy /galleries/:id route, replace it with the name-based slug.
    if (slugParam === String(gallery.id) && desiredSlug !== slugParam) {
      const nextPath = `/galleries/${desiredSlug}${window.location.search ?? ''}`;
      window.history.replaceState(null, '', nextPath);
    }
  }, [gallery, slugParam]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

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

  const contactItems = [
    gallery.fulladdress && {
      icon: MapPin,
      value: gallery.fulladdress,
      href: appDownloadLink,
    },
    gallery.placeurl && {
      icon: Globe,
      value:
        getDisplayDomain(gallery.placeurl) ?? gallery.placeurl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      href: normalizeUrl(gallery.placeurl),
    },
  ].filter(Boolean) as Array<{
    icon: typeof MapPin;
    value: string;
    href?: string;
  }>;

  return (
    <div className="bg-art-paper min-h-screen select-none" onContextMenu={(e) => e.preventDefault()}>
      <section className="relative h-[60vh] border-b-2 border-black overflow-hidden">
        {/* Main image with cover fit */}
        <SecureImage
          src={heroImage}
          alt={gallery.galleryname ?? 'Gallery'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Blur overlay to soften low-quality images */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
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
            <div className="border-2 border-black bg-white p-6 sticky top-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black uppercase text-lg mb-6 border-b-2 border-black pb-2">Details</h4>
              <div className="space-y-8">
                <div>
                  <div className="space-y-4">
                  {contactItems.length ? (
                    contactItems.map(({ icon: Icon, value, href }) => (
                      <div key={href ?? value} className="flex gap-3">
                        <Icon className="w-4 h-4 mt-1" />
                        <div>
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

                  <a
                    href={appDownloadLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-between w-full gap-3 px-4 py-3 border border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    aria-label="Follow this gallery in the Art Flaneur app"
                  >
                    Follow
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <Link
                    to={claimGalleryUrl}
                    className="mt-3 inline-flex items-center justify-between w-full gap-3 px-4 py-3 border border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    aria-label="Open the claim your gallery form"
                  >
                    Claim
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
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
              <div className="mb-6 border-b-2 border-black pb-3">
                <h2 className="text-3xl font-black uppercase">Current and Future exhibitions</h2>
              </div>
              {currentAndFutureExhibitions.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentAndFutureExhibitions.map((exhibition) => (
                    <div
                      key={exhibition.id}
                      className="group border-2 border-black bg-white hover:-translate-y-1 transition-all"
                    >
                      <Link
                        to={`/exhibitions/${buildExhibitionSlug({ id: exhibition.id, title: exhibition.title })}`}
                        className="block"
                      >
                        <div className="aspect-[4/3] border-b-2 border-black overflow-hidden">
                          <SecureImage
                            src={
                              exhibition.exhibition_img_url ??
                              exhibition.logo_img_url ??
                              `https://picsum.photos/seed/${exhibition.id}/800/600`
                            }
                            alt={exhibition.title ?? 'Exhibition'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="p-5 flex gap-4">\n                        <Link
                          to={`/exhibitions/${buildExhibitionSlug({ id: exhibition.id, title: exhibition.title })}`}
                          className="min-w-0 flex-1 space-y-2"
                        >
                          <p className="font-mono text-xs uppercase text-gray-500">
                            {formatExhibitionDate(exhibition, 'start')} — {formatExhibitionDate(exhibition, 'end')}
                          </p>
                          <h3 className="text-xl font-black uppercase leading-tight break-words overflow-hidden">
                            {exhibition.title ?? 'Untitled exhibition'}
                          </h3>
                          <p className="font-mono text-sm text-gray-600 line-clamp-2">
                            {exhibition.description ?? exhibition.eventtype ?? 'Details coming soon.'}
                          </p>
                        </Link>

                        <div className="flex-shrink-0 flex items-start">
                          <Link
                            to={`/stories/${exhibition.id}`}
                            className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
                            aria-label="Open review"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                  Exhibitions will appear here once scheduled.
                </div>
              )}
            </div>

            {/* Past exhibitions */}
            <div>
              <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-3">
                <h2 className="text-3xl font-black uppercase">Past exhibitions</h2>
              </div>

              {pastExhibitions.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastExhibitions.map((exhibition) => (
                    <div
                      key={exhibition.id}
                      className="group border-2 border-black bg-white hover:-translate-y-1 transition-all"
                    >
                      <Link
                        to={`/exhibitions/${buildExhibitionSlug({ id: exhibition.id, title: exhibition.title })}`}
                        className="block"
                      >
                        <div className="aspect-[4/3] border-b-2 border-black overflow-hidden">
                          <SecureImage
                            src={
                              exhibition.exhibition_img_url ??
                              exhibition.logo_img_url ??
                              `https://picsum.photos/seed/${exhibition.id}/800/600`
                            }
                            alt={exhibition.title ?? 'Exhibition'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="p-5 flex gap-4">
                        <Link
                          to={`/exhibitions/${buildExhibitionSlug({ id: exhibition.id, title: exhibition.title })}`}
                          className="min-w-0 flex-1 space-y-2"
                        >
                          <p className="font-mono text-xs uppercase text-gray-500">
                            {formatExhibitionDate(exhibition, 'start')} — {formatExhibitionDate(exhibition, 'end')}
                          </p>
                          <h3 className="text-xl font-black uppercase leading-tight break-words overflow-hidden">
                            {exhibition.title ?? 'Untitled exhibition'}
                          </h3>
                          <p className="font-mono text-sm text-gray-600 line-clamp-2">
                            {exhibition.description ?? exhibition.eventtype ?? 'Details coming soon.'}
                          </p>
                        </Link>

                        <div className="flex-shrink-0 flex items-start">
                          <Link
                            to={`/stories/${exhibition.id}`}
                            className="font-mono text-[10px] uppercase tracking-widest border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
                            aria-label="Open review"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                  {loadingHistorical ? 'Loading past exhibitions…' : 'No past exhibitions yet.'}
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
