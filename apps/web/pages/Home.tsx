import React, { useEffect, useState } from 'react';
import { SectionHeader, ArticleCard, NewsletterSection, AiTeaser } from '../components/Shared';
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
type ReviewWithSlug = ReviewSource & { slug: { current: string } };
type FeaturedArtistStory = NonNullable<HomepageData['featuredArtistStory']>;
type WeekendGuide = NonNullable<HomepageData['weekendGuide']>;
type SpotlightExhibition = NonNullable<HomepageData['spotlightExhibitions']>[number];

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : undefined;

const hasSlug = (review: ReviewSource | undefined | null): review is ReviewWithSlug =>
  Boolean(review?.slug?.current);

const slugifyName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildArtistSlug = (artist?: { id?: string | null; name?: string | null } | null) => {
  if (!artist?.id) return null;
  const safeName = artist.name ? slugifyName(artist.name) : 'artist';
  return `${safeName}-${artist.id}`;
};

const buildGallerySlug = (gallery?: { id?: string | null; name?: string | null } | null) => {
  if (!gallery?.id) return null;
  if (gallery.name) {
    return `${slugifyName(gallery.name)}-${gallery.id}`;
  }
  return String(gallery.id);
};

const formatExhibitionRange = (exhibition?: { startDate?: string | null; endDate?: string | null }) => {
  if (!exhibition) return null;
  const start = formatDate(exhibition.startDate ?? undefined);
  const end = formatDate(exhibition.endDate ?? undefined);
  if (start && end) return `${start} — ${end}`;
  return start || end || null;
};

