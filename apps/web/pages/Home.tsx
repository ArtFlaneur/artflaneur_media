import React, { useEffect, useState, useCallback } from 'react';
import { SectionHeader, ArticleCard, NewsletterSection, AiTeaser } from '../components/Shared';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { client } from '../sanity/lib/client';
import { HOMEPAGE_QUERY, LATEST_REVIEWS_QUERY } from '../sanity/lib/queries';
import { HOMEPAGE_QUERYResult, LATEST_REVIEWS_QUERYResult } from '../sanity/types';
import { Article, ContentType } from '../types';
import { fetchExhibitionById, fetchGalleryById, fetchGalleryByName, type GraphqlExhibition, type GraphqlGallery } from '../lib/graphql';
import SecureImage from '../components/SecureImage';
import { getAppDownloadLink } from '../lib/formatters';

type HomepageData = NonNullable<HOMEPAGE_QUERYResult>;
type HeroSection = NonNullable<HomepageData['heroSection']>;
type FeaturedReviewNode = NonNullable<HeroSection['featuredReview']>;
type LatestReviewNode = NonNullable<HomepageData['latestReviews']>[number];
type ReviewSource = FeaturedReviewNode | LatestReviewNode | LATEST_REVIEWS_QUERYResult[number];
type ReviewWithSlug = ReviewSource & { slug: { current: string } };
type FeaturedArtistStory = NonNullable<HomepageData['featuredArtistStory']>;
type WeekendGuide = NonNullable<HomepageData['weekendGuide']>;
type SpotlightExhibition = NonNullable<HomepageData['spotlightExhibitions']>[number];
type FeaturedGallery = NonNullable<HomepageData['featuredGalleries']>[number];
type CityPick = NonNullable<HomepageData['cityPicks']>[number];
type CityPickEntry = NonNullable<CityPick['picks']>[number];
type DisplayAd = NonNullable<HomepageData['displayAds']>[number];
type ComingSoonItem = NonNullable<HomepageData['comingSoon']>[number];

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', DATE_FORMAT) : undefined;

const formatGraphqlDateRange = (exhibition?: GraphqlExhibition | null) => {
  if (!exhibition) return null;
  const start = formatDate(exhibition.datefrom ?? undefined);
  const end = formatDate(exhibition.dateto ?? undefined);
  if (start && end) return `${start} — ${end}`;
  return start || end || null;
};

const hasSlug = (review: ReviewSource | undefined | null): review is ReviewWithSlug =>
  Boolean(review?.slug?.current);

const getHeroSlider = (review: ReviewSource | null) => {
  if (!review) return [];
  if (!('heroSlider' in (review as any))) return [];
  const slider = (review as any).heroSlider;
  return Array.isArray(slider) ? slider : [];
};

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

const buildContentPath = (doc?: { _type?: string | null; slug?: { current?: string | null } | null }) => {
  if (!doc?._type || !doc.slug?.current) return null;
  if (doc._type === 'review') return `/reviews/${doc.slug.current}`;
  if (doc._type === 'guide') return `/guides/${doc.slug.current}`;
  if (doc._type === 'artistStory') return `/stories/${doc.slug.current}`;
  return null;
};

const getPickImage = (doc?: {
  mainImage?: { asset?: { url?: string | null } | null } | null;
  coverImage?: { asset?: { url?: string | null } | null } | null;
}) => doc?.mainImage?.asset?.url ?? doc?.coverImage?.asset?.url ?? '';

const isExternalUrl = (value?: string | null) => (value ? /^https?:/i.test(value) : false);

const normalizeLookupKey = (value: string) => value.trim().toLowerCase();

