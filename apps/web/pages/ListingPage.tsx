import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EntityCard, SkeletonCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import {
  REVIEWS_QUERY,
  AUTHORS_QUERY,
  GUIDES_QUERY,
} from '../sanity/lib/queries';
import {
  REVIEWS_QUERYResult,
  GUIDES_QUERYResult,
  AUTHORS_QUERYResult,
} from '../sanity/types';
import { Article, Artist, Exhibition, Guide, Author, ContentType, Gallery } from '../types';
import { fetchExhibitions, fetchExhibitionsPage, fetchGalleryById, fetchGalleries, fetchArtistsCached, countGalleriesByCountry, countArtistsByCountry, APPROXIMATE_GALLERY_COUNT, GraphqlExhibition, GraphqlGallery, GraphqlArtist, GalleryFilterInput, warmArtistsCache } from '../lib/graphql';
import { mapGraphqlGalleryToEntity } from '../lib/galleryMapping';
import { getAllCountries, getCountryAliases, getCountryDisplayName } from '../lib/countries';
import { useSeo } from '../lib/useSeo';

interface ListingPageProps {
  title: string;
  type: 'reviews' | 'artists' | 'exhibitions' | 'guides' | 'ambassadors' | 'galleries';
}

type ListingEntity = Article | Artist | Exhibition | Guide | Author | Gallery;

const PAGE_SIZE = 10;
const PAGINATED_TYPES = new Set<ListingPageProps['type']>(['artists', 'galleries', 'exhibitions']);
const EXHIBITIONS_INITIAL_LOAD = 50;

/**
 * Convert artist name to URL-friendly slug.
 */
const slugifyArtistName = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Create a URL slug from artist name and ID.
 * Format: "artist-name-id" for uniqueness.
 */
const createArtistSlug = (artist: GraphqlArtist): string => {
  const nameSlug = artist.name ? slugifyArtistName(artist.name) : '';
  if (nameSlug) {
    return `${nameSlug}-${artist.id}`;
  }
  return String(artist.id);
};

const mapGraphqlArtistToCard = (artist: GraphqlArtist): Artist => {
  const lifespan = artist.birth_year
    ? artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : `b. ${artist.birth_year}`
    : '';
  const normalizedCountry = artist.country ? getCountryDisplayName(artist.country) : '';
  return {
    id: artist.id,
    slug: createArtistSlug(artist),
    name: artist.name,
    image: '', // GraphQL API does not provide image URL
    bio: artist.description ?? '',
    discipline: [],
    location: normalizedCountry,
    featuredWork: '',
    lifespan,
  };
};

const buildCountryFilter = (aliases: string[]): GalleryFilterInput | undefined => {
  if (!aliases.length) return undefined;
  if (aliases.length === 1) {
    return { country: { eq: aliases[0] } };
  }
  return {
    or: aliases.map((alias) => ({ country: { eq: alias } })),
  };
};

const fetchAllGalleriesForCountry = async (aliases: string[]): Promise<GraphqlGallery[]> => {
  if (!aliases.length) return [];

  const filter = buildCountryFilter(aliases);
  const collected: GraphqlGallery[] = [];
  let nextToken: string | null = null;

  for (let page = 0; page < 50; page += 1) {
    const connection = await fetchGalleries({
      limit: 200,
      nextToken,
      filter,
    });

    collected.push(...connection.items);
    nextToken = connection.nextToken ?? null;
    if (!nextToken) break;
  }

  return collected;
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : undefined;

const normalizeEpochSeconds = (value?: number | string | null): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  // Seconds are ~1.7e9 (2025), ms are ~1.7e12.
  if (numeric > 10_000_000_000) return Math.floor(numeric / 1000);
  return Math.floor(numeric);
};

const toEpochSeconds = (value?: string | null): number | undefined => {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
};

const mapReviewToArticle = (review: REVIEWS_QUERYResult[number]): Article => ({
  id: review._id,
  slug: review.slug?.current ?? review._id,
  type: ContentType.REVIEW,
  title: review.title ?? 'Untitled Review',
  subtitle: review.excerpt ?? '',
  image: review.mainImage?.asset?.url ?? `https://picsum.photos/seed/${review._id}/600/600`,
  date: formatDate(review.publishedAt),
  author: review.author
    ? {
        id: review.author._id,
        name: review.author.name ?? 'Anonymous',
        role: 'Critic',
        image: review.author.photo?.asset?.url ?? '',
      }
    : undefined,
});

