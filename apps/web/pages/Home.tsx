import React, { useEffect, useState } from 'react';
import { SectionHeader, ArticleCard, NewsletterSection, AiTeaser } from '../components/Shared';
import { MOCK_ARTICLES } from '../constants';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { client } from '../sanity/lib/client';
import { HOMEPAGE_QUERY, LATEST_REVIEWS_QUERY } from '../sanity/lib/queries';
import { HOMEPAGE_QUERYResult, LATEST_REVIEWS_QUERYResult } from '../sanity/types';
import { Article, ContentType } from '../types';

type HomepageData = NonNullable<HOMEPAGE_QUERYResult>;
type HeroSection = NonNullable<HomepageData['heroSection']>;
type FeaturedReviewNode = NonNullable<HeroSection['featuredReview']>;
type LatestReviewNode = NonNullable<HomepageData['latestReviews']>[number];
type ReviewSource = FeaturedReviewNode | LatestReviewNode | LATEST_REVIEWS_QUERYResult[number];

const FALLBACK_FEATURED_ARTICLE = MOCK_ARTICLES[0];
const FALLBACK_LATEST_ARTICLES = MOCK_ARTICLES.slice(1, 4);
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : undefined;

const mapReviewToArticle = (review: ReviewSource): Article => ({
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

const Home: React.FC = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article>(FALLBACK_FEATURED_ARTICLE);
  const [latestReviews, setLatestReviews] = useState<Article[]>(FALLBACK_LATEST_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [homepageData, fallbackReviews] = await Promise.all([
          client.fetch<HOMEPAGE_QUERYResult>(HOMEPAGE_QUERY),
          client.fetch<LATEST_REVIEWS_QUERYResult>(LATEST_REVIEWS_QUERY, {limit: 3}),
        ]);

        if (!isMounted) return;

        const curatedLatest: ReviewSource[] | undefined =
          homepageData?.latestReviews && homepageData.latestReviews.length > 0
            ? (homepageData.latestReviews as ReviewSource[])
            : (fallbackReviews as ReviewSource[]);

        const heroReview = (homepageData?.heroSection?.featuredReview ?? curatedLatest?.[0]) as
          | ReviewSource
          | undefined;

        setFeaturedArticle(heroReview ? mapReviewToArticle(heroReview) : FALLBACK_FEATURED_ARTICLE);
        setLatestReviews(
          curatedLatest && curatedLatest.length > 0
            ? curatedLatest.map((review) => mapReviewToArticle(review))
            : FALLBACK_LATEST_ARTICLES,
        );
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching Sanity data:', err);
        if (!isMounted) return;
        setError('Unable to load the latest editor picks. Showing curated highlights instead.');
        setFeaturedArticle(FALLBACK_FEATURED_ARTICLE);
        setLatestReviews(FALLBACK_LATEST_ARTICLES);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      
      {/* Mondrian Hero Section */}
      <section className="border-b-2 border-black relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-auto lg:h-[85vh]">
            
            {/* Feature Badge - всегда поверх изображения */}
      <div className="absolute top-0 left-0 bg-art-red text-white px-4 py-2 text-sm font-bold font-mono uppercase border-r-2 border-b-2 border-black z-10">
        {loading ? 'Syncing Latest Feature' : 'Feature of the Week'}
      </div>
            
            {/* Right: Content Grid - показывается первым на мобильных */}
            <div className="lg:col-span-5 order-1 lg:order-2">
                
                {/* Title Block */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-art-paper h-full">
                    <div className="mb-6 flex gap-2">
                        <span className="bg-black text-white px-2 py-1 text-xs font-mono uppercase">{featuredArticle.type}</span>
                        <span className="border border-black px-2 py-1 text-xs font-mono uppercase">{featuredArticle.date}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] mb-6">
                        {featuredArticle.title}
                    </h1>
                    <p className="font-serif text-xl md:text-2xl italic text-gray-600 mb-8 border-l-4 border-art-yellow pl-4">
                        {featuredArticle.subtitle}
                    </p>
                    <Link to={`/reviews/${featuredArticle.slug ?? featuredArticle.id}`} className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest hover:text-art-red transition-colors group">
                        Read Full Story <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Left: Featured Image (Big Block) - показывается вторым на мобильных */}
            <div className="lg:col-span-7 border-b-2 lg:border-b-0 lg:border-r-2 border-black relative group overflow-hidden h-[50vh] lg:h-auto order-2 lg:order-1">
                 <img 
                    src={featuredArticle.image} 
                    alt="Featured" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
            </div>
        </div>
      </section>

      {/* Latest Reviews Grid */}
      <section className="py-24 container mx-auto px-4 md:px-6">
        <SectionHeader title="Latest Critical Reviews" linkText="Archive" linkTo="/reviews" />
        {error && (
          <p className="text-sm font-mono text-red-600 mb-6">{error}</p>
        )}
        {loading && !latestReviews.length ? (
          <p className="font-mono text-gray-500">Loading editor picks…</p>
        ) : latestReviews.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestReviews.map((article) => (
              <ArticleCard key={article.slug ?? article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-gray-500">No reviews published yet.</p>
        )}
      </section>

      {/* Featured Artist Story (Split) */}
      <section className="border-y-2 border-black bg-white">
         <div className="grid grid-cols-1 md:grid-cols-2">
             <div className="p-12 md:p-24 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
                 <div>
                    <span className="font-mono text-art-blue font-bold uppercase tracking-widest text-xs mb-4 block">Artist Profile</span>
                    <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-none">The Architecture of Light</h2>
                    <p className="font-mono text-gray-600 text-sm mb-12 leading-loose max-w-md">
                        We visited the studio of renowned installation artist Sarah Sze to discuss how she captures the ephemeral nature of digital memory in physical space.
                    </p>
                 </div>
                 <Link to="/artists/art1" className="inline-block self-start border-2 border-black text-black px-8 py-3 font-bold uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                     Read Story
                 </Link>
             </div>
             <div className="h-[600px] relative grayscale hover:grayscale-0 transition-all duration-500">
                 <img 
                     src="https://picsum.photos/600/800?random=50" 
                     className="w-full h-full object-cover" 
                     alt="Artist Studio"
                 />
                 <div className="absolute inset-0 border-inset border-2 border-transparent"></div>
             </div>
         </div>
      </section>

      <AiTeaser />

      {/* Weekend Guide Teaser */}
      <section className="py-24 container mx-auto px-4 md:px-6">
          <SectionHeader title="Weekend Guides" linkText="All Cities" linkTo="/guides" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Link to="/guides/g2" className="relative h-[450px] border-2 border-black group cursor-pointer overflow-hidden bg-gray-100 block">
                   <div className="absolute top-4 left-4 z-20 bg-white border-2 border-black px-3 py-1 font-mono text-xs uppercase font-bold">Paris</div>
                   <img src="https://picsum.photos/800/600?random=60" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Paris" />
                   <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                       <h3 className="text-2xl font-black uppercase mb-1">Hidden Paris</h3>
                       <p className="font-mono text-xs text-gray-600">5 Galleries • 2 Museums • 1 Hidden Cafe</p>
                   </div>
               </Link>
               <Link to="/guides/g1" className="relative h-[450px] border-2 border-black group cursor-pointer overflow-hidden bg-gray-100 block">
                   <div className="absolute top-4 left-4 z-20 bg-white border-2 border-black px-3 py-1 font-mono text-xs uppercase font-bold">Berlin</div>
                   <img src="https://picsum.photos/800/600?random=61" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="New York" />
                   <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                       <h3 className="text-2xl font-black uppercase mb-1">Mitte District</h3>
                       <p className="font-mono text-xs text-gray-600">Blue Chip Tour • 8 Galleries</p>
                   </div>
               </Link>
          </div>
      </section>

      <NewsletterSection />
    </div>
  );
};

export default Home;