import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EntityCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import {
  REVIEWS_QUERY,
  EXHIBITIONS_QUERY,
  AUTHORS_QUERY,
  GUIDES_QUERY,
  PAGINATED_ARTISTS_QUERY,
  PAGINATED_GALLERIES_QUERY,
} from '../sanity/lib/queries';
import {
  REVIEWS_QUERYResult,
  EXHIBITIONS_QUERYResult,
  ARTISTS_QUERYResult,
  GUIDES_QUERYResult,
  AUTHORS_QUERYResult,
  GALLERIES_QUERYResult,
} from '../sanity/queryResults';
import { Article, Artist, Exhibition, Guide, Author, ContentType, Gallery } from '../types';
import { directusClient } from '../lib/directus';

interface ListingPageProps {
  title: string;
  type: 'reviews' | 'artists' | 'exhibitions' | 'guides' | 'ambassadors' | 'galleries';
}

type ListingEntity = Article | Artist | Exhibition | Guide | Author | Gallery;

const PAGE_SIZE = 10;
const PAGINATED_TYPES = new Set<ListingPageProps['type']>(['artists', 'galleries']);
const SCRAPE_WINDOW_MS = 5 * 60 * 1000;
const SCRAPE_LIMIT = 6;

const registerListingFetch = (listingType: ListingPageProps['type']) => {
  if (typeof window === 'undefined') {
    return true;
  }

  const storageKey = `listing-fetch:${listingType}`;
  const now = Date.now();
  let history: number[] = [];

  try {
    history = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]');
  } catch (error) {
    console.warn('Unable to parse listing fetch history', error);
    history = [];
  }

  history = history.filter((timestamp) => now - timestamp < SCRAPE_WINDOW_MS);

  if (history.length >= SCRAPE_LIMIT) {
    sessionStorage.setItem(storageKey, JSON.stringify(history));
    return false;
  }

  history.push(now);
  sessionStorage.setItem(storageKey, JSON.stringify(history));
  return true;
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

const mapExhibitionToCard = (exhibition: EXHIBITIONS_QUERYResult[number]): Exhibition => ({
  id: exhibition._id,
  slug: exhibition.slug?.current ?? exhibition._id,
  title: exhibition.title ?? 'Untitled Exhibition',
  gallery: exhibition.gallery?.name ?? 'Gallery',
  city: exhibition.gallery?.city ?? 'City',
  image: `https://picsum.photos/seed/${exhibition._id}/600/600`,
  startDate: formatDate(exhibition.startDate) ?? 'TBC',
  endDate: formatDate(exhibition.endDate) ?? 'TBC',
  description: exhibition.description ?? '',
});