interface ExhibitionGalleryMeta {
  city?: string | null;
  country?: string;
  normalizedCountry?: string;
}

const mapGraphqlExhibitionToCard = (
  exhibition: GraphqlExhibition,
  meta?: Pick<ExhibitionGalleryMeta, 'city' | 'country'>
): Exhibition => ({
  id: exhibition.id,
  slug: exhibition.id,
  title: exhibition.title ?? 'Untitled Exhibition',
  gallery: exhibition.galleryname ?? 'Gallery',
  city: meta?.city ?? exhibition.city ?? 'City',
  country: meta?.country ? getCountryDisplayName(meta.country) : undefined,
  artist: exhibition.artist?.trim() ? exhibition.artist.trim() : undefined,
  image: exhibition.exhibition_img_url ?? `https://picsum.photos/seed/${exhibition.id}/600/600`,
  startDate: formatDate(exhibition.datefrom ?? undefined) ?? 'TBC',
  endDate: formatDate(exhibition.dateto ?? undefined) ?? 'TBC',
  description: exhibition.description ?? '',
  startEpochSeconds: normalizeEpochSeconds(exhibition.datefrom_epoch) ?? toEpochSeconds(exhibition.datefrom),
  endEpochSeconds:
    normalizeEpochSeconds(exhibition.dateto_epoch) ??
    toEpochSeconds(exhibition.dateto) ??
    normalizeEpochSeconds(exhibition.datefrom_epoch) ??
    toEpochSeconds(exhibition.datefrom),
});

const mapGuideToCard = (guide: GUIDES_QUERYResult[number]): Guide => ({
  id: guide._id,
  slug: guide.slug?.current ?? guide._id,
  type: ContentType.GUIDE,
  title: guide.title ?? 'Untitled Guide',
  subtitle: guide.description ?? guide.stops?.[0]?.summary ?? '',
  city: guide.city ?? 'City',
  image: guide.coverImage?.asset?.url ?? `https://picsum.photos/seed/${guide._id}/600/600`,
  author: undefined,
  steps: (guide.stops ?? []).map((stop) => ({
    id: stop._key ?? `${guide._id}-stop`,
    title: stop.title ?? 'Featured stop',
    description: stop.summary ?? stop.notes ?? '',
    image: stop.image?.asset?.url ?? guide.coverImage?.asset?.url ?? `https://picsum.photos/seed/${guide._id}-stop/600/600`,
    location: stop.address ?? guide.city ?? 'City',
  })),
});

const ROLE_LABELS: Record<string, string> = {
  author: 'Author',
  chiefEditor: 'Editor-in-Chief',
  editor: 'Editor',
};

const mapAuthorToCard = (author: AUTHORS_QUERYResult[number]): Author => ({
  id: author._id,
  slug: author.slug?.current ?? author._id,
  name: author.name ?? 'Ambassador',
  role: (author.role && ROLE_LABELS[author.role]) || 'Contributor',
  image: author.photo?.asset?.url ?? `https://picsum.photos/seed/${author._id}/400/400`,
  bio: author.bio ?? '',
});

const CARD_TYPE_MAP = {
  reviews: 'article',
  exhibitions: 'exhibition',
  artists: 'artist',
  guides: 'guide',
  ambassadors: 'author',
  galleries: 'gallery',
} as const;

const getCardKey = (item: ListingEntity) => ('slug' in item && item.slug ? item.slug : item.id);

