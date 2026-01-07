import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { client } from '../sanity/lib/client';
import { ARTICLES_QUERY } from '../sanity/lib/queries';
import { ARTICLES_QUERYResult } from '../sanity/types';
import { EntityCard, SkeletonCard } from '../components/Shared';
import { Article, ContentType } from '../types';
import { useSeo } from '../lib/useSeo';

type ArticleContentType = 'exhibition-review' | 'news' | 'book-review' | 'film-review';

interface FilterButton {
  label: string;
  value: ArticleContentType | 'all';
  icon: string;
}

const FILTER_BUTTONS: FilterButton[] = [
  { label: 'All', value: 'all', icon: '' },
  { label: 'Reviews', value: 'exhibition-review', icon: '' },
  { label: 'News', value: 'news', icon: '' },
  { label: 'Books', value: 'book-review', icon: '' },
  { label: 'Films', value: 'film-review', icon: '' },
];

const CONTENT_TYPE_LABELS: Record<ArticleContentType, string> = {
  'exhibition-review': 'Exhibition Review',
  'news': 'News',
  'book-review': 'Book Review',
  'film-review': 'Film Review',
};

const formatDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const mapArticleToCard = (article: ARTICLES_QUERYResult[number]): Article => {
  const contentType = article.contentType as ArticleContentType;
  
  // Build subtitle based on content type
  let subtitle = article.excerpt ?? '';
  if (contentType === 'news' && article.newsSource) {
    subtitle = `${article.newsSource} • ${subtitle}`;
  } else if (contentType === 'book-review' && article.bookAuthor) {
    subtitle = `by ${article.bookAuthor}`;
  } else if (contentType === 'film-review') {
    const filmCount = Array.isArray(article.filmReviews) ? article.filmReviews.length : 0;
    if (filmCount) {
      const leadFilm = article.filmReviews?.[0];
      const detailParts: string[] = [];
      if (filmCount > 1) {
        detailParts.push(`${filmCount} films`);
      }
      if (leadFilm?.title) {
        detailParts.push(leadFilm.title);
      }
      if (leadFilm?.director) {
        detailParts.push(`Dir. ${leadFilm.director}`);
      }
      subtitle = detailParts.join(' • ');
    }
  }

  return {
    id: article._id,
    slug: article.slug?.current ?? article._id,
    type: ContentType.REVIEW, // Keep as REVIEW for now to maintain compatibility
    title: article.title ?? 'Untitled',
    subtitle,
    image: article.mainImage?.asset?.url ?? `https://picsum.photos/seed/${article._id}/600/600`,
    date: formatDate(article.publishedAt),
    author: article.author
      ? {
          id: article.author._id,
          name: article.author.name ?? 'Anonymous',
          role: 'Writer',
          image: article.author.photo?.asset?.url ?? '',
        }
      : undefined,
    contentType: contentType,
    contentTypeLabel: CONTENT_TYPE_LABELS[contentType],
    rating: contentType === 'exhibition-review' ? article.rating : undefined,
  };
};

const Stories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const activeFilter = (searchParams.get('filter') as ArticleContentType | 'all') || 'all';

  useSeo({
    title: activeFilter === 'all' ? 'Stories' : `${FILTER_BUTTONS.find(f => f.value === activeFilter)?.label} - Stories`,
    description: 'Explore art exhibition reviews, news, book reviews, and film critiques',
  });

  // Fetch all articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const result = await client.fetch<ARTICLES_QUERYResult>(ARTICLES_QUERY);
        const mapped = result.map(mapArticleToCard);
        setArticles(mapped);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles based on active filter
  const filteredArticles = useMemo(() => {
    if (activeFilter === 'all') return articles;
    return articles.filter((article) => article.contentType === activeFilter);
  }, [articles, activeFilter]);

  const handleFilterChange = (filter: ArticleContentType | 'all') => {
    if (filter === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filter);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-art-yellow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-art-red"></div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">Stories</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b-2 border-gray-200">
          {FILTER_BUTTONS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`
                  px-4 py-2 font-mono text-sm uppercase tracking-wide border-2 border-black
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-art-blue text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }
                `}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-sm font-mono text-gray-600">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'story' : 'stories'}
              {activeFilter !== 'all' && (
                <span className="ml-2">
                  in <strong>{FILTER_BUTTONS.find((f) => f.value === activeFilter)?.label}</strong>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} type="article" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl font-mono text-gray-600">
              No {activeFilter !== 'all' && FILTER_BUTTONS.find((f) => f.value === activeFilter)?.label.toLowerCase()} stories yet
            </p>
            <p className="text-sm font-mono text-gray-400 mt-2">Check back soon for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Story Card Component with Content Type Badge
const StoryCard: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <Link
      to={`/stories/${article.slug}`}
      className="group block border-2 border-black bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] transition-all duration-200 h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden border-b-2 border-black">
        <img
          src={article.image}
          alt={article.title}
          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
        />
        
        {/* Content Type Badge */}
        {article.contentTypeLabel && (
          <div className="absolute top-0 left-0 bg-white px-3 py-1 text-xs font-mono font-bold uppercase border-b-2 border-r-2 border-black group-hover:bg-art-blue group-hover:text-white transition-colors">
            {article.contentTypeLabel}
          </div>
        )}

        {/* Rating Badge (only for reviews) */}
        {article.rating && (
          <div className="absolute top-0 right-0 bg-art-yellow px-3 py-1 text-xs font-mono font-bold border-b-2 border-l-2 border-black">
            {'⭐'.repeat(Math.round(article.rating))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-black uppercase mb-2 group-hover:text-art-blue transition-colors line-clamp-2">
          {article.title}
        </h3>

        {article.subtitle && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{article.subtitle}</p>
        )}

        <div className="flex items-center justify-between text-xs font-mono text-gray-500 mt-auto pt-4 border-t border-gray-200">
          <span>{article.author?.name ?? 'Anonymous'}</span>
          {article.date && <span>{article.date}</span>}
        </div>
      </div>
    </Link>
  );
};

export default Stories;