const Home: React.FC = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [featuredReviewData, setFeaturedReviewData] = useState<ReviewSource | null>(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [latestReviews, setLatestReviews] = useState<Article[]>([]);
  const [featuredStory, setFeaturedStory] = useState<FeaturedArtistStory | null>(null);
  const [weekendGuide, setWeekendGuide] = useState<WeekendGuide | null>(null);
  const [spotlightExhibitions, setSpotlightExhibitions] = useState<SpotlightExhibition[]>([]);
  const [featuredGalleries, setFeaturedGalleries] = useState<FeaturedGallery[]>([]);
  const [cityPicks, setCityPicks] = useState<CityPick[]>([]);
  const [comingSoonEvents, setComingSoonEvents] = useState<ComingSoonItem[]>([]);
  const [displayAds, setDisplayAds] = useState<DisplayAd[]>([]);
  const [partnerGalleriesByKey, setPartnerGalleriesByKey] = useState<Record<string, GraphqlGallery>>({});
  const [partnerExhibitionsById, setPartnerExhibitionsById] = useState<Record<string, GraphqlExhibition>>({});
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

        setFeaturedReviewData(heroReview ?? null);
        setFeaturedArticle(heroReview ? mapReviewToArticle(heroReview) : null);
        setLatestReviews(filteredLatest.length ? filteredLatest.map(mapReviewToArticle) : []);
        setFeaturedStory(homepageData?.featuredArtistStory ?? null);
        setWeekendGuide(homepageData?.weekendGuide ?? null);
        setSpotlightExhibitions(homepageData?.spotlightExhibitions ?? []);
        setFeaturedGalleries(homepageData?.featuredGalleries ?? []);
        setCityPicks(homepageData?.cityPicks ?? []);
        setComingSoonEvents(homepageData?.comingSoon ?? []);
        setDisplayAds(homepageData?.displayAds ?? []);
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
        setFeaturedGalleries([]);
        setCityPicks([]);
        setComingSoonEvents([]);
        setDisplayAds([]);
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

  useEffect(() => {
    let isMounted = true;

    const resolvePartnerData = async () => {
      const partners = featuredGalleries ?? [];
      if (!partners.length) {
        setPartnerGalleriesByKey({});
        setPartnerExhibitionsById({});
        return;
      }

      const uniqueGalleryEntries = new Map<
        string,
        {
          key: string;
          galleryName?: string;
          galleryId?: string;
        }
      >();

      partners.forEach((partner) => {
        const galleryName = partner?.gallery?.name?.trim() ?? '';
        const galleryId = partner?.gallery?.id?.trim() ?? '';
        // Prefer ID lookups to avoid stale `name` fields causing mismatches.
        if (galleryId) {
          const key = `id:${galleryId}`;
          if (!uniqueGalleryEntries.has(key)) {
            uniqueGalleryEntries.set(key, {key, galleryId});
          }
          return;
        }

        if (galleryName) {
          const key = `name:${normalizeLookupKey(galleryName)}`;
          if (!uniqueGalleryEntries.has(key)) {
            uniqueGalleryEntries.set(key, {key, galleryName});
          }
        }
      });

      const galleryResults = await Promise.all(
        Array.from(uniqueGalleryEntries.values()).map(async (entry) => {
          try {
            if (entry.galleryName) {
              const gallery = await fetchGalleryByName(entry.galleryName);
              return gallery ? { key: entry.key, gallery } : null;
            }

            const gallery = entry.galleryId ? await fetchGalleryById(entry.galleryId) : null;
            return gallery ? { key: entry.key, gallery } : null;
          } catch (err) {
            console.warn('Failed to resolve partner gallery', entry.key, err);
            return null;
          }
        }),
      );

      const galleriesByKey: Record<string, GraphqlGallery> = {};
      galleryResults.forEach((result) => {
        if (!result) return;
        galleriesByKey[result.key] = result.gallery;
      });

      const exhibitionIds = Array.from(
        new Set(
          partners
            .flatMap((partner) => partner?.highlightedExhibitions ?? [])
            .map((exhibition) => exhibition?.id ?? '')
            .filter(Boolean),
        ),
      );

      const exhibitionResults = await Promise.all(
        exhibitionIds.map(async (id) => {
          try {
            const exhibition = await fetchExhibitionById(id);
            return exhibition ? { id, exhibition } : null;
          } catch (err) {
            console.warn('Failed to resolve partner exhibition', id, err);
            return null;
          }
        }),
      );

      const exhibitionsById: Record<string, GraphqlExhibition> = {};
      exhibitionResults.forEach((result) => {
        if (!result) return;
        exhibitionsById[result.id] = result.exhibition;
      });

      if (!isMounted) return;
      setPartnerGalleriesByKey(galleriesByKey);
      setPartnerExhibitionsById(exhibitionsById);
    };

    resolvePartnerData();

    return () => {
      isMounted = false;
    };
  }, [featuredGalleries]);

  const heroArticle = featuredArticle;
  const heroLink = heroArticle ? `/reviews/${heroArticle.slug}` : null;
  const featuredArtistSlug = buildArtistSlug(featuredStory?.externalArtist);

  const heroSlides = React.useMemo(() => {
    const slides = [];
    
    // First, try to use heroSlider images
    const heroSlider = getHeroSlider(featuredReviewData);
    if (heroSlider.length) {
      slides.push(...heroSlider.map((img: any) => ({
        url: img?.asset?.url ?? '',
        alt: img?.alt ?? featuredArticle?.title ?? 'Exhibition view',
        caption: img?.caption,
      })).filter(slide => slide.url));
    }
    
    // If no heroSlider images, use mainImage
    if (!slides.length && featuredArticle?.image) {
      slides.push({
        url: featuredArticle.image,
        alt: featuredArticle.title ?? 'Review image',
      });
    }
    
    return slides;
  }, [featuredReviewData, featuredArticle]);

  const handleNextSlide = useCallback(() => {
    if (heroSlides.length > 1) {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }
  }, [heroSlides.length]);

  const handlePrevSlide = useCallback(() => {
    if (heroSlides.length > 1) {
      setHeroSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  }, [heroSlides.length]);

  const renderDisplayAds = (placement: DisplayAd['placement']) => {
    const banners = displayAds.filter((ad) => ad?.placement === placement);
    if (!banners.length) return null;

    return banners.map((ad) => {
      if (!ad) return null;
      const key = ad._key ?? `${placement}-${ad.headline ?? 'banner'}`;
      const backgroundColor = ad.backgroundColor || '#fff8ef';
      const isExternal = isExternalUrl(ad.ctaUrl);
      const imageUrl = ad.image?.asset?.url;
      const BannerContent = (
        <div className="flex flex-col md:flex-row items-center gap-8">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={ad.image?.alt ?? ad.headline ?? 'Display creative'}
              className="w-full md:w-1/3 h-48 md:h-56 object-cover border-2 border-black"
            />
          )}
          <div className="flex-1">
            {ad.label && (
              <p className="font-mono text-xs uppercase tracking-widest text-gray-700">{ad.label}</p>
            )}
            <h3 className="text-3xl font-black uppercase mt-2">{ad.headline}</h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-800">{ad.body}</p>
            {ad.ctaUrl && ad.ctaText && (
              isExternal ? (
                <a
                  href={ad.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-3 border-2 border-black px-5 py-3 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors"
                >
                  {ad.ctaText} <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  to={ad.ctaUrl}
                  className="mt-6 inline-flex items-center gap-3 border-2 border-black px-5 py-3 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors"
                >
                  {ad.ctaText} <ArrowRight className="w-4 h-4" />
                </Link>
              )
            )}
          </div>
        </div>
      );

      return (
        <section key={key} className="border-y-2 border-black" style={{backgroundColor}}>
          <div className="container mx-auto px-4 md:px-6 py-16">
            {BannerContent}
          </div>
        </section>
      );
    });
  };

  return (
    <div className="min-h-screen">
      
      {/* Mondrian Hero Section */}
      <section className="border-b-2 border-black relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-auto lg:h-[70vh]">
            
            {/* Right: Content Grid - показывается первым на мобильных */}
            <div className="lg:col-span-5 order-1 lg:order-2 relative">
                
                {/* Title Block */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-art-paper h-full">
                    {/* Feature Badge - внутри контентного блока */}
                    <div className="absolute top-4 left-4 md:top-0 md:left-0 bg-art-red text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold font-mono uppercase border-r-2 border-b-2 border-black z-10">
                      {loading ? 'Syncing Latest Review' : 'Review of the Week'}
                    </div>
                    {heroArticle ? (
                      <>
                        <div className="mb-6 flex flex-wrap gap-2 mt-8 md:mt-0">
                            <span className="bg-black text-white px-2 py-1 text-xs font-mono uppercase">{heroArticle.type}</span>
                            <span className="border border-black px-2 py-1 text-xs font-mono uppercase">{heroArticle.date}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase leading-tight mb-6">
                            {heroArticle.title}
                        </h1>
                        <p className="font-serif text-lg md:text-xl italic text-gray-600 mb-6 border-l-4 border-art-yellow pl-4">
                            {heroArticle.subtitle}
                        </p>
            <Link to={`/reviews/${heroArticle.slug}`} className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest hover:text-art-red transition-colors group">
                            Read Full Review <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
                {heroSlides.length > 0 ? (
                  <>
                    {heroSlides.map((slide, index) => (
                      <img
                        key={`${slide.url}-${index}`}
                        src={slide.url}
                        alt={slide.alt}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 ${
                          index === heroSlideIndex 
                            ? 'opacity-100' 
                            : 'opacity-0'
                        }`}
                      />
                    ))}
                    {heroLink && heroSlides.length > 0 && (
                      <Link
                        to={heroLink}
                        className="absolute inset-0 z-10"
                        aria-label={heroArticle ? `Read ${heroArticle.title}` : 'Read review'}
                      >
                        <span className="sr-only">{heroArticle ? `Read ${heroArticle.title}` : 'Read review'}</span>
                      </Link>
                    )}
                    {heroSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black border-2 border-black rounded-full p-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black border-2 border-black rounded-full p-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                          {heroSlides.map((_, idx) => (
                            <button
                              key={`dot-${idx}`}
                              type="button"
                              className={`w-2.5 h-2.5 border border-white rounded-full transition-all ${
                                idx === heroSlideIndex ? 'bg-white scale-110' : 'bg-transparent opacity-60'
                              }`}
                              onClick={() => setHeroSlideIndex(idx)}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
            </div>
        </div>
      </section>


      {/* Latest Reviews Grid */}
      <section className="bg-white relative z-0 pt-16 md:pt-24 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader title="Latest Reviews" linkText="Archive" linkTo="/reviews" />
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
        </div>
      </section>

      {cityPicks.length > 0 && (
        <section className="py-24 border-y-2 border-black bg-art-blue text-white">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeader title="Editor's Picks by City" linkText="All City Guides" linkTo="/guides" />
            <p className="text-sm font-mono text-white/80 mb-8 max-w-2xl">Discover the best of contemporary art in major cities around the world, curated by local experts.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityPicks.slice(0, 6).map((city) => {
                const picks = city?.picks ?? [];
                const heroUrl = city?.heroImage?.asset?.url ?? '';
                const hasHero = Boolean(heroUrl);
                const fallbackPick = picks.find((pick) => buildContentPath(pick?.document));
                const fallbackPickHref = fallbackPick?.document ? buildContentPath(fallbackPick.document) : null;
                const cityCtaHref = city?.ctaUrl ?? fallbackPickHref;
                const cityCtaText = city?.ctaText ?? 'Explore';
                return (
                  <article
                    key={city._key ?? city.city}
                    className="relative border-2 border-white overflow-hidden h-[380px] group"
                  >
                    {hasHero ? (
                      <img
                        src={heroUrl}
                        alt={city.heroImage?.alt ?? `${city.city} skyline`}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-black opacity-70" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/60 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-art-yellow mb-2">
                          {city.tagline ?? 'City Guide'}
                        </p>
                        <h3 className="text-3xl font-black uppercase mb-3">{city.city ?? 'City'}</h3>
                        {city.sponsor?.logo?.asset?.url && (
                          <div className="mb-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-300">
                            <span>Presented by</span>
                            <img 
                              src={city.sponsor.logo.asset.url} 
                              alt={city.sponsor.logo.alt ?? city.sponsor.name ?? 'Sponsor'} 
                              className="h-5 object-contain" 
                            />
                          </div>
                        )}
                        {cityCtaHref ? (
                          isExternalUrl(cityCtaHref) ? (
                            <a
                              href={cityCtaHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
                            >
                              {cityCtaText} <ArrowRight className="w-3 h-3" />
                            </a>
                          ) : (
                            <Link
                              to={cityCtaHref}
                              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
                            >
                              {cityCtaText} <ArrowRight className="w-3 h-3" />
                            </Link>
                          )
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {spotlightExhibitions.length > 0 && (
        <section className="py-24 border-y-2 border-black bg-art-paper">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeader title="Now Showing" linkText="Browse Exhibitions" linkTo="/exhibitions" />
            <p className="text-sm font-mono text-gray-600 mb-8 max-w-2xl">Exhibitions handpicked by our editorial team, happening right now in galleries worldwide.</p>
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
                        <span className="inline-block mb-4 bg-art-yellow text-black px-3 py-1 text-xs font-mono uppercase tracking-widest font-bold">
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
                      {spotlight.featureCopy && (
                        <p className="mt-6 text-sm leading-relaxed text-gray-700">
                          {spotlight.featureCopy}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/exhibitions/${exhibition.id}`}
                      className="mt-8 inline-flex items-center justify-center gap-2 border-2 border-black px-4 py-3 font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors"
                    >
                      View <ArrowRight className="w-4 h-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {featuredGalleries.length > 0 && (
        <section className="py-24 border-y-2 border-black bg-art-yellow">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeader title="Gallery Partners" linkText="View all partners" linkTo="/partners/galleries" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGalleries.map((partner) => {
                const galleryName = partner?.gallery?.name?.trim() ?? '';
                const galleryId = partner?.gallery?.id?.trim() ?? '';
                const lookupKey = galleryId
                  ? `id:${galleryId}`
                  : galleryName
                    ? `name:${normalizeLookupKey(galleryName)}`
                    : null;
                const resolvedGallery = lookupKey ? partnerGalleriesByKey[lookupKey] : undefined;
                const resolvedGalleryName = resolvedGallery?.galleryname ?? galleryName;
                const resolvedGalleryId = resolvedGallery?.id ?? galleryId;
                const gallerySlug = buildGallerySlug({
                  id: resolvedGalleryId,
                  name: resolvedGalleryName,
                });
                const exhibitions = partner.highlightedExhibitions ?? [];
                const resolvedWebsite = resolvedGallery?.placeurl ?? null;
                const fallbackCta = gallerySlug ? `/galleries/${gallerySlug}` : resolvedWebsite ?? null;
                const ctaHref = partner.ctaUrl ?? fallbackCta;
                const isExternalCta = isExternalUrl(ctaHref);

                const galleryImageUrl = resolvedGallery?.gallery_img_url ?? null;

                const linkHref = ctaHref ?? (gallerySlug ? `/galleries/${gallerySlug}` : null);
                const shouldUseExternalLink = isExternalUrl(linkHref);

                const cardClassName =
                  'group block border-2 border-black bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] transition-all duration-200 h-full flex flex-col min-h-[400px]';

                const CardContent = (
                  <>
                    <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                      {galleryImageUrl ? (
                        <SecureImage
                          src={galleryImageUrl}
                          alt={resolvedGalleryName || 'Gallery'}
                          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                      {resolvedGallery?.city && (
                        <div className="absolute top-0 left-0 bg-white px-3 py-1 text-xs font-bold font-mono uppercase border-r-2 border-b-2 border-black z-10 group-hover:bg-art-blue group-hover:text-white transition-colors">
                          {resolvedGallery.city}
                        </div>
                      )}
                      {partner.sponsor?.logo?.asset?.url && (
                        <div className="absolute top-0 right-0 bg-white border-l-2 border-b-2 border-black px-3 py-2 z-10">
                          <img
                            src={partner.sponsor.logo.asset.url}
                            alt={partner.sponsor.logo.alt ?? partner.sponsor.name ?? 'Sponsor logo'}
                            className="h-8 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div>
                        <h3 className="text-2xl font-black uppercase leading-tight mb-3 group-hover:underline decoration-2 underline-offset-2">
                          {resolvedGalleryName || 'Gallery Partner'}
                        </h3>
                        <p className="text-sm font-mono text-gray-600 leading-relaxed mb-6 line-clamp-3">
                          {partner.featureCopy ?? 'Partner programming selected by Art Flaneur editors.'}
                        </p>

                        {exhibitions.length > 0 && (
                          <div className="space-y-3">
                            {exhibitions.slice(0, 3).map((exhibition, index) => {
                              if (!exhibition?.id) return null;
                              const resolvedExhibition = partnerExhibitionsById[exhibition.id] ?? null;
                              const dateLabel = formatGraphqlDateRange(resolvedExhibition);
                              const exhibitionTitle = resolvedExhibition?.title ?? exhibition.title ?? 'Exhibition';
                              const exhibitionCity = resolvedExhibition?.city ?? null;
                              const subtitle = [exhibitionCity, dateLabel].filter(Boolean).join(' • ');

                              return (
                                <div
                                  key={`${partner._key ?? resolvedGalleryId ?? galleryName ?? 'partner'}-${exhibition.id}-${index}`}
                                  className="border border-black/20 px-4 py-3"
                                >
                                  <p className="text-sm font-bold uppercase text-black line-clamp-2">{exhibitionTitle}</p>
                                  {subtitle && (
                                    <p className="font-mono text-xs text-gray-600 mt-1 line-clamp-2">{subtitle}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
                        <span>View Gallery</span>
                        <ArrowRight className="w-4 h-4 text-black -ml-4 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </div>
                    </div>
                  </>
                );

                return linkHref ? (
                  shouldUseExternalLink ? (
                    <a
                      key={partner._key ?? resolvedGalleryId ?? galleryName ?? 'partner'}
                      href={linkHref}
                      target="_blank"
                      rel="noreferrer"
                      className={cardClassName}
                    >
                      {CardContent}
                    </a>
                  ) : (
                    <Link
                      key={partner._key ?? resolvedGalleryId ?? galleryName ?? 'partner'}
                      to={linkHref}
                      className={cardClassName}
                    >
                      {CardContent}
                    </Link>
                  )
                ) : (
                  <article
                    key={partner._key ?? resolvedGalleryId ?? galleryName ?? 'partner'}
                    className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col min-h-[400px]"
                  >
                    {CardContent}
                  </article>
                );
              })}
              
              {/* CTA Card for New Partners */}
              <article className="relative border-2 border-dashed border-black overflow-hidden flex flex-col justify-center items-center p-12 min-h-[400px] bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                  <div className="mb-4 inline-block bg-art-yellow text-black px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold">
                    Partner with us
                  </div>
                  <h3 className="text-3xl font-black uppercase mb-4 leading-tight">
                    Promote Your Gallery
                  </h3>
                  <p className="text-sm font-mono text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                    Join leading galleries worldwide in reaching engaged art enthusiasts through our platform.
                  </p>
                  <Link
                    to="/partners/galleries"
                    className="inline-flex items-center gap-3 border-2 border-black px-6 py-4 font-bold uppercase text-sm bg-white hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      )}

      {renderDisplayAds('midPage')}

      {featuredStory && (
        <section className="border-y-2 border-black bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 md:p-24 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
              <div>
                <span className="font-mono text-art-blue font-bold uppercase tracking-widest text-xs mb-4 block">
                  Featured Artist
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

      {comingSoonEvents.length > 0 && (
        <section className="py-24 border-y-2 border-black bg-art-paper">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeader title="Coming Soon" linkText="Plan ahead" linkTo="/exhibitions" />
            <p className="text-sm font-mono text-gray-600 mb-8 max-w-full md:text-justify">Mark your calendar for upcoming exhibitions opening soon. Get notified when they launch.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comingSoonEvents.map((item) => {
                const exhibition = item?.exhibition;
                if (!exhibition?.id) return null;
                const dateLabel = formatExhibitionRange(exhibition);
                const appLink = getAppDownloadLink();
                const ctaHref = item.ctaUrl ?? appLink;
                const isExternalCta = true; // App links are always external
                const ctaLabel = item.ctaText ?? 'Get notified';

                const ctaButton = ctaHref ? (
                  isExternalCta ? (
                    <a
                      href={ctaHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 border-2 border-black px-4 py-2 font-bold uppercase text-xs bg-white hover:bg-black hover:text-white transition-colors"
                    >
                      {ctaLabel} <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      to={ctaHref}
                      className="inline-flex items-center gap-3 border-2 border-black px-4 py-2 font-bold uppercase text-xs bg-white hover:bg-black hover:text-white transition-colors"
                    >
                      {ctaLabel} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )
                ) : null;

                return (
                  <article
                    key={item._key ?? exhibition.id}
                    className="border-2 border-black bg-white p-6 flex flex-col justify-between"
                  >
                    <div>
                      {item.urgencyLabel && (
                        <span className="inline-block mb-3 bg-black text-white px-3 py-1 text-xs font-mono uppercase tracking-[0.3em]">
                          {item.urgencyLabel}
                        </span>
                      )}
                      <h3 className="text-2xl font-black uppercase leading-tight">{exhibition.title ?? 'Upcoming exhibition'}</h3>
                      {exhibition.gallery?.name && (
                        <p className="font-mono text-xs text-gray-600 mt-1">
                          {exhibition.gallery.name}
                          {exhibition.gallery.city ? ` • ${exhibition.gallery.city}` : ''}
                        </p>
                      )}
                      {dateLabel && (
                        <p className="font-mono text-xs text-gray-500">{dateLabel}</p>
                      )}
                      <p className="mt-4 font-mono text-xs leading-relaxed text-gray-700 line-clamp-4">
                        {exhibition.description ?? 'Be the first to know when this show opens its doors.'}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-xs font-mono text-gray-500">
                        {item.sponsor?.logo?.asset?.url ? (
                          <div className="flex items-center gap-2">
                            <span>Partner</span>
                            <img src={item.sponsor.logo.asset.url} alt={item.sponsor.logo.alt ?? item.sponsor.name ?? 'Sponsor'} className="h-6 object-contain" />
                          </div>
                        ) : (
                          <span>Presented by Art Flaneur</span>
                        )}
                      </div>
                      {ctaButton}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {weekendGuide?.slug?.current && (
        <section className="py-24 container mx-auto px-4 md:px-6">
          <SectionHeader title="Weekend Guides" linkText="All Cities" linkTo="/guides" />
          <p className="text-sm font-mono text-gray-600 mb-8 max-w-2xl">Curated art trails for exploring cities on foot. Perfect for a weekend adventure.</p>
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

      {renderDisplayAds('preFooter')}

      <AiTeaser />

      <NewsletterSection />
    </div>
  );
};

export default Home;