const mapReviewToArticle = (review: ReviewWithSlug): Article => ({
  id: review._id,
  slug: review.slug.current,
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

const Home: React.FC = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [latestReviews, setLatestReviews] = useState<Article[]>([]);
  const [featuredStory, setFeaturedStory] = useState<FeaturedArtistStory | null>(null);
  const [weekendGuide, setWeekendGuide] = useState<WeekendGuide | null>(null);
  const [spotlightExhibitions, setSpotlightExhibitions] = useState<SpotlightExhibition[]>([]);
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

        const curatedLatest = homepageData?.latestReviews?.length
          ? (homepageData.latestReviews as ReviewSource[])
          : (fallbackReviews as ReviewSource[]);

        const filteredLatest = (curatedLatest ?? []).filter(hasSlug) as ReviewWithSlug[];

        const heroCandidate = homepageData?.heroSection?.featuredReview;
        const heroReview = hasSlug(heroCandidate)
          ? heroCandidate
          : filteredLatest[0];

      setFeaturedArticle(heroReview ? mapReviewToArticle(heroReview) : null);
      setLatestReviews(filteredLatest.length ? filteredLatest.map(mapReviewToArticle) : []);
      setFeaturedStory(homepageData?.featuredArtistStory ?? null);
      setWeekendGuide(homepageData?.weekendGuide ?? null);
      setSpotlightExhibitions(homepageData?.spotlightExhibitions ?? []);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching Sanity data:', err);
        if (!isMounted) return;
        setError('Unable to load the latest editor picks right now.');
      setFeaturedArticle(null);
      setLatestReviews([]);
      setFeaturedStory(null);
      setWeekendGuide(null);
      setSpotlightExhibitions([]);
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

  const heroArticle = featuredArticle;
  const featuredArtistSlug = buildArtistSlug(featuredStory?.externalArtist);

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
                    {heroArticle ? (
                      <>
                        <div className="mb-6 flex gap-2">
                            <span className="bg-black text-white px-2 py-1 text-xs font-mono uppercase">{heroArticle.type}</span>
                            <span className="border border-black px-2 py-1 text-xs font-mono uppercase">{heroArticle.date}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] mb-6">
                            {heroArticle.title}
                        </h1>
                        <p className="font-serif text-xl md:text-2xl italic text-gray-600 mb-8 border-l-4 border-art-yellow pl-4">
                            {heroArticle.subtitle}
                        </p>
            <Link to={`/reviews/${heroArticle.slug}`} className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest hover:text-art-red transition-colors group">
                            Read Full Story <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                      </>
                    ) : (
                      <div className="animate-pulse space-y-6">
                        <div className="flex gap-2">
                          <div className="bg-black/20 h-6 w-20" />
                          <div className="border border-black/20 h-6 w-28" />
                        </div>
                        <div className="bg-black/10 h-24 w-3/4" />
                        <div className="bg-black/5 h-20 w-full" />
                        <div className="bg-black/20 h-10 w-48" />
                      </div>
                    )}
                </div>
            </div>

            {/* Left: Featured Image (Big Block) - показывается вторым на мобильных */}
            <div className="lg:col-span-7 border-b-2 lg:border-b-0 lg:border-r-2 border-black relative group overflow-hidden h-[50vh] lg:h-auto order-2 lg:order-1">
                {heroArticle ? (
                  <img 
                    src={heroArticle.image} 
                    alt={heroArticle.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestReviews.map((article) => (
              <ArticleCard key={article.slug ?? article.id} article={article} imageAspect="square" />
            ))}
          </div>
        ) : (
          <p className="font-mono text-gray-500">No reviews published yet.</p>
        )}
      </section>

      {spotlightExhibitions.length > 0 && (
        <section className="py-24 border-y-2 border-black bg-art-paper">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeader title="Now Showing" linkText="Browse Galleries" linkTo="/galleries" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {spotlightExhibitions.map((spotlight) => {
                const exhibition = spotlight?.exhibition;
                if (!exhibition?.id) return null;
                const gallerySlug = buildGallerySlug(exhibition.gallery);
                const galleryLabel = [exhibition.gallery?.name, exhibition.gallery?.city]
                  .filter(Boolean)
                  .join(' • ');
                const dateLabel = formatExhibitionRange(exhibition);

                return (
                  <article
                    key={spotlight._key ?? exhibition.id}
                    className="border-2 border-black bg-white p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div>
                      {spotlight.badge && (
                        <span className="inline-block mb-4 bg-black text-white px-3 py-1 text-xs font-mono uppercase tracking-widest">
                          {spotlight.badge}
                        </span>
                      )}
                      <h3 className="text-2xl font-black uppercase leading-snug">
                        {exhibition.title ?? 'Untitled exhibition'}
                      </h3>
                      {galleryLabel && (
                        <p className="font-mono text-xs text-gray-600 mt-2">{galleryLabel}</p>
                      )}
                      {dateLabel && (
                        <p className="font-mono text-xs text-gray-500">{dateLabel}</p>
                      )}
                      <p className="mt-6 text-sm leading-relaxed text-gray-700">
                        {spotlight.featureCopy ?? 'Fresh picks from the global exhibition catalog curated by Art Flaneur editors.'}
                      </p>
                    </div>
                    {gallerySlug ? (
                      <Link
                        to={`/galleries/${gallerySlug}`}
                        className="mt-8 inline-flex items-center justify-between border-2 border-black px-4 py-3 font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors"
                      >
                        {spotlight.ctaText ?? 'View gallery'} <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="mt-8 text-xs font-mono uppercase text-gray-500">
                        Gallery link coming soon
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {featuredStory && (
        <section className="border-y-2 border-black bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 md:p-24 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
              <div>
                <span className="font-mono text-art-blue font-bold uppercase tracking-widest text-xs mb-4 block">
                  Artist Profile
                </span>
                <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-none">
                  {featuredStory.title ?? featuredStory.externalArtist?.name ?? 'Featured Artist'}
                </h2>
                <p className="font-mono text-gray-600 text-sm mb-12 leading-loose max-w-md">
                  Step inside the world of {featuredStory.externalArtist?.name ?? 'this artist'} and discover the ideas shaping their latest work.
                </p>
              </div>
              {featuredArtistSlug ? (
                <Link
                  to={`/artists/${featuredArtistSlug}`}
                  className="inline-block self-start border-2 border-black text-black px-8 py-3 font-bold uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  Read Story
                </Link>
              ) : (
                <span className="inline-block self-start border-2 border-dashed border-black text-black px-8 py-3 font-bold uppercase text-xs">
                  GraphQL artist link unavailable
                </span>
              )}
            </div>
            <div className="h-[600px] relative grayscale hover:grayscale-0 transition-all duration-500">
              {featuredStory.portrait?.asset?.url ? (
                <img
                  src={featuredStory.portrait.asset.url}
                  className="w-full h-full object-cover"
                  alt={featuredStory.title ?? featuredStory.externalArtist?.name ?? 'Artist portrait'}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center font-mono text-xs uppercase">
                  Portrait coming soon
                </div>
              )}
              <div className="absolute inset-0 border-inset border-2 border-transparent"></div>
            </div>
          </div>
        </section>
      )}

      <AiTeaser />

      {weekendGuide?.slug?.current && (
        <section className="py-24 container mx-auto px-4 md:px-6">
          <SectionHeader title="Weekend Guides" linkText="All Cities" linkTo="/guides" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              to={`/guides/${weekendGuide.slug.current}`}
              className="relative h-[450px] border-2 border-black group cursor-pointer overflow-hidden bg-gray-100 block"
            >
              <div className="absolute top-4 left-4 z-20 bg-white border-2 border-black px-3 py-1 font-mono text-xs uppercase font-bold">
                {weekendGuide.title ?? 'Featured trail'}
              </div>
              {weekendGuide.coverImage?.asset?.url ? (
                <img
                  src={weekendGuide.coverImage.asset.url}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  alt={weekendGuide.title ?? 'Weekend guide'}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center font-mono text-xs uppercase">
                  Guide preview coming soon
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-black uppercase mb-1">{weekendGuide.ctaText ?? 'Explore the route'}</h3>
                <p className="font-mono text-xs text-gray-600">Tap to view the full itinerary</p>
              </div>
            </Link>
            <div className="relative h-[450px] border-2 border-dashed border-black flex items-center justify-center text-center p-8 font-mono text-xs text-gray-500">
              Curating more trails. Check back soon.
            </div>
          </div>
        </section>
      )}

      <NewsletterSection />
    </div>
  );
};

export default Home;