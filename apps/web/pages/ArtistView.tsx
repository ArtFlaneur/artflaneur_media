import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchArtistById, fetchExhibitionsForArtist, GraphqlArtist, GraphqlExhibition } from '../lib/graphql';
import { client } from '../sanity/lib/client';
import { ARTIST_STORY_BY_GRAPHQL_ID_QUERY } from '../sanity/lib/queries';
import { ARTIST_STORY_BY_GRAPHQL_ID_QUERYResult, BlockContent } from '../sanity/types';
import { useSeo } from '../lib/useSeo';
import { imagePresets, getOptimizedImageUrl } from '../lib/imageBuilder';

/**
 * Extract artist ID from URL slug.
 * Slug format: "artist-name-uuid" where UUID is 36 chars at the end.
 */
const extractArtistIdFromSlug = (slug: string): string => {
  // UUID format: 8-4-4-4-12 = 36 characters
  const uuidLength = 36;
  if (slug.length > uuidLength) {
    // Extract the last 36 characters as the ID
    return slug.slice(-uuidLength);
  }
  // Fallback: assume the entire slug is the ID
  return slug;
};

type ArtistStoryDocument = NonNullable<ARTIST_STORY_BY_GRAPHQL_ID_QUERYResult>;
type StoryMultimediaSection = NonNullable<ArtistStoryDocument['multimediaSections']> extends Array<infer U>
  ? U
  : never;
type StoryArtworkImage = NonNullable<ArtistStoryDocument['artworkGallery']> extends Array<infer U> ? U : never;

type VideoEmbedDetails = {
  type: 'iframe' | 'video';
  src: string;
};

const blocksToParagraphs = (body?: BlockContent | null): string[] => {
  if (!body?.length) return [];
  return body
    .map((block) => {
      if (block._type !== 'block') return '';
      const text = (block.children ?? [])
        .map((child) => child.text)
        .filter(Boolean)
        .join(' ')
        .trim();
      return text;
    })
    .filter(Boolean);
};

const isExternalUrl = (value?: string | null) => (value ? /^https?:/i.test(value) : false);

const getVideoEmbedDetails = (url?: string | null): VideoEmbedDetails | null => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
      if (videoId) {
        return {type: 'iframe', src: `https://www.youtube.com/embed/${videoId}`};
      }
    }
    if (host === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      if (videoId) {
        return {type: 'iframe', src: `https://www.youtube.com/embed/${videoId}`};
      }
    }
    if (host.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      if (videoId) {
        return {type: 'iframe', src: `https://player.vimeo.com/video/${videoId}`};
      }
    }
  } catch (err) {
    console.warn('Unable to parse video URL', err);
  }

  if (/\.(mp4|webm|ogg)$/i.test(url)) {
    return {type: 'video', src: url};
  }

  if (isExternalUrl(url)) {
    return {type: 'iframe', src: url};
  }

  return null;
};

