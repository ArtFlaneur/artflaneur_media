import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EntityCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import {
  REVIEWS_QUERY,
  AUTHORS_QUERY,
  GUIDES_QUERY,
  PAGINATED_ARTISTS_QUERY,
} from '../sanity/lib/queries';
import {
  REVIEWS_QUERYResult,
  ARTISTS_QUERYResult,
  GUIDES_QUERYResult,
  AUTHORS_QUERYResult,
} from '../sanity/types';
import { Article, Artist, Exhibition, Guide, Author, ContentType, Gallery } from '../types';
import { fetchExhibitions, fetchGalleries, GraphqlExhibition, GraphqlGallery } from '../lib/graphql';

interface ListingPageProps {
  title: string;
  type: 'reviews' | 'artists' | 'exhibitions' | 'guides' | 'ambassadors' | 'galleries';
}

type ListingEntity = Article | Artist | Exhibition | Guide | Author | Gallery;

const PAGE_SIZE = 10;
const PAGINATED_TYPES = new Set<ListingPageProps['type']>(['artists', 'galleries']);

const getArtistImage = (artist: ARTISTS_QUERYResult[number]) => artist.photo?.asset?.url ?? null;

const hasArtistContent = (artist: ARTISTS_QUERYResult[number]) =>
  Boolean(artist.name?.trim() && artist.bio?.trim() && getArtistImage(artist));

const buildGraphqlGalleryImage = (gallery: GraphqlGallery): string => {
  if (gallery.gallery_img_url) {
    return gallery.gallery_img_url;
  }

  if (gallery.logo_img_url) {
    return gallery.logo_img_url;
  }

  return `https://picsum.photos/seed/graphql-gallery-${gallery.id}/600/600`;
};

const mapGraphqlGalleryToCard = (gallery: GraphqlGallery): Gallery => ({
  id: String(gallery.id),
  slug: String(gallery.id),
  name: gallery.galleryname ?? 'Gallery',
  city: gallery.city ?? undefined,
  country: gallery.country ?? undefined,
  address: gallery.fulladdress ?? undefined,
  image: buildGraphqlGalleryImage(gallery),
  description: gallery.openinghours ?? undefined,
});

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

const mapArtistToCard = (artist: ARTISTS_QUERYResult[number]): Artist => {
  const image = getArtistImage(artist) ?? '';
  return {
    id: artist._id,
    slug: artist.slug?.current ?? artist._id,
    name: artist.name ?? 'Unknown Artist',
    image,
    bio: artist.bio ?? '',
    discipline: [],
    location: '',
    featuredWork: image,
  };
};

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
  const [data, setData] = useState<ListingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const isPaginatedType = PAGINATED_TYPES.has(type);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const pendingCardsRef = useRef<ListingEntity[]>([]);
  const galleryCursorRef = useRef<string | null>(null);

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
        galleryCursorRef.current = null;
      } else {
        setLoadingMore(true);
      }

      try {
        const nextBatch: ListingEntity[] = [];
        let nextOffset = startOffset;
        let reachedEnd = false;

        if (pendingCardsRef.current.length) {
          const take = Math.min(PAGE_SIZE, pendingCardsRef.current.length);
          nextBatch.push(...pendingCardsRef.current.splice(0, take));
        }

          while (nextBatch.length < PAGE_SIZE && !reachedEnd) {
            const params = { offset: nextOffset, end: nextOffset + PAGE_SIZE + 1 };

            if (listingType === 'artists') {
              const rawArtists = await client.fetch<ARTISTS_QUERYResult>(PAGINATED_ARTISTS_QUERY, params);
              const rows = Array.isArray(rawArtists) ? rawArtists : [];

              if (!rows.length) {
                reachedEnd = true;
                break;
              }

              nextOffset += rows.length;

              const mapped = rows.filter(hasArtistContent).map(mapArtistToCard);

              if (!mapped.length) {
                if (rows.length <= PAGE_SIZE) {
                  reachedEnd = true;
                }
                continue;
              }

              const slots = PAGE_SIZE - nextBatch.length;
              nextBatch.push(...mapped.slice(0, slots));
              const leftover = mapped.slice(slots);

              if (leftover.length) {
                pendingCardsRef.current = leftover;
                break;
              }

              if (rows.length <= PAGE_SIZE) {
                reachedEnd = true;
              }
            } else {
              const connection = await fetchGalleries({
                limit: PAGE_SIZE + 1,
                nextToken: galleryCursorRef.current ?? undefined,
              });

              const rows = Array.isArray(connection.items) ? connection.items : [];
              galleryCursorRef.current = connection.nextToken ?? null;

              if (!rows.length) {
                reachedEnd = !galleryCursorRef.current;
                break;
              }

              const mapped = rows.map(mapGraphqlGalleryToCard);

              const slots = PAGE_SIZE - nextBatch.length;
              nextBatch.push(...mapped.slice(0, slots));
              const leftover = mapped.slice(slots);

              if (leftover.length) {
                pendingCardsRef.current = leftover;
                break;
              }

              if (!galleryCursorRef.current) {
                reachedEnd = true;
              }
            }
          }

        if (!isMountedRef.current || listingType !== type) return;

        setData((prev) => (replace ? nextBatch : [...prev, ...nextBatch]));
        const hasPending = pendingCardsRef.current.length > 0;
        setHasMore(hasPending || !reachedEnd);
        setOffset(nextOffset);
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
    [type]
  );

  useEffect(() => {
    let isMounted = true;
    setData([]);
    setError(null);
    setHasMore(false);
    setOffset(0);
    pendingCardsRef.current = [];

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
    fetchPaginatedPage(offset, false);
  }, [fetchPaginatedPage, hasMore, isPaginatedType, loading, loadingMore, offset]);

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
    galleryCursorRef.current = null;
  }, [type]);

  const cardType: Parameters<typeof EntityCard>[0]['type'] = CARD_TYPE_MAP[type];

  return (
    <div className="min-h-screen bg-art-paper">
      {/* Header */}
      <div className="bg-white border-b-2 border-black pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-6 mb-8">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter flex flex-wrap items-baseline gap-4">
              <span>{title}</span>
            </h1>
          </div>

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