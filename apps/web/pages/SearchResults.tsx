import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { client } from '../sanity/lib/client';
import { defineQuery } from 'groq';
import { ArticleCard, EntityCard } from '../components/Shared';
import { Artist, Author, ContentType, Gallery, Guide, GuideStep } from '../types';
import { searchGalleries, searchArtists, searchExhibitions, GraphqlArtist, GraphqlExhibition } from '../lib/graphql';
import { mapGraphqlGalleryToEntity } from '../lib/galleryMapping';

type Slug = { current?: string | null } | null | undefined;
type ImageField = { asset?: { url?: string | null } | null } | null | undefined;

type ReviewDoc = {
  _id: string;
  title?: string | null;
  slug?: Slug;
  excerpt?: string | null;
  publishStatus?: string | null;
  mainImage?: ImageField;
  publishedAt?: string | null;
  author?: {
    _id: string;
    name?: string | null;
    photo?: ImageField;
  } | null;
};

type ExhibitionDoc = {
  _id: string;
  title?: string | null;
  slug?: Slug;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  gallery?: {
    name?: string | null;
    city?: string | null;
  } | null;
};

type ArtistDoc = {
  _id: string;
  name?: string | null;
  slug?: Slug;
  photo?: ImageField;
};

type GuideDoc = {
  _id: string;
  title?: string | null;
  slug?: Slug;
  city?: string | null;
  description?: string | null;
  coverImage?: ImageField;
};

type AmbassadorDoc = {
  _id: string;
  name?: string | null;
  slug?: Slug;
  role?: string | null;
  bio?: string | null;
  photo?: ImageField;
};

type SearchQueryResponse = {
  reviews?: ReviewDoc[];
  guides?: GuideDoc[];
  ambassadors?: AmbassadorDoc[];
};

type FilteredResults = {
  reviews: ReviewDoc[];
  exhibitions: GraphqlExhibition[];
  artists: GraphqlArtist[];
  galleries: Gallery[];
  guides: Guide[];
  ambassadors: Author[];
};

const ROLE_LABELS: Record<string, string> = {
  author: 'Author',
  editor: 'Editor',
  chiefEditor: 'Editor-in-Chief',
};

const AMBASSADOR_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"%3E%3Crect width="600" height="600" fill="%23f4f4f4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

const squarePlaceholder = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

const matchesQuery = (value: string | null | undefined, term: string) =>
  value?.toLowerCase().includes(term) ?? false;

const formatRole = (role?: string | null) => (role && ROLE_LABELS[role]) || 'Contributor';

const mapGuideToCard = (guide: GuideDoc): Guide => ({
  id: guide._id,
  slug: guide.slug?.current ?? guide._id,
  type: ContentType.GUIDE,
  title: guide.title ?? 'Untitled Guide',
  subtitle: guide.description ?? (guide.city ? `Curated walk in ${guide.city}` : 'Curated trail'),
  image: guide.coverImage?.asset?.url ?? squarePlaceholder(`guide-${guide._id}`),
  author: undefined,
  date: undefined,
  steps: [] as GuideStep[],
  city: guide.city ?? 'City guide',
});

const mapAmbassadorToCard = (ambassador: AmbassadorDoc): Author => ({
  id: ambassador._id,
  slug: ambassador.slug?.current ?? ambassador._id,
  name: ambassador.name ?? 'Ambassador',
  role: formatRole(ambassador.role),
  image: ambassador.photo?.asset?.url ?? AMBASSADOR_PLACEHOLDER,
  bio: ambassador.bio ?? undefined,
});

const createEmptyResults = (): FilteredResults => ({
  reviews: [],
  exhibitions: [],
  artists: [],
  galleries: [],
  guides: [],
  ambassadors: [],
});

