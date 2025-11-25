import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { client } from '../sanity/lib/client';
import { defineQuery } from 'groq';
import { ArticleCard, EntityCard } from '../components/Shared';
import { ContentType } from '../types';

// GROQ запрос для получения всех документов (временно без фильтров для отладки)
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
    author->{ _id, name }
  },
  "exhibitions": *[_type == "exhibition"] {
    _id,
    title,
    slug,
    startDate,
    endDate,
    description,
    gallery->{ name, city }
  },
  "artists": *[_type == "artist"] {
    _id,
    name,
    slug,
    photo {
      asset->{ url }
    }
  },
  "galleries": *[_type == "gallery"] {
    _id,
    name,
    slug,
    city
  }
}`);

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Searching for:', query);
        
        // Получаем все данные
        const data = await client.fetch(SEARCH_QUERY);
        console.log('📦 All data fetched:', data);
        console.log('📊 Reviews count:', data.reviews?.length);
        console.log('📊 Exhibitions count:', data.exhibitions?.length);
        
        // Фильтруем на клиенте (case-insensitive)
        const searchLower = query.toLowerCase();
        console.log('🔎 Search term (lowercase):', searchLower);
        
        // Проверим первый review для отладки
        if (data.reviews && data.reviews.length > 0) {
          console.log('🎯 First review:', {
            title: data.reviews[0].title,
            titleLower: data.reviews[0].title?.toLowerCase(),
            matches: data.reviews[0].title?.toLowerCase().includes(searchLower)
          });
        }
        
        const filteredResults = {
          reviews: data.reviews?.filter((r: any) => {
            // Показываем только опубликованные
            if (r.publishStatus !== 'published') return false;
            
            const matches = r.title?.toLowerCase().includes(searchLower) ||
                          r.excerpt?.toLowerCase().includes(searchLower);
            if (matches) {
              console.log('✅ Match found in review:', r.title);
            }
            return matches;
          }) || [],
          exhibitions: data.exhibitions?.filter((e: any) => 
            e.title?.toLowerCase().includes(searchLower) ||
            e.description?.toLowerCase().includes(searchLower)
          ) || [],
          artists: data.artists?.filter((a: any) => 
            a.name?.toLowerCase().includes(searchLower)
          ) || [],
          galleries: data.galleries?.filter((g: any) => 
            g.name?.toLowerCase().includes(searchLower) ||
            g.city?.toLowerCase().includes(searchLower)
          ) || []
        };
        
        console.log('✅ Filtered results:', filteredResults);
        console.log('📈 Total matches:', 
          filteredResults.reviews.length + 
          filteredResults.exhibitions.length + 
          filteredResults.artists.length + 
          filteredResults.galleries.length
        );
        setResults(filteredResults);
        setLoading(false);
      } catch (error) {
        console.error('❌ Search error:', error);
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResults = results 
    ? (results.reviews?.length || 0) + 
      (results.exhibitions?.length || 0) + 
      (results.artists?.length || 0) + 
      (results.galleries?.length || 0)
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
              'Enter a search term to find exhibitions, artists, and galleries'
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
            {results.reviews && results.reviews.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-red pl-4">
                  Reviews ({results.reviews.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.reviews.map((review: any) => (
                    <ArticleCard
                      key={review._id}
                      article={{
                        id: review._id,
                        title: review.title,
                        subtitle: review.excerpt || '',
                        image: review.mainImage?.asset?.url || 'https://picsum.photos/400/300',
                        date: new Date(review.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }),
                        type: ContentType.REVIEW,
                        author: review.author ? {
                          id: review.author._id,
                          name: review.author.name,
                          role: 'Critic',
                          image: ''
                        } : undefined
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Exhibitions */}
            {results.exhibitions && results.exhibitions.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-blue pl-4">
                  Exhibitions ({results.exhibitions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.exhibitions.map((exhibition: any) => (
                    <div key={exhibition._id} className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <h3 className="text-xl font-bold uppercase mb-2">{exhibition.title}</h3>
                      <p className="font-mono text-sm text-gray-600">
                        {exhibition.gallery?.name} • {exhibition.gallery?.city}
                      </p>
                      <p className="font-mono text-xs text-gray-500 mt-2">
                        {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/exhibitions/${exhibition.slug.current}`}
                        className="inline-block mt-4 text-sm font-bold uppercase hover:text-art-blue"
                      >
                        View Details →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {results.artists && results.artists.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-art-yellow pl-4">
                  Artists ({results.artists.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {results.artists.map((artist: any) => (
                    <Link
                      key={artist._id}
                      to={`/artists/${artist.slug.current}`}
                      className="border-2 border-black p-4 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
                    >
                      <div className="aspect-square mb-3 overflow-hidden">
                        <img
                          src={artist.photo?.asset?.url || 'https://picsum.photos/300/300'}
                          alt={artist.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                      <h3 className="font-bold uppercase text-sm">{artist.name}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Galleries */}
            {results.galleries && results.galleries.length > 0 && (
              <section>
                <h2 className="text-3xl font-black uppercase mb-6 border-l-4 border-black pl-4">
                  Galleries ({results.galleries.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.galleries.map((gallery: any) => (
                    <div key={gallery._id} className="border border-black p-4 bg-white hover:bg-art-yellow transition-colors">
                      <h3 className="font-bold uppercase">{gallery.name}</h3>
                      <p className="font-mono text-xs text-gray-600">{gallery.city}</p>
                    </div>
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