const renderMultimediaMedia = (section: StoryMultimediaSection): React.ReactNode => {
  const embed = getVideoEmbedDetails(section.videoUrl);
  const fallbackUrl = getOptimizedImageUrl(section.fallbackImage, { width: 1200, quality: 85 });
  const fallbackAlt = section.fallbackImage?.alt ?? section.title ?? 'Artist feature still';

  if (embed?.type === 'iframe') {
    return (
      <iframe
        src={embed.src}
        title={section.title ?? 'Artist multimedia'}
        className="w-full h-full object-cover"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (embed?.type === 'video') {
    return (
      <video
        src={embed.src}
        className="w-full h-full object-cover"
        controls
        preload="metadata"
        poster={fallbackUrl ?? undefined}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (fallbackUrl) {
    return <img src={fallbackUrl} alt={fallbackAlt} className="w-full h-full object-cover" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center text-center text-xs font-mono uppercase tracking-[0.3em] text-white/60">
      Media coming soon
    </div>
  );
};

const ArtistView: React.FC = () => {
  const { id: slugParam } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<GraphqlArtist | null>(null);
  const [exhibitions, setExhibitions] = useState<GraphqlExhibition[]>([]);
  const [artistStory, setArtistStory] = useState<ARTIST_STORY_BY_GRAPHQL_ID_QUERYResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!slugParam) {
        setError('Missing artist identifier.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setArtistStory(null);

      // Extract actual ID from slug (e.g., "yayoi-kusama-0ef8ae4d-..." -> "0ef8ae4d-...")
      const id = extractArtistIdFromSlug(slugParam);

      try {
        const storyPromise = client
          .fetch<ARTIST_STORY_BY_GRAPHQL_ID_QUERYResult>(ARTIST_STORY_BY_GRAPHQL_ID_QUERY, {artistId: id})
          .catch((storyError) => {
            console.warn('No artist story available for GraphQL artist', storyError);
            return null;
          });

        const [artistData, exhibitionsData, storyData] = await Promise.all([
          fetchArtistById(id),
          fetchExhibitionsForArtist(id),
          storyPromise,
        ]);
        setArtist(artistData);
        setExhibitions(exhibitionsData);
        setArtistStory(storyData);
        setError(artistData ? null : 'Artist not found.');
      } catch (err) {
        console.error('❌ Error fetching artist:', err);
        setError('Unable to load this artist right now.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtist();
  }, [slugParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">Loading artist...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">{error || 'Artist not found'}</p>
      </div>
    );
  }

  const lifespan = artist.birth_year
    ? artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : `b. ${artist.birth_year}`
    : null;

  const biographyParagraphs = useMemo(() => blocksToParagraphs(artistStory?.biography), [artistStory?.biography]);

  const multimediaSections = useMemo(
    () => (artistStory?.multimediaSections ?? []) as StoryMultimediaSection[],
    [artistStory?.multimediaSections],
  );

  const artworkGallery = useMemo(
    () => (artistStory?.artworkGallery ?? []) as StoryArtworkImage[],
    [artistStory?.artworkGallery],
  );

  const storyPortraitUrl = imagePresets.hero(artistStory?.portrait);

  const storySponsor = useMemo(() => {
    const sponsorship = artistStory?.sponsorship;
    if (!sponsorship?.enabled) return null;
    const sponsor = sponsorship.sponsor;
    return {
      label:
        sponsorship.customDisclaimer ??
        (sponsor?.name ? `Presented by ${sponsor.name}` : 'Sponsored Feature'),
      logo: imagePresets.logo(sponsor?.logo) ?? null,
      alt: sponsor?.logo?.alt ?? sponsor?.name ?? 'Sponsor logo',
      color: sponsor?.brandColor?.hex ?? undefined,
    };
  }, [artistStory?.sponsorship]);

  const storyCta =
    artistStory?.appCta?.deeplink && artistStory.appCta.text
      ? {href: artistStory.appCta.deeplink, label: artistStory.appCta.text}
      : null;

  const storyTitle = artistStory?.title ?? artist.name ?? 'Artist Story';

  // SEO with JSON-LD Person schema
  const seoTitle = artist.name ? `${artist.name} | Art Flaneur` : 'Artist | Art Flaneur';
  const seoDescription = useMemo(() => {
    const bioParts: string[] = [];
    if (artist.name) bioParts.push(artist.name);
    if (lifespan) bioParts.push(`(${lifespan})`);
    if (artist.country) bioParts.push(`from ${artist.country}`);
    
    const bioPrefix = bioParts.join(' ');
    const bioText = biographyParagraphs?.[0] || artist.description || 'Contemporary artist profile on Art Flaneur.';
    
    return `${bioPrefix}. ${bioText}`.slice(0, 160);
  }, [artist, lifespan, biographyParagraphs]);

  const artistJsonLd = useMemo(() => {
    if (!artist) return undefined;
    
    const artistSlug = slugParam || artist.id;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: artist.name || 'Artist',
      ...(artist.description && { description: artist.description }),
      ...(storyPortraitUrl && { image: storyPortraitUrl }),
      ...(artist.birth_year && { birthDate: artist.birth_year.toString() }),
      ...(artist.death_year && { deathDate: artist.death_year.toString() }),
      ...(artist.country && { nationality: artist.country }),
      url: `https://www.artflaneur.art/artists/${artistSlug}`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.artflaneur.art/artists/${artistSlug}`,
      },
      ...(exhibitions.length > 0 && {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Exhibitions',
          itemListElement: exhibitions.slice(0, 5).map((ex, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'ExhibitionEvent',
              name: ex.title,
              ...(ex.datefrom && { startDate: ex.datefrom }),
              ...(ex.dateto && { endDate: ex.dateto }),
            }
          }))
        }
      }),
    };
  }, [artist, slugParam, storyPortraitUrl, exhibitions]);

  useSeo({
    title: seoTitle,
    description: seoDescription,
    imageUrl: storyPortraitUrl || undefined,
    canonicalUrl: `https://www.artflaneur.art/artists/${slugParam}`,
    ogType: 'profile',
    jsonLd: artistJsonLd,
  });

  return (
    <div className="bg-white">
        {/* Hero Header */}
        <div className="border-b-2 border-black bg-art-paper">
            <div className="container mx-auto px-4 md:px-6 py-24">
                <h1 className="text-5xl md:text-8xl font-black uppercase leading-none mb-6">{artist.name || 'Untitled Artist'}</h1>
                <div className="font-mono text-sm text-gray-600 flex flex-wrap gap-4 mb-8">
                    {artist.country && (
                      <span className="border-2 border-black px-3 py-1 bg-white">{artist.country}</span>
                    )}
                    {lifespan && (
                      <span className="border-2 border-black px-3 py-1 bg-white">{lifespan}</span>
                    )}
                    {artist.wikipedia_url && (
                      <a href={artist.wikipedia_url} target="_blank" rel="noreferrer" className="border-2 border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors">
                        Wikipedia →
                      </a>
                    )}
                </div>
                {artist.description && (
                  <p className="text-lg md:text-xl leading-relaxed max-w-3xl text-gray-700">
                    {artist.description}
                  </p>
                )}
            </div>
        </div>

        {artistStory && (
          <section className="border-b-2 border-black bg-white">
            <div className="container mx-auto px-4 md:px-6 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-6">
                  {storySponsor && (
                    <div
                      className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.4em]"
                      style={storySponsor.color ? {color: storySponsor.color} : undefined}
                    >
                      {storySponsor.logo && (
                        <img src={storySponsor.logo} alt={storySponsor.alt} className="h-6 w-auto" />
                      )}
                      <span>{storySponsor.label}</span>
                    </div>
                  )}
                  <p className="font-mono text-xs uppercase tracking-[0.5em] text-gray-500">Artist Story</p>
                  <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight">{storyTitle}</h2>
                  {artistStory.summary && (
                    <p className="text-lg text-gray-700 leading-relaxed">{artistStory.summary}</p>
                  )}
                  {biographyParagraphs.length > 0 && (
                    <div className="space-y-4 text-base leading-relaxed text-gray-700">
                      {biographyParagraphs.map((paragraph, index) => (
                        <p key={`bio-${index}`}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                  {storyCta && (
                    <a
                      href={storyCta.href}
                      className="inline-flex items-center gap-3 border-2 border-black px-5 py-3 font-bold uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      {storyCta.label} →
                    </a>
                  )}
                </div>
                <div className="lg:col-span-2 border-2 border-black bg-art-paper min-h-[420px]">
                  {storyPortraitUrl ? (
                    <img
                      src={storyPortraitUrl}
                      alt={artistStory.portrait?.alt ?? `${artist.name} portrait`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center text-xs font-mono uppercase tracking-[0.4em] text-gray-500">
                      Portrait coming soon
                    </div>
                  )}
                </div>
              </div>
            </div>

            {multimediaSections.length > 0 && (
              <div className="border-t-2 border-black bg-art-paper">
                <div className="container mx-auto px-4 md:px-6 py-16">
                  <div className="mb-10 flex items-center justify-between">
                    <h3 className="text-3xl font-black uppercase">Multimedia Moments</h3>
                    <span className="font-mono text-xs uppercase tracking-[0.4em] text-gray-600">
                      {multimediaSections.length} features
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {multimediaSections.map((section) => {
                      const key = section._key ?? section.title ?? section.videoUrl ?? 'feature';
                      const isExternal = section.ctaUrl ? isExternalUrl(section.ctaUrl) : false;
                      return (
                        <article
                          key={key}
                          className="flex flex-col border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <div className="relative aspect-video bg-black text-white">
                            {renderMultimediaMedia(section)}
                          </div>
                          <div className="flex flex-col gap-4 p-6">
                            <div>
                              <p className="font-mono text-xs uppercase tracking-[0.4em] text-gray-500">Studio Drop</p>
                              <h4 className="text-2xl font-black uppercase leading-tight">
                                {section.title ?? 'Untitled feature'}
                              </h4>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-700">
                              {section.description ?? artistStory.summary ?? 'Fresh work from the studio.'}
                            </p>
                            {section.ctaUrl && section.ctaText ? (
                              isExternal ? (
                                <a
                                  href={section.ctaUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-art-blue hover:text-art-red"
                                >
                                  {section.ctaText} →
                                </a>
                              ) : (
                                <Link
                                  to={section.ctaUrl}
                                  className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-art-blue hover:text-art-red"
                                >
                                  {section.ctaText} →
                                </Link>
                              )
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {artworkGallery.length > 0 && (
              <div className="border-t-2 border-black bg-white">
                <div className="container mx-auto px-4 md:px-6 py-16">
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-3xl font-black uppercase">Studio Notes</h3>
                    <span className="font-mono text-xs uppercase tracking-[0.4em] text-gray-500">
                      {artworkGallery.length} works
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artworkGallery.map((art) => (
                      <figure
                        key={art._key ?? `${art.title ?? 'artwork'}-${art.year ?? 'year'}`}
                        className="border-2 border-black bg-art-paper"
                      >
                        {art.asset?.url ? (
                          <img
                            src={art.asset.url}
                            alt={art.alt ?? art.title ?? 'Artwork preview'}
                            className="h-64 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-64 w-full items-center justify-center text-center text-xs font-mono uppercase tracking-[0.4em] text-gray-500">
                            Image coming soon
                          </div>
                        )}
                        <figcaption className="border-t-2 border-black p-4 text-sm leading-relaxed">
                          <p className="font-black uppercase">{art.title ?? 'Untitled work'}</p>
                          {(art.year || art.caption) && (
                            <p className="text-xs text-gray-600">
                              {[art.year, art.caption].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Exhibitions */}
        <div className="container mx-auto px-4 md:px-6 py-24">
            <h2 className="text-4xl font-black uppercase mb-12 border-l-8 border-art-blue pl-6">Exhibitions & Shows</h2>
            {exhibitions.length === 0 ? (
              <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                Exhibition history coming soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exhibitions.map((exhibition) => (
                  <Link
                    key={exhibition.id}
                    to={`/galleries/${exhibition.gallery_id || ''}`}
                    className="group border-2 border-black p-4 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                      <span>{exhibition.galleryname || 'Gallery'}</span>
                      {exhibition.city && <span>· {exhibition.city}</span>}
                    </div>
                    <h3 className="text-xl font-black uppercase leading-tight">{exhibition.title || 'Untitled exhibition'}</h3>
                    <p className="font-mono text-xs text-gray-600">
                      {exhibition.datefrom ? new Date(exhibition.datefrom).toLocaleDateString() : 'TBA'} — {exhibition.dateto ? new Date(exhibition.dateto).toLocaleDateString() : 'TBA'}
                    </p>
                    <span className="font-mono text-xs text-art-blue group-hover:underline">View gallery</span>
                  </Link>
                ))}
              </div>
            )}
        </div>
    </div>
  );
};

export default ArtistView;