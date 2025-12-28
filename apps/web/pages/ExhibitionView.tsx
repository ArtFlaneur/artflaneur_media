import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  fetchExhibitionById,
  fetchExhibitionByIdDirect,
  fetchHistoricalExhibitionById,
  type GraphqlExhibition,
} from '../lib/graphql';
import { getAppDownloadLink } from '../lib/formatters';
import SecureImage from '../components/SecureImage';
import { useSeo } from '../lib/useSeo';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : 'TBA';

const normalizeEpochSeconds = (value?: number | string | null): number | null => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  // Seconds are ~1.7e9 (2025), ms are ~1.7e12.
  if (numeric > 10_000_000_000) return Math.floor(numeric / 1000);
  return Math.floor(numeric);
};

const formatEpochDate = (epochSeconds?: number | null) => {
  if (!epochSeconds) return 'TBA';
  return new Date(epochSeconds * 1000).toLocaleDateString('en-US', DATE_FORMAT);
};

const formatExhibitionDate = (exhibition: GraphqlExhibition, which: 'start' | 'end') => {
  const iso = which === 'start' ? exhibition.datefrom : exhibition.dateto;
  if (iso) return formatDate(iso);

  const epochRaw = which === 'start' ? exhibition.datefrom_epoch : exhibition.dateto_epoch;
  const epochSeconds = normalizeEpochSeconds(epochRaw);
  return formatEpochDate(epochSeconds);
};

const buildHeroImage = (exhibition: GraphqlExhibition | null) => {
  if (!exhibition) return FALLBACK_IMAGE;
  return exhibition.exhibition_img_url ?? exhibition.logo_img_url ?? FALLBACK_IMAGE;
};

const ExhibitionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<GraphqlExhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        let found: GraphqlExhibition | null = null;

        try {
          found = await fetchExhibitionByIdDirect(id);
        } catch (err) {
          console.warn('⚠️ getExhibitionById failed; falling back to paginated scans', err);
        }

        if (!found) {
          found = (await fetchExhibitionById(id)) ?? (await fetchHistoricalExhibitionById(id));
        }

        if (!isMounted) return;
        if (!found) {
          setExhibition(null);
          setError('Exhibition not found.');
        } else {
          setExhibition(found);
          setError(null);
        }
      } catch (err) {
        console.error('❌ Error fetching exhibition:', err);
        if (!isMounted) return;
        setExhibition(null);
        setError('Unable to load this exhibition right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const heroImage = useMemo(() => buildHeroImage(exhibition), [exhibition]);
  const appDownloadLink = useMemo(() => getAppDownloadLink(), []);
  const dateLabel = exhibition
    ? `${formatExhibitionDate(exhibition, 'start')} — ${formatExhibitionDate(exhibition, 'end')}`
    : null;

  const seoTitle = exhibition?.title?.trim() ? `${exhibition.title.trim()} | Art Flaneur` : 'Exhibition | Art Flaneur';
  const seoVenueLabel = exhibition ? [exhibition.galleryname, exhibition.city].filter(Boolean).join(', ') : null;
  const seoDescription = exhibition
    ? `${exhibition.title ?? 'Exhibition'}${seoVenueLabel ? ` — ${seoVenueLabel}` : ''}${dateLabel ? ` (${dateLabel})` : ''}. ${exhibition.description?.trim() ?? 'Discover exhibition details on Art Flaneur.'}`
    : 'Exhibition details on Art Flaneur.';

  useSeo({
    title: exhibition ? seoTitle : error ? 'Exhibition not found | Art Flaneur' : 'Exhibition | Art Flaneur',
    description: seoDescription,
    imageUrl: heroImage,
    ogType: 'event',
    jsonLd: exhibition
      ? {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: exhibition.title ?? 'Exhibition',
          url: `https://www.artflaneur.com.au/#/exhibitions/${exhibition.id}`,
          image: heroImage,
          description: exhibition.description?.trim() || undefined,
          startDate: exhibition.datefrom || undefined,
          endDate: exhibition.dateto || undefined,
          performer: exhibition.artist?.trim()
            ? {
                '@type': 'Person',
                name: exhibition.artist.trim(),
              }
            : undefined,
          location: exhibition.galleryname
            ? {
                '@type': 'Place',
                name: exhibition.galleryname,
                address:
                  exhibition.city
                    ? {
                        '@type': 'PostalAddress',
                        addressLocality: exhibition.city || undefined,
                      }
                    : undefined,
              }
            : undefined,
        }
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-art-paper">
        <p className="font-mono text-sm uppercase tracking-[0.3em]">Loading exhibition…</p>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="min-h-screen bg-art-paper flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em]">{error ?? 'Exhibition not found'}</p>
          <Link
            to="/exhibitions"
            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Back to exhibitions
          </Link>
        </div>
      </div>
    );
  }

  const title = exhibition.title ?? 'Untitled exhibition';
  const venueLabel = [exhibition.galleryname, exhibition.city].filter(Boolean).join(', ');
  const artistLabel = exhibition.artist?.trim() || null;
  const description = exhibition.description?.trim() || null;
  const galleryPath = exhibition.gallery_id ? `/galleries/${exhibition.gallery_id}` : null;

  return (
    <div className="bg-art-paper min-h-screen select-none" onContextMenu={(e) => e.preventDefault()}>
      <section className="relative h-[60vh] border-b-2 border-black overflow-hidden">
        <SecureImage src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 text-white">
          <div className="space-y-4">
            {venueLabel && (
              <p className="font-mono text-xs uppercase tracking-[0.4em]">{venueLabel}</p>
            )}
            <h1 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] break-words overflow-hidden">{title}</h1>
            {(artistLabel || dateLabel) && (
              <div className="flex flex-col gap-2">
                {artistLabel && (
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/90">{artistLabel}</p>
                )}
                {dateLabel && (
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/80">{dateLabel}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="border-2 border-black bg-white p-6 space-y-6 sticky top-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <h3 className="font-black uppercase text-lg mb-6 border-b-2 border-black pb-2">Details</h3>
                <div className="space-y-4">
                  {artistLabel && (
                    <div className="flex gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-gray-500">Artist</p>
                        <p className="font-bold break-words">{artistLabel}</p>
                      </div>
                    </div>
                  )}
                  {venueLabel && (
                    <div className="flex gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-gray-500">Venue</p>
                        <p className="font-bold break-words">{venueLabel}</p>
                      </div>
                    </div>
                  )}
                  {dateLabel && (
                    <div className="flex gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-gray-500">Dates</p>
                        <p className="font-bold">{dateLabel}</p>
                      </div>
                    </div>
                  )}
                  {galleryPath && (
                    <Link
                      to={galleryPath}
                      className="inline-flex items-center justify-between w-full gap-3 px-4 py-3 border border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      View gallery
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-black uppercase text-sm tracking-[0.3em] mb-3">Links</h3>
                <div className="space-y-3">
                  <a
                    href={appDownloadLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between w-full gap-3 px-4 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Add to your planner
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    to={`/reviews/${exhibition.id}`}
                    className="inline-flex items-center justify-between w-full gap-3 px-4 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Read review
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8 order-1 lg:order-2 space-y-8">
            {description ? (
              <div className="border-2 border-black bg-white p-8">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">Description</h2>
                <p className="font-mono text-sm md:text-base leading-relaxed text-gray-700">{description}</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                Description coming soon.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionView;