// GROQ запрос для получения документов из Sanity (без художников и выставок - они теперь из GraphQL)
const SEARCH_QUERY = defineQuery(`{
  "reviews": *[_type == "review"] {
    _id,
    title,
    slug,
    excerpt,
    publishStatus,
    mainImage {
      asset->{ url }
    },
    publishedAt,
    author->{ _id, name, photo { asset->{ url } } }
  },
  "guides": *[_type == "guide"] {
    _id,
    title,
    slug,
    city,
    description,
    coverImage {
      asset->{ url }
    }
  },
  "ambassadors": *[_type == "author"] {
    _id,
    name,
    slug,
    role,
    bio,
    photo {
      asset->{ url }
    }
  }
}`);

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<FilteredResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(createEmptyResults());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Searching for:', query);
        
        // Получаем данные параллельно из Sanity и GraphQL
        const [sanityData, graphqlGalleries, graphqlArtists, graphqlExhibitions] = await Promise.all([
          client.fetch<SearchQueryResponse>(SEARCH_QUERY),
          searchGalleries(query, 40).catch((err) => {
            console.error('⚠️ GraphQL gallery search failed:', err);
            return [];
          }),
          searchArtists(query, 40).catch((err) => {
            console.error('⚠️ GraphQL artist search failed:', err);
            return [];
          }),
          searchExhibitions(query, 40).catch((err) => {
            console.error('⚠️ GraphQL exhibition search failed:', err);
            return [];
          }),
        ]);

        const normalizedGalleries = graphqlGalleries.map(mapGraphqlGalleryToEntity);
        console.log('📦 All data fetched:', {
          reviews: sanityData.reviews?.length ?? 0,
          exhibitions: graphqlExhibitions.length,
          artists: graphqlArtists.length,
          galleries: normalizedGalleries.length,
          guides: sanityData.guides?.length ?? 0,
          ambassadors: sanityData.ambassadors?.length ?? 0,
        });
        
        // Фильтруем на клиенте (case-insensitive)
        const searchLower = query.toLowerCase();
        console.log('🔎 Search term (lowercase):', searchLower);

        const filteredResults: FilteredResults = {
          reviews:
            sanityData.reviews?.filter(
              (r) =>
                r.publishStatus === 'published' &&
                (matchesQuery(r.title, searchLower) || matchesQuery(r.excerpt, searchLower)),
            ) ?? [],
          exhibitions: graphqlExhibitions,
          artists: graphqlArtists,
          galleries: normalizedGalleries,
          guides:
            sanityData.guides?.reduce<Guide[]>((acc, guide) => {
              if (
                matchesQuery(guide.title, searchLower) ||
                matchesQuery(guide.description, searchLower) ||
                matchesQuery(guide.city, searchLower)
              ) {
                acc.push(mapGuideToCard(guide));
              }
              return acc;
            }, []) ?? [],
          ambassadors:
            sanityData.ambassadors?.reduce<Author[]>((acc, ambassador) => {
              if (
                matchesQuery(ambassador.name, searchLower) ||
                matchesQuery(ambassador.role, searchLower) ||
                matchesQuery(ambassador.bio, searchLower)
              ) {
                acc.push(mapAmbassadorToCard(ambassador));
              }
              return acc;
            }, []) ?? [],
        };

        console.log('✅ Filtered results:', {
          reviews: filteredResults.reviews.length,
          exhibitions: filteredResults.exhibitions.length,
          artists: filteredResults.artists.length,
          galleries: filteredResults.galleries.length,
          guides: filteredResults.guides.length,
          ambassadors: filteredResults.ambassadors.length,
        });
        setResults(filteredResults);
        setLoading(false);
      } catch (error) {
        console.error('❌ Search error:', error);
        setResults(createEmptyResults());
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResults = results
    ? results.reviews.length +
      results.exhibitions.length +
      results.artists.length +
      results.galleries.length +
      results.guides.length +
      results.ambassadors.length
    : 0;

  return (
    <div className="min-h-screen bg-art-paper py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase mb-4">
            Search Results
          </h1>
          <p className="text-xl font-mono">
            {query ? (
              <>
                Searching for: <span className="font-bold">"{query}"</span>
                {!loading && ` — ${totalResults} results found`}
              </>
            ) : (
              'Enter a search term to find exhibitions, guides, ambassadors, artists, and galleries'
            )}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
            <p className="mt-4 font-mono text-sm uppercase">Searching...</p>
          </div>
        )}

        {/* No query */}
        {!query && !loading && (
          <div className="text-center py-24 border-2 border-black p-12">
            <p className="text-2xl font-bold mb-4">No search query entered</p>
            <p className="font-mono text-gray-600">Use the search bar in the header to find content</p>
          </div>
        )}

        {/* No results */}
        {query && !loading && totalResults === 0 && (
          <div className="text-center py-24 border-2 border-black p-12">
            <p className="text-2xl font-bold mb-4">No results found for "{query}"</p>
            <p className="font-mono text-gray-600">Try a different search term</p>
          </div>
        )}

        {/* Results */}
        {!loading && results && totalResults > 0 && (
          <div className="space-y-16">
            {/* Reviews */}
            {results.reviews.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-red pl-4">
                  Reviews ({results.reviews.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.reviews.map((review) => (
                    <ArticleCard
                      key={review._id}
                      article={{
                        id: review._id,
                        slug: review.slug?.current ?? review._id,
                        title: review.title ?? 'Untitled story',
                        subtitle: review.excerpt || '',
                        image: review.mainImage?.asset?.url || squarePlaceholder(`review-${review._id}`),
                        date: review.publishedAt
                          ? new Date(review.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : undefined,
                        type: ContentType.REVIEW,
                        author: review.author
                          ? {
                              id: review.author._id,
                              name: review.author.name ?? 'Contributor',
                              role: 'Critic',
                              image: review.author.photo?.asset?.url ?? '',
                            }
                          : undefined,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Exhibitions */}
            {results.exhibitions.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-blue pl-4">
                  Exhibitions ({results.exhibitions.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.exhibitions.map((exhibition) => {
                    const start = exhibition.datefrom
                      ? new Date(exhibition.datefrom).toLocaleDateString()
                      : 'TBC';
                    const end = exhibition.dateto
                      ? new Date(exhibition.dateto).toLocaleDateString()
                      : 'TBC';
                    return (
                      <Link
                        key={exhibition.id}
                        to={`/galleries/${exhibition.gallery_id || ''}`}
                        className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all block"
                      >
                        <h3 className="text-xl font-bold uppercase mb-2">{exhibition.title || 'Untitled'}</h3>
                        <p className="font-mono text-sm text-gray-600">
                          {exhibition.galleryname} • {exhibition.city}
                        </p>
                        <p className="font-mono text-xs text-gray-500 mt-2">
                          {start} - {end}
                        </p>
                        <span className="inline-block mt-4 text-sm font-bold uppercase hover:text-art-blue">
                          View Gallery →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Guides */}
            {results.guides.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-blue pl-4">
                  Guides ({results.guides.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.guides.map((guide) => (
                    <EntityCard
                      key={guide.slug ?? guide.id}
                      data={guide}
                      type="guide"
                      imageAspect="square"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {results.artists.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-yellow pl-4">
                  Artists ({results.artists.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.artists.map((artist) => {
                    const lifespan = artist.birth_year
                      ? artist.death_year
                        ? `${artist.birth_year}–${artist.death_year}`
                        : `b. ${artist.birth_year}`
                      : null;
                    // Create URL slug from artist name
                    const nameSlug = artist.name
                      ? artist.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
                      : '';
                    const artistSlug = nameSlug ? `${nameSlug}-${artist.id}` : artist.id;
                    return (
                      <Link
                        key={artist.id}
                        to={`/artists/${artistSlug}`}
                        className="border-2 border-black p-4 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
                      >
                        <h3 className="font-bold uppercase text-lg mb-1">{artist.name}</h3>
                        {(artist.country || lifespan) && (
                          <p className="font-mono text-xs text-gray-500">
                            {[artist.country, lifespan].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Ambassadors */}
            {results.ambassadors.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-black pl-4">
                  Ambassadors ({results.ambassadors.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.ambassadors.map((ambassador) => (
                    <EntityCard key={ambassador.id} data={ambassador} type="author" />
                  ))}
                </div>
              </section>
            )}

            {/* Galleries */}
            {results.galleries.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-black pl-4">
                  Galleries ({results.galleries.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.galleries.map((gallery) => (
                    <EntityCard key={gallery.slug ?? gallery.id} data={gallery} type="gallery" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