const mapArtistToCard = (artist: ARTISTS_QUERYResult[number]): Artist => ({
  id: artist._id,
  slug: artist.slug?.current ?? artist._id,
  name: artist.name ?? 'Unknown Artist',
  image: artist.photo?.asset?.url ?? `https://picsum.photos/seed/${artist._id}/600/600`,
  bio: artist.bio ?? '',
  discipline: [],
  location: '',
  featuredWork: artist.photo?.asset?.url ?? `https://picsum.photos/seed/${artist._id}-work/600/600`,
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

const buildGalleryImageUrl = (
  directusImageFile?: string | null,
  sanityImageUrl?: string | null,
  fallbackSeed?: string
) => {
  if (directusImageFile) {
    try {
      return directusClient.getImageUrl(directusImageFile, { width: 900, quality: 80 });
    } catch (error) {
      console.warn('Failed to build Directus image URL', error);
    }
  }
  if (sanityImageUrl) {
    return sanityImageUrl;
  }
  return fallbackSeed ? `https://picsum.photos/seed/${fallbackSeed}/600/600` : `https://picsum.photos/600/600`;
};

const mapGalleryToCard = (gallery: GALLERIES_QUERYResult[number]): Gallery => ({
  id: gallery._id,
  slug: gallery.slug?.current ?? gallery._id,
  name: gallery.name ?? 'Gallery',
  city: gallery.city ?? undefined,
  country: gallery.country ?? undefined,
  address: gallery.address ?? undefined,
  image: buildGalleryImageUrl(gallery.directusImageFile, gallery.mainImage?.asset?.url, gallery._id),
  description: gallery.description ?? undefined,
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
  const [data, setData] = useState<ListingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [scrapeBlocked, setScrapeBlocked] = useState(false);
  const isPaginatedType = PAGINATED_TYPES.has(type);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);

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

      if (!registerListingFetch(listingType)) {
        if (isMountedRef.current && listingType === type) {
          setScrapeBlocked(true);
          setHasMore(false);
          setError('Scrolling paused. Please take a short break before loading more.');
          if (replace) {
            setLoading(false);
          }
        }
        return;
      }

      if (replace) {
        setLoading(true);
        setData([]);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = { offset: startOffset, end: startOffset + PAGE_SIZE + 1 };
        let mappedBatch: ListingEntity[] = [];
        let hasExtra = false;
        let processedCount = 0;

        if (listingType === 'artists') {
          const rawArtists = await client.fetch<ARTISTS_QUERYResult>(PAGINATED_ARTISTS_QUERY, params);
          const rows = Array.isArray(rawArtists) ? rawArtists : [];
          hasExtra = rows.length > PAGE_SIZE;
          const trimmed = hasExtra ? rows.slice(0, PAGE_SIZE) : rows;
          mappedBatch = trimmed.map(mapArtistToCard);
          processedCount = trimmed.length;
        } else {
          const rawGalleries = await client.fetch<GALLERIES_QUERYResult>(PAGINATED_GALLERIES_QUERY, params);
          const rows = Array.isArray(rawGalleries) ? rawGalleries : [];
          hasExtra = rows.length > PAGE_SIZE;
          const trimmed = hasExtra ? rows.slice(0, PAGE_SIZE) : rows;
          mappedBatch = trimmed.map(mapGalleryToCard);
          processedCount = trimmed.length;
        }

        if (!isMountedRef.current || listingType !== type) return;

        setData((prev) => (replace ? mappedBatch : [...prev, ...mappedBatch]));
        setHasMore(hasExtra);
        setOffset(startOffset + processedCount);
        setError(mappedBatch.length === 0 && replace ? 'No published entries yet.' : null);
      } catch (err) {
        console.error(`❌ Error fetching ${listingType}:`, err);
        if (!isMountedRef.current || listingType !== type) return;
        if (replace) {
          setData([]);
        }
        setError('Unable to sync from Sanity right now.');
      } finally {
        if (!isMountedRef.current || listingType !== type) return;
        if (replace) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [type]
  );

  useEffect(() => {
    let isMounted = true;
    setData([]);
    setError(null);
    setHasMore(false);
    setOffset(0);
    setScrapeBlocked(false);

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
            const exhibitions = await client.fetch<EXHIBITIONS_QUERYResult>(EXHIBITIONS_QUERY);
            mapped = (exhibitions ?? []).map(mapExhibitionToCard);
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
        setError('Unable to sync from Sanity right now.');
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
    if (!isPaginatedType || loading || loadingMore || !hasMore || scrapeBlocked) {
      return;
    }
    fetchPaginatedPage(offset, false);
  }, [fetchPaginatedPage, hasMore, isPaginatedType, loading, loadingMore, offset, scrapeBlocked]);

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

  const cardType: Parameters<typeof EntityCard>[0]['type'] = CARD_TYPE_MAP[type];

  return (
    <div className="min-h-screen bg-art-paper">
      {/* Header */}
      <div className="bg-white border-b-2 border-black pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8">{title}</h1>

          {/* Simulated Filters */}
          <div className="flex flex-wrap gap-4 font-mono text-xs uppercase font-bold">
            <button className="bg-black text-white px-4 py-2 border-2 border-black">All</button>
            <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Featured</button>
            <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Latest</button>
            {type === 'exhibitions' && (
              <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Opening Soon</button>
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

        {scrapeBlocked && (
          <p className="mt-6 font-mono text-xs text-amber-600">
            Мы временно остановили подгрузку, чтобы защитить списки от автоматического копирования. Попробуйте снова через минуту.
          </p>
        )}

        {isPaginatedType && !scrapeBlocked && (
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