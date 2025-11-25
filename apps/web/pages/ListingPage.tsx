import React, { useEffect, useState } from 'react';
import { EntityCard } from '../components/Shared';
import { MOCK_ARTICLES, MOCK_ARTISTS, MOCK_EXHIBITIONS, AUTHORS, MOCK_GUIDES } from '../constants';
import { client } from '../sanity/lib/client';
import { REVIEWS_QUERY, EXHIBITIONS_QUERY, ARTISTS_QUERY, AUTHORS_QUERY, GUIDES_QUERY } from '../sanity/lib/queries';
import { REVIEWS_QUERYResult, EXHIBITIONS_QUERYResult, ARTISTS_QUERYResult, GUIDES_QUERYResult, AUTHORS_QUERYResult } from '../sanity/types';
import { Article, Artist, Exhibition, Guide, Author, ContentType } from '../types';

interface ListingPageProps {
  title: string;
  type: 'reviews' | 'artists' | 'exhibitions' | 'guides' | 'ambassadors';
}

type ListingEntity = Article | Artist | Exhibition | Guide | Author;

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
  image: review.mainImage?.asset?.url ?? `https://picsum.photos/seed/${review._id}/800/600`,
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
  image: `https://picsum.photos/seed/${exhibition._id}/800/600`,
  startDate: formatDate(exhibition.startDate) ?? 'TBC',
  endDate: formatDate(exhibition.endDate) ?? 'TBC',
  description: exhibition.description ?? '',
});

const mapArtistToCard = (artist: ARTISTS_QUERYResult[number]): Artist => ({
  id: artist._id,
  slug: artist.slug?.current ?? artist._id,
  name: artist.name ?? 'Unknown Artist',
  image: artist.photo?.asset?.url ?? `https://picsum.photos/seed/${artist._id}/600/800`,
  bio: artist.bio ?? '',
  discipline: [],
  location: '',
  featuredWork: artist.photo?.asset?.url ?? `https://picsum.photos/seed/${artist._id}-work/800/600`,
});

const mapGuideToCard = (guide: GUIDES_QUERYResult[number]): Guide => ({
  id: guide._id,
  slug: guide.slug?.current ?? guide._id,
  type: ContentType.GUIDE,
  title: guide.title ?? 'Untitled Guide',
  subtitle: guide.description ?? '',
  city: guide.city ?? 'City',
  image: guide.coverImage?.asset?.url ?? `https://picsum.photos/seed/${guide._id}/1200/800`,
  author: undefined,
  steps: [],
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

const FALLBACK_DATA = {
  reviews: MOCK_ARTICLES,
  exhibitions: MOCK_EXHIBITIONS,
  artists: MOCK_ARTISTS,
  guides: MOCK_GUIDES,
  ambassadors: AUTHORS,
} as Record<ListingPageProps['type'], ListingEntity[]>;

const CARD_TYPE_MAP = {
  reviews: 'article',
  exhibitions: 'exhibition',
  artists: 'artist',
  guides: 'guide',
  ambassadors: 'author',
} as const;

const getCardKey = (item: ListingEntity) => ('slug' in item && item.slug ? item.slug : item.id);

const ListingPage: React.FC<ListingPageProps> = ({ title, type }) => {
  const [data, setData] = useState<ListingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
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
          case 'artists': {
            const artists = await client.fetch<ARTISTS_QUERYResult>(ARTISTS_QUERY);
            mapped = (artists ?? []).map(mapArtistToCard);
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
          setData(FALLBACK_DATA[type]);
          setError('No published entries yet. Showing editorial picks instead.');
        } else {
          setData(mapped);
        }
      } catch (err) {
        console.error(`❌ Error fetching ${type}:`, err);
        if (!isMounted) return;
        setError('Unable to sync from Sanity. Showing editorial picks instead.');
        setData(FALLBACK_DATA[type]);
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
  }, [type]);

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
                    {type === 'exhibitions' && <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Opening Soon</button>}
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4 md:px-6 py-12">
            {error && (
              <p className="font-mono text-xs text-red-600 mb-4">{error}</p>
            )}
            {loading ? (
              <p className="font-mono text-sm text-gray-600">Loading curated selections…</p>
            ) : data.length ? (
              <div className={`grid gap-6 ${type === 'artists' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                {data.map((item) => (
                  <EntityCard key={getCardKey(item)} data={item} type={cardType} />
                ))}
              </div>
            ) : (
              <p className="font-mono text-sm text-gray-600">No entries to display yet.</p>
            )}
        </div>
    </div>
  );
};

export default ListingPage;