const ListingPage: React.FC<ListingPageProps> = ({ title, type }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ListingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [countingItems, setCountingItems] = useState(false);
  const [countryMetaReady, setCountryMetaReady] = useState(true);

  type ExhibitionQuickFilter = 'all' | 'featured' | 'openingSoon';
  const [exhibitionFilter, setExhibitionFilter] = useState<ExhibitionQuickFilter>('all');
  const selectedCountryCode = searchParams.get('country') || '';
  
  // Static list of all countries (must be before selectedCountry)
  const countries = useMemo(() => getAllCountries(), []);
  const countryAliases = useMemo(() => (selectedCountryCode ? getCountryAliases(selectedCountryCode) : []), [selectedCountryCode]);
  const normalizedCountryAliases = useMemo(
    () => countryAliases.map((alias) => alias.trim().toLowerCase()),
    [countryAliases]
  );
  const supportsCountryCount = type === 'galleries' || type === 'artists';
  const showCountryFilter = supportsCountryCount || type === 'exhibitions';

  useSeo({
    title: `${title} | Art Flaneur`,
    description:
      type === 'exhibitions'
        ? 'Browse current and upcoming exhibitions. Discover what’s on now and opening soon.'
        : type === 'galleries'
          ? 'Browse galleries and museums. Discover places to see contemporary art.'
          : type === 'artists'
            ? 'Browse artists. Explore biographies and exhibitions.'
            : type === 'reviews'
              ? 'Read exhibition reviews and editorial features from Art Flaneur.'
              : 'Explore Art Flaneur content.',
  });

  useEffect(() => {
    setExhibitionFilter('all');
  }, [type]);

  useEffect(() => {
    let cancelled = false;
    warmArtistsCache().catch((error) => {
      if (!cancelled) {
        console.warn('Failed to warm artists cache', error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (type !== 'exhibitions' || !selectedCountryCode || !countryAliases.length) {
      countryFilteredGalleryIdsRef.current = null;
      setCountryMetaReady(true);
      return;
    }

    let cancelled = false;
    setCountryMetaReady(false);

    const prefetch = async () => {
      try {
        const galleries = await fetchAllGalleriesForCountry(countryAliases);
        if (cancelled) return;

        const idSet = new Set<string>();
        galleries.forEach((gallery) => {
          if (!gallery?.id) return;
          const normalized = gallery.country ? gallery.country.trim().toLowerCase() : undefined;
          exhibitionGalleryMetaRef.current.set(gallery.id, {
            country: gallery.country ? getCountryDisplayName(gallery.country) : undefined,
            normalizedCountry: normalized,
            city: gallery.city ?? null,
          });
          idSet.add(gallery.id);
        });

        countryFilteredGalleryIdsRef.current = idSet;
      } catch (error) {
        console.error('Failed to prefetch galleries for country filter:', error);
        countryFilteredGalleryIdsRef.current = new Set();
      } finally {
        if (!cancelled) {
          setCountryMetaReady(true);
        }
      }
    };

    prefetch();
    return () => {
      cancelled = true;
    };
  }, [type, selectedCountryCode, countryAliases]);
  
  const setSelectedCountryCode = useCallback((code: string) => {
    if (code) {
      setSearchParams({ country: code }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);
  
  // Find selected country name for display
  const selectedCountry = useMemo(() => 
    countries.find(c => c.code === selectedCountryCode), 
    [countries, selectedCountryCode]
  );
  
  // Count items when country changes (for galleries and artists)
  useEffect(() => {
    if (!supportsCountryCount || !selectedCountryCode) {
      setFilteredCount(null);
      return;
    }

    if (!countryAliases.length) {
      setFilteredCount(null);
      return;
    }
    
    let cancelled = false;
    setCountingItems(true);
    
    const countPromise = type === 'galleries' 
      ? countGalleriesByCountry(countryAliases)
      : countArtistsByCountry(countryAliases);
    
    countPromise
      .then((count) => {
        if (!cancelled) {
          setFilteredCount(count);
        }
      })
      .catch((err) => {
        console.error(`Failed to count ${type}:`, err);
        if (!cancelled) {
          setFilteredCount(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCountingItems(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [type, selectedCountryCode, supportsCountryCount, countryAliases]);
  
  const isPaginatedType = PAGINATED_TYPES.has(type);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const pendingCardsRef = useRef<ListingEntity[]>([]);
  const cursorRef = useRef<string | null>(null);
  const artistOffsetRef = useRef(0); // For artists: simple offset-based pagination
  const exhibitionGalleryMetaRef = useRef<Map<string, ExhibitionGalleryMeta>>(new Map());
  const countryFilteredGalleryIdsRef = useRef<Set<string> | null>(null);

  // Anti-scraping: disable right-click on galleries page
  useEffect(() => {
    if (type !== 'galleries') return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [type]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPaginatedPage = useCallback(
    async (startOffset: number, replace: boolean) => {
      const listingType = type;
      if (!PAGINATED_TYPES.has(listingType)) return;

      const requiresCountryMeta =
        listingType === 'exhibitions' && normalizedCountryAliases.length > 0;
      if (requiresCountryMeta && !countryMetaReady) {
        return;
      }

      if (replace) {
        pendingCardsRef.current = [];
        setLoading(true);
        setData([]);
        cursorRef.current = null;
        artistOffsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }

      try {
        // ARTISTS: Use cached data with simple offset pagination
        if (listingType === 'artists') {
          const result = await fetchArtistsCached({
            limit: PAGE_SIZE,
            offset: artistOffsetRef.current,
            countryCode: selectedCountryCode || undefined,
          });

          const mapped = result.items.map(mapGraphqlArtistToCard);
          artistOffsetRef.current += result.items.length;

          if (!isMountedRef.current || listingType !== type) return;

          setData((prev) => (replace ? mapped : [...prev, ...mapped]));
          setHasMore(result.hasMore);
          setError(mapped.length === 0 && replace ? 'No published entries yet.' : null);
          
          if (replace) {
            setLoading(false);
          } else {
            setLoadingMore(false);
          }
          return;
        }

        // EXHIBITIONS: Cursor-based pagination via GraphQL nextToken
        if (listingType === 'exhibitions') {
          const aliasSet = normalizedCountryAliases.length
            ? new Set(normalizedCountryAliases)
            : null;
          const targetBatchSize = replace ? EXHIBITIONS_INITIAL_LOAD : PAGE_SIZE;
          const nextBatch: ListingEntity[] = [];
          let reachedEnd = false;
          const allowedGalleryIds = countryFilteredGalleryIdsRef.current;

          if (pendingCardsRef.current.length) {
            const take = Math.min(targetBatchSize, pendingCardsRef.current.length);
            nextBatch.push(...pendingCardsRef.current.splice(0, take));
          }

          while (nextBatch.length < targetBatchSize && !reachedEnd) {
            const remaining = targetBatchSize - nextBatch.length;
            const connection = await fetchExhibitionsPage({
              limit: Math.max(PAGE_SIZE, remaining),
              nextToken: cursorRef.current ?? undefined,
            });

            const rows = Array.isArray(connection.items) ? connection.items : [];
            cursorRef.current = connection.nextToken ?? null;

            if (!rows.length) {
              reachedEnd = !cursorRef.current;
              break;
            }

            const galleryIdsToFetch = Array.from(
              new Set(
                rows
                  .map((exhibition) => exhibition.gallery_id)
                  .filter((value): value is string => Boolean(value))
                  .filter((galleryId) => !exhibitionGalleryMetaRef.current.has(galleryId))
              )
            );

            if (galleryIdsToFetch.length) {
              const galleries = await Promise.all(
                galleryIdsToFetch.map((galleryId) => fetchGalleryById(galleryId).catch(() => null))
              );
              galleries.forEach((gallery) => {
                if (!gallery?.id) return;
                const normalized = gallery.country ? gallery.country.trim().toLowerCase() : undefined;
                exhibitionGalleryMetaRef.current.set(gallery.id, {
                  country: gallery.country ? getCountryDisplayName(gallery.country) : undefined,
                  normalizedCountry: normalized,
                  city: gallery.city ?? null,
                });
              });
            }

            const filteredRows = rows.filter((exhibition) => {
              if (allowedGalleryIds) {
                return exhibition.gallery_id ? allowedGalleryIds.has(exhibition.gallery_id) : false;
              }
              if (!aliasSet) return true;
              if (!exhibition.gallery_id) return false;
              const info = exhibitionGalleryMetaRef.current.get(exhibition.gallery_id);
              if (!info?.normalizedCountry) return false;
              return aliasSet.has(info.normalizedCountry);
            });

            const mapped = filteredRows.map((exhibition) => {
              const info = exhibition.gallery_id
                ? exhibitionGalleryMetaRef.current.get(exhibition.gallery_id)
                : undefined;
              return mapGraphqlExhibitionToCard(exhibition, info);
            });

            const slots = targetBatchSize - nextBatch.length;
            nextBatch.push(...mapped.slice(0, slots));
            const leftover = mapped.slice(slots);

            if (leftover.length) {
              pendingCardsRef.current = leftover;
              break;
            }

            if (!cursorRef.current) {
              reachedEnd = true;
            }
          }

          if (!isMountedRef.current || listingType !== type) return;

          setData((prev) => (replace ? nextBatch : [...prev, ...nextBatch]));
          const hasPending = pendingCardsRef.current.length > 0;
          setHasMore(hasPending || !reachedEnd);
          setError(nextBatch.length === 0 && replace ? 'No published entries yet.' : null);
          return;
        }

        // GALLERIES: Keep cursor-based pagination
        const nextBatch: ListingEntity[] = [];
        let reachedEnd = false;

        if (pendingCardsRef.current.length) {
          const take = Math.min(PAGE_SIZE, pendingCardsRef.current.length);
          nextBatch.push(...pendingCardsRef.current.splice(0, take));
        }

        while (nextBatch.length < PAGE_SIZE && !reachedEnd) {
          // Build filter for galleries by country (using all aliases)
          const filter = selectedCountryCode && countryAliases.length ? buildCountryFilter(countryAliases) : undefined;

          const connection = await fetchGalleries({
            limit: PAGE_SIZE + 1,
            nextToken: cursorRef.current ?? undefined,
            filter,
          });

          const rows = Array.isArray(connection.items) ? connection.items : [];
          cursorRef.current = connection.nextToken ?? null;

          if (!rows.length) {
            reachedEnd = !cursorRef.current;
            break;
          }

          const mapped = rows.map(mapGraphqlGalleryToEntity);

          const slots = PAGE_SIZE - nextBatch.length;
          nextBatch.push(...mapped.slice(0, slots));
          const leftover = mapped.slice(slots);

          if (leftover.length) {
            pendingCardsRef.current = leftover;
            break;
          }

          if (!cursorRef.current) {
            reachedEnd = true;
          }
        }

        if (!isMountedRef.current || listingType !== type) return;

        setData((prev) => (replace ? nextBatch : [...prev, ...nextBatch]));
        const hasPending = pendingCardsRef.current.length > 0;
        setHasMore(hasPending || !reachedEnd);
        setError(nextBatch.length === 0 && replace ? 'No published entries yet.' : null);
      } catch (err) {
        console.error(`❌ Error fetching ${listingType}:`, err);
        if (!isMountedRef.current || listingType !== type) return;
        if (replace) {
          setData([]);
        }
        setError('Unable to sync data right now.');
      } finally {
        if (!isMountedRef.current || listingType !== type) return;
        if (replace) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [type, selectedCountryCode, countryAliases, normalizedCountryAliases, countryMetaReady]
  );

  useEffect(() => {
    let isMounted = true;
    setData([]);
    setError(null);
    setHasMore(false);
    pendingCardsRef.current = [];
    cursorRef.current = null;

    if (type === 'exhibitions' && normalizedCountryAliases.length > 0 && !countryMetaReady) {
      setLoading(true);
      return () => {
        isMounted = false;
      };
    }

    const loadData = async () => {
      if (isPaginatedType) {
        await fetchPaginatedPage(0, true);
        return;
      }

      setLoading(true);
      try {
        let mapped: ListingEntity[] = [];
        switch (type) {
          case 'reviews': {
            const reviews = await client.fetch<REVIEWS_QUERYResult>(REVIEWS_QUERY);
            mapped = (reviews ?? []).map(mapReviewToArticle);
            break;
          }
          case 'exhibitions': {
            const exhibitions = await fetchExhibitions(50);
            const galleryIds = Array.from(
              new Set(
                exhibitions
                  .map((exhibition) => exhibition.gallery_id)
                  .filter((value): value is string => Boolean(value))
              )
            );

            const galleries = await Promise.all(
              galleryIds.map((galleryId) => fetchGalleryById(galleryId).catch(() => null))
            );

            const galleryMetaById = new Map<string, ExhibitionGalleryMeta>();
            galleries.forEach((gallery) => {
              if (!gallery?.id) return;
              galleryMetaById.set(gallery.id, {
                country: gallery.country ? getCountryDisplayName(gallery.country) : undefined,
                city: gallery.city ?? null,
                normalizedCountry: gallery.country ? gallery.country.trim().toLowerCase() : undefined,
              });
            });

            mapped = exhibitions.map((exhibition) =>
              mapGraphqlExhibitionToCard(
                exhibition,
                exhibition.gallery_id ? galleryMetaById.get(exhibition.gallery_id) : undefined
              )
            );
            break;
          }
          case 'guides': {
            const guides = await client.fetch<GUIDES_QUERYResult>(GUIDES_QUERY);
            mapped = (guides ?? []).map(mapGuideToCard);
            break;
          }
          case 'ambassadors': {
            const authors = await client.fetch<AUTHORS_QUERYResult>(AUTHORS_QUERY);
            mapped = (authors ?? []).map(mapAuthorToCard);
            break;
          }
          default:
            mapped = [];
        }

        if (!isMounted) return;

        if (!mapped.length) {
          setData([]);
          setError('No published entries yet.');
        } else {
          setData(mapped);
        }
      } catch (err) {
        console.error(`❌ Error fetching ${type}:`, err);
        if (!isMounted) return;
        setError('Unable to sync data right now.');
        setData([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [type, isPaginatedType, fetchPaginatedPage, countryMetaReady, normalizedCountryAliases]);

  const loadMore = useCallback(() => {
    if (!isPaginatedType || loading || loadingMore || !hasMore) {
      return;
    }
    fetchPaginatedPage(0, false);
  }, [fetchPaginatedPage, hasMore, isPaginatedType, loading, loadingMore]);

  useEffect(() => {
    if (!isPaginatedType) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isPaginatedType, loadMore]);

  useEffect(() => {
    cursorRef.current = null;
    artistOffsetRef.current = 0;
  }, [type, selectedCountryCode]);

  const cardType: Parameters<typeof EntityCard>[0]['type'] = CARD_TYPE_MAP[type];

  const visibleData = useMemo(() => {
    if (type !== 'exhibitions') {
      return data;
    }

    const now = Math.floor(Date.now() / 1000);
    const exhibitions = (data as Exhibition[]).slice();

    if (exhibitionFilter === 'featured') {
      return exhibitions.filter((ex) => {
        const hasRealImage = Boolean(ex.image) && !ex.image.includes('picsum.photos');
        const hasDescription = Boolean(ex.description?.trim());
        return hasRealImage && hasDescription;
      });
    }

    if (exhibitionFilter === 'openingSoon') {
      return exhibitions
        .filter((ex) => (ex.startEpochSeconds ?? 0) > now)
        .sort((a, b) => {
          const aStart = a.startEpochSeconds ?? Number.POSITIVE_INFINITY;
          const bStart = b.startEpochSeconds ?? Number.POSITIVE_INFINITY;
          return aStart - bStart;
        });
    }

    return exhibitions;
  }, [data, exhibitionFilter, type]);

  return (
    <div className="min-h-screen bg-art-paper select-none">
      {/* Header */}
      <div className="bg-white border-b-2 border-black pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-6 mb-8">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter flex flex-wrap items-baseline gap-4">
              <span>{title}</span>
              {supportsCountryCount && !selectedCountryCode && (
                <span className="text-2xl md:text-4xl text-gray-400 font-mono tracking-wide">
                  {type === 'galleries' ? `${APPROXIMATE_GALLERY_COUNT.toLocaleString()}+` : ''}
                </span>
              )}
              {supportsCountryCount && selectedCountry && (
                <span className="text-2xl md:text-4xl text-gray-400 font-mono tracking-wide">
                  {countingItems ? '...' : filteredCount !== null ? `${filteredCount.toLocaleString()} ${type === 'artists' ? 'names' : 'places'}` : ''}
                </span>
              )}
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 font-mono text-xs uppercase font-bold items-center">
            <button
              onClick={type === 'exhibitions' ? () => setExhibitionFilter('all') : undefined}
              className={`${
                type === 'exhibitions' && exhibitionFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              } px-4 py-2 border-2 border-black`}
            >
              All
            </button>
            <button
              onClick={type === 'exhibitions' ? () => setExhibitionFilter('featured') : undefined}
              className={`${
                type === 'exhibitions' && exhibitionFilter === 'featured'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              } px-4 py-2 border-2 border-black`}
            >
              Featured
            </button>
            {type === 'exhibitions' && (
              <button
                onClick={() => setExhibitionFilter('openingSoon')}
                className={`${
                  exhibitionFilter === 'openingSoon'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                } px-4 py-2 border-2 border-black`}
              >
                Opening Soon
              </button>
            )}
            {showCountryFilter && (
              <div className="relative">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="bg-white text-black px-4 py-2 pr-10 border-2 border-black hover:bg-gray-100 cursor-pointer appearance-none font-mono text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-center"
                >
                  <option value="">Country ▾</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
                {selectedCountryCode && (
                  <button
                    onClick={() => setSelectedCountryCode('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-red-600 font-bold text-lg leading-none"
                    title="Clear filter"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {type === 'galleries' && (
              <Link
                to="/gallery-login?mode=signup"
                className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-art-blue hover:text-white transition-colors"
              >
                Add your gallery
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} type={cardType} />
            ))}
          </div>
        ) : visibleData.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {visibleData.map((item) => (
              <EntityCard key={getCardKey(item)} data={item} type={cardType} />
            ))}
            {/* Show skeleton cards while loading more */}
            {loadingMore && Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`loading-${i}`} type={cardType} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-gray-600">
            {error || 'No entries to display yet.'}
          </p>
        )}

        {isPaginatedType && (
          <div ref={loadMoreRef} className="mt-8 flex flex-col items-center">
            {!hasMore && !loadingMore && data.length > 0 && (
              <p className="font-mono text-[11px] text-gray-400 uppercase tracking-[0.3em]">End of list</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingPage;