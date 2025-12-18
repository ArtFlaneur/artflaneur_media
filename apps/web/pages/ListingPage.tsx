import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EntityCard } from '../components/Shared';
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
import { fetchExhibitions, fetchGalleries, fetchArtists, countGalleriesByCountry, APPROXIMATE_GALLERY_COUNT, GraphqlExhibition, GraphqlGallery, GraphqlArtist } from '../lib/graphql';
import { mapGraphqlGalleryToEntity } from '../lib/galleryMapping';
import { getAllCountries, getCountryAliases, type Country } from '../lib/countries';

interface ListingPageProps {
  title: string;
  type: 'reviews' | 'artists' | 'exhibitions' | 'guides' | 'ambassadors' | 'galleries';
}

type ListingEntity = Article | Artist | Exhibition | Guide | Author | Gallery;

const PAGE_SIZE = 10;
const PAGINATED_TYPES = new Set<ListingPageProps['type']>(['artists', 'galleries']);

const mapGraphqlArtistToCard = (artist: GraphqlArtist): Artist => {
  const lifespan = artist.birth_year
    ? artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : `b. ${artist.birth_year}`
    : '';
  return {
    id: artist.id,
    slug: artist.id,
    name: artist.name,
    image: '', // GraphQL API does not provide image URL
    bio: artist.description ?? '',
    discipline: [],
    location: artist.country ?? '',
    featuredWork: '',
    lifespan,
  };
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : undefined;

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

const mapGraphqlExhibitionToCard = (exhibition: GraphqlExhibition): Exhibition => ({
  id: exhibition.id,
  slug: exhibition.id,
  title: exhibition.title ?? 'Untitled Exhibition',
  gallery: exhibition.galleryname ?? 'Gallery',
  city: exhibition.city ?? 'City',
  image: exhibition.exhibition_img_url ?? `https://picsum.photos/seed/${exhibition.id}/600/600`,
  startDate: formatDate(exhibition.datefrom ?? undefined) ?? 'TBC',
  endDate: formatDate(exhibition.dateto ?? undefined) ?? 'TBC',
  description: exhibition.description ?? '',
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
  const [countryGalleryCount, setCountryGalleryCount] = useState<number | null>(null);
  const [countingGalleries, setCountingGalleries] = useState(false);
  
  // Static list of all countries (must be before selectedCountry)
  const countries = useMemo(() => getAllCountries(), []);
  
  // Get country from URL params, persist across navigation
  const selectedCountryCode = searchParams.get('country') || '';
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
  
  // Count galleries when country changes
  useEffect(() => {
    if (type !== 'galleries' || !selectedCountryCode) {
      setCountryGalleryCount(null);
      return;
    }
    
    const aliases = getCountryAliases(selectedCountryCode);
    if (!aliases.length) {
      setCountryGalleryCount(null);
      return;
    }
    
    let cancelled = false;
    setCountingGalleries(true);
    
    countGalleriesByCountry(aliases)
      .then((count) => {
        if (!cancelled) {
          setCountryGalleryCount(count);
        }
      })
      .catch((err) => {
        console.error('Failed to count galleries:', err);
        if (!cancelled) {
          setCountryGalleryCount(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCountingGalleries(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [type, selectedCountryCode]);
  
  const isPaginatedType = PAGINATED_TYPES.has(type);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const pendingCardsRef = useRef<ListingEntity[]>([]);
  const cursorRef = useRef<string | null>(null);

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

      if (replace) {
        pendingCardsRef.current = [];
        setLoading(true);
        setData([]);
        cursorRef.current = null;
      } else {
        setLoadingMore(true);
      }

      try {
        const nextBatch: ListingEntity[] = [];
        let reachedEnd = false;

        if (pendingCardsRef.current.length) {
          const take = Math.min(PAGE_SIZE, pendingCardsRef.current.length);
          nextBatch.push(...pendingCardsRef.current.splice(0, take));
        }

          while (nextBatch.length < PAGE_SIZE && !reachedEnd) {
            if (listingType === 'artists') {
              const connection = await fetchArtists({
                limit: PAGE_SIZE + 1,
                nextToken: cursorRef.current ?? undefined,
              });

              const rows = Array.isArray(connection.items) ? connection.items : [];
              cursorRef.current = connection.nextToken ?? null;

              if (!rows.length) {
                reachedEnd = !cursorRef.current;
                break;
              }

              const mapped = rows.map(mapGraphqlArtistToCard);

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
            } else {
              // Build filter for galleries by country (using all aliases)
              let filter = undefined;
              if (selectedCountryCode) {
                const aliases = getCountryAliases(selectedCountryCode);
                if (aliases.length === 1) {
                  filter = { country: { eq: aliases[0] } };
                } else if (aliases.length > 1) {
                  // Use OR filter for multiple aliases (UK, United Kingdom, etc.)
                  filter = { or: aliases.map(alias => ({ country: { eq: alias } })) };
                }
              }

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
    [type, selectedCountryCode]
  );

  useEffect(() => {
    let isMounted = true;
    setData([]);
    setError(null);
    setHasMore(false);
    pendingCardsRef.current = [];
    cursorRef.current = null;

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
            mapped = exhibitions.map(mapGraphqlExhibitionToCard);
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
  }, [type, isPaginatedType, fetchPaginatedPage]);

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
  }, [type, selectedCountryCode]);

  const cardType: Parameters<typeof EntityCard>[0]['type'] = CARD_TYPE_MAP[type];

  return (
    <div className="min-h-screen bg-art-paper select-none">
      {/* Header */}
      <div className="bg-white border-b-2 border-black pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-6 mb-8">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter flex flex-wrap items-baseline gap-4">
              <span>{title}</span>
              {type === 'galleries' && !selectedCountryCode && (
                <span className="text-2xl md:text-4xl text-gray-400 font-mono">
                  {APPROXIMATE_GALLERY_COUNT.toLocaleString()}+
                </span>
              )}
              {type === 'galleries' && selectedCountry && (
                <>
                  <span className="text-2xl md:text-4xl text-gray-400 font-mono">
                    {countingGalleries ? '...' : countryGalleryCount !== null ? countryGalleryCount.toLocaleString() : ''}
                  </span>
                  <span className="text-2xl md:text-4xl text-gray-400 font-mono">
                    {selectedCountry.name}
                  </span>
                </>
              )}
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 font-mono text-xs uppercase font-bold items-center">
            <button className="bg-black text-white px-4 py-2 border-2 border-black">All</button>
            <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Featured</button>
            <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Latest</button>
            {type === 'exhibitions' && (
              <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Opening Soon</button>
            )}
            {type === 'galleries' && (
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
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        {error && <p className="font-mono text-xs text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p className="font-mono text-sm text-gray-600">Loading curated selections…</p>
        ) : data.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((item) => (
              <EntityCard key={getCardKey(item)} data={item} type={cardType} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-gray-600">No entries to display yet.</p>
        )}

        {isPaginatedType && (
          <div ref={loadMoreRef} className="mt-8 flex flex-col items-center">
            {loadingMore && <p className="font-mono text-xs text-gray-500">Loading more…</p>}
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