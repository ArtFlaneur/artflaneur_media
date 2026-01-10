import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, MapPin, Ticket, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, BookOpen, Film } from 'lucide-react';
import { ArticleCard } from '../components/Shared';
import PortableTextRenderer from '../components/PortableTextRenderer';
import { client } from '../sanity/lib/client';
import { REVIEW_QUERY, REVIEWS_QUERY, ARTICLE_QUERY } from '../sanity/lib/queries';
import { BlockContent } from '../sanity/types';
import { REVIEW_QUERYResult, REVIEWS_QUERYResult, ARTICLE_QUERYResult, ExternalExhibitionReference } from '../sanity/types';
import { Article, ContentType } from '../types';
import { getDisplayDomain } from '../lib/formatters';
import { fetchExhibitionById, fetchGalleryById, type GraphqlExhibition, type GraphqlGallery } from '../lib/graphql';
import { useSeo } from '../lib/useSeo';

type StoryDocument = ARTICLE_QUERYResult | REVIEW_QUERYResult;

type ReviewLike = (REVIEW_QUERYResult | REVIEWS_QUERYResult[number] | ARTICLE_QUERYResult) & {
  externalExhibition?: ExternalExhibitionReference | null;
  contentType?: string;
};

const isFullReview = (review: ReviewLike): review is REVIEW_QUERYResult => 'sponsorship' in review;

const hasResolvedExternalExhibition = (
  review: ReviewLike | EnrichedReview,
): review is EnrichedReview =>
  typeof review === 'object' && review !== null && 'resolvedExternalExhibition' in review;

const extractGalleryMeta = (review: ReviewLike | EnrichedReview | null) => {
  if (!review) {
    return {name: undefined, city: undefined, address: undefined, website: undefined, openingHours: undefined};
  }

  const resolved = hasResolvedExternalExhibition(review) ? review.resolvedExternalExhibition : undefined;
  const fallback = review.externalExhibition;
  const fallbackGallery = fallback?.gallery ?? null;
  const fallbackGalleryAny = fallbackGallery as Record<string, any> | null;

  return {
    name: resolved?.galleryname ?? fallbackGallery?.name ?? undefined,
    city: resolved?.city ?? fallbackGallery?.city ?? undefined,
    address: fallbackGalleryAny?.fullAddress ?? fallbackGalleryAny?.fulladdress ?? fallbackGallery?.address ?? undefined,
    website: fallbackGallery?.website ?? fallbackGalleryAny?.placeUrl ?? fallbackGalleryAny?.placeurl ?? undefined,
    openingHours:
      fallbackGalleryAny?.workingHours ??
      fallbackGallery?.openingHours ??
      fallbackGalleryAny?.openinghours ??
      undefined,
  };
};

const parseGraphqlArtists = (value?: string | null) =>
  value
    ?.split(/,|&|\/| and /i)
    .map((name) => name.trim())
    .filter(Boolean) ?? [];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
    : undefined;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const describeDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1);
  if (diffDays === 1) return 'One-day event';
  if (diffDays < 7) return `${diffDays} day run`;
  const weeks = diffDays / 7;
  if (weeks < 5) {
    const rounded = Number.isInteger(weeks) ? weeks : Number(weeks.toFixed(1));
    return `${rounded} week run`;
  }
  const months = diffDays / 30;
  if (months >= 1) {
    const rounded = months >= 2 ? Math.round(months) : Number(months.toFixed(1));
    return `${rounded} month run`;
  }
  return `${diffDays} day run`;
};

const formatExhibitionWindow = (
  resolved?: GraphqlExhibition | null,
  fallback?: ExternalExhibitionReference | null,
) => {
  const start = resolved?.datefrom ?? fallback?.startDate ?? null;
  const end = resolved?.dateto ?? fallback?.endDate ?? null;

  const formatDateLabel = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  };

  const startLabel = start ? formatDateLabel(start) : null;
  const endLabel = end ? formatDateLabel(end) : null;

  if (startLabel && endLabel) {
    if (startLabel === endLabel) {
      return {
        primary: startLabel,
        secondary: null,
      };
    }

    return {
      primary: `${startLabel} – ${endLabel}`,
      secondary: null,
    };
  }

  if (startLabel) {
    return {
      primary: `Opens ${startLabel}`,
      secondary: null,
    };
  }

  if (endLabel) {
    return {
      primary: `On view until ${endLabel}`,
      secondary: null,
    };
  }

  return null;
};

const deriveAdmissionDetails = (
  gallery?: GraphqlGallery | null,
  exhibition?: GraphqlExhibition | null,
  fallback?: ExternalExhibitionReference | null,
) => {
  const list = [
    gallery?.allowed,
    gallery?.specialevent,
    gallery?.eventtype,
    exhibition?.eventtype,
    Array.isArray(exhibition?.exhibition_type)
      ? exhibition?.exhibition_type.filter(Boolean).join(', ')
      : typeof exhibition?.exhibition_type === 'string'
        ? exhibition?.exhibition_type
        : null,
    fallback?.gallery?.allowed,
    fallback?.gallery?.specialEvent,
    fallback?.gallery?.eventType,
    fallback?.eventType,
    fallback?.exhibitionType,
  ]
    .map((value) => value?.toString().trim())
    .filter(Boolean);

  return list.length ? list[0] ?? null : null;
};

const mapReviewToArticle = (review: ReviewLike): Article => {
  const {name: galleryName, city: galleryCity} = extractGalleryMeta(review);

  return {
    id: review._id,
    slug: review.slug?.current ?? review._id,
    type: ContentType.REVIEW,
    title: review.title ?? 'Untitled Review',
    subtitle: review.excerpt ?? '',
    image: review.mainImage?.asset?.url ?? `https://picsum.photos/seed/${review._id}/600/600`,
    date: formatDate(review.publishedAt),
    location: galleryName ? `${galleryName}${galleryCity ? `, ${galleryCity}` : ''}` : undefined,
    author: review.author
      ? {
          id: review.author._id,
          name: review.author.name ?? 'Anonymous',
          slug: review.author.slug?.current ?? review.author._id,
          role: 'Critic',
          image: review.author.photo?.asset?.url ?? '',
        }
      : undefined,
  };
};

type LinkedDocument = {
  _id: string;
  name?: string | null;
  slug?: { current?: string | null } | null;
};

const getReferencePath = (basePath: string, doc?: LinkedDocument | null) => {
  if (!doc) return undefined;
  const handle = doc.slug?.current ?? doc._id;
  return handle ? `${basePath}/${handle}` : undefined;
};

const portableTextToPlain = (body?: Array<Record<string, any>> | null) => {
  if (!body?.length) return '';
  return body
    .map((block) =>
      block._type === 'block'
        ? (block.children ?? [])
            .map((child) => child.text)
            .filter(Boolean)
            .join(' ')
        : '',
    )
    .filter(Boolean)
    .join('\n\n');
};

const badgeTemplateText: Record<string, string> = {
  supportedBy: 'Supported by {logo}',
  partnershipWith: 'In partnership with {logo}',
  presentedBy: 'Presented by {logo}',
  presents: '{logo} presents',
  default: 'Supported by {logo}',
};

const getSponsorBadge = (review: StoryDocument | null) => {
  const sponsorship = review?.sponsorship;
  const sponsor = sponsorship?.sponsor;

  if (!sponsorship?.enabled || !sponsor) {
    return null;
  }

  const templateKey = sponsor.defaultBadgeTemplate ?? 'supportedBy';
  const template = badgeTemplateText[templateKey] ?? badgeTemplateText.default;
  const text = template.replace('{logo}', sponsor.name ?? 'our partner');

  return {
    text,
    logoUrl: sponsor.logo?.asset?.url,
    color: sponsor.brandColor?.hex ?? undefined,
  };
};

type SharePlatform = 'facebook' | 'twitter' | 'linkedin';

type EnrichedReview = StoryDocument & {
  resolvedExternalExhibition?: GraphqlExhibition | null;
  resolvedExternalGallery?: GraphqlGallery | null;
  _updatedAt?: string;
};

type FilmReviewEntryType = NonNullable<ARTICLE_QUERYResult['filmReviews']>[number];

const slugifyAnchor = (value: string) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

const getFilmAnchorId = (film: FilmReviewEntryType | null, index: number) => {
  const normalizedKey = film?._key ? slugifyAnchor(film._key) : '';
  if (normalizedKey) {
    return `film-${normalizedKey}`;
  }
  const normalizedTitle = film?.title ? slugifyAnchor(film.title) : '';
  const suffix = (index + 1).toString().padStart(2, '0');
  if (normalizedTitle) {
    return `${normalizedTitle}-${suffix}`;
  }
  return `film-${suffix}`;
};

const isArticleStory = (
  story: StoryDocument | EnrichedReview | null,
): story is EnrichedReview & ARTICLE_QUERYResult => {
  return Boolean(story && typeof story === 'object' && 'contentType' in story);
};

const isFilmReviewStory = (
  story: StoryDocument | EnrichedReview | null,
): story is EnrichedReview & ARTICLE_QUERYResult => {
  return Boolean(isArticleStory(story) && story.contentType === 'film-review');
};

type GallerySlide = {
  url: string;
  alt: string;
  caption?: string | null;
  credit?: string | null;
};

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<EnrichedReview | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        // Try to fetch as article first (new type)
        let reviewData: StoryDocument | null = await client.fetch<ARTICLE_QUERYResult | null>(
          ARTICLE_QUERY,
          {slug: id},
        );
        
        // If not found, try as review (legacy type)
        if (!reviewData) {
          reviewData = await client.fetch<REVIEW_QUERYResult | null>(REVIEW_QUERY, {slug: id});
        }
        
        if (!isMounted) return;

        if (!reviewData) {
          setError('We could not find this story.');
          setReview(null);
          setRelatedArticles([]);
          setLoading(false);
          return;
        }

        // Hydrate external exhibition + gallery if present (only for exhibition reviews)
        let resolvedExternalExhibition: GraphqlExhibition | null = null;
        let resolvedExternalGallery: GraphqlGallery | null = null;

        if (reviewData.externalExhibition?.id) {
          try {
            resolvedExternalExhibition = await fetchExhibitionById(reviewData.externalExhibition.id);
          } catch (err) {
            console.error('Failed to fetch external exhibition:', err);
          }
        }

        const galleryId =
          resolvedExternalExhibition?.gallery_id ?? reviewData.externalExhibition?.gallery?.id ?? null;

        if (galleryId) {
          try {
            resolvedExternalGallery = await fetchGalleryById(galleryId);
          } catch (err) {
            console.error('Failed to fetch external gallery:', err);
          }
        }

        setReview({ ...reviewData, resolvedExternalExhibition, resolvedExternalGallery });
        
        const relatedData = await client.fetch<REVIEWS_QUERYResult>(REVIEWS_QUERY);
        if (!isMounted) return;
        const related = (relatedData ?? [])
          .filter((r) => r._id !== reviewData._id)
          .slice(0, 3)
          .map(mapReviewToArticle);
        setRelatedArticles(related);
      } catch (err) {
        console.error('❌ Error fetching story:', err);
        if (!isMounted) return;
        setError('Unable to load this story right now.');
        setReview(null);
        setRelatedArticles([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const reviewId = review?._id;

  useEffect(() => {
    setActiveSlide(0);
  }, [reviewId]);

  const sponsorBadge = useMemo(() => getSponsorBadge(review), [review]);
  const article = useMemo(() => (review ? mapReviewToArticle(review) : null), [review]);
  const isFilmReview = isFilmReviewStory(review);
  const filmEntries = isFilmReview ? review.filmReviews ?? [] : [];
  const hasFilmEntries = filmEntries.length > 0;
  
  // Use heroSlider if available, otherwise fallback to mainImage
  const heroSlides = useMemo(() => {
    const slides = [];
    
    // First, try to use heroSlider images
    if (review?.heroSlider?.length) {
      slides.push(...review.heroSlider.map(img => ({
        url: img?.asset?.url ?? '',
        alt: img?.alt ?? review?.title ?? 'Exhibition view',
        caption: img?.caption,
      })).filter(slide => slide.url));
    }
    
    // If no heroSlider images, use mainImage
    if (!slides.length && article?.image) {
      slides.push({
        url: article.image,
        alt: article.title ?? 'Review image',
      });
    }
    
    return slides;
  }, [review, article]);

  const slideCount = heroSlides.length;
  const currentSlide = heroSlides[activeSlide] ?? heroSlides[0];

  const handleNextSlide = useCallback(() => {
    if (slideCount > 1) {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }
  }, [slideCount]);

  const handlePrevSlide = useCallback(() => {
    if (slideCount > 1) {
      setActiveSlide((prev) => (prev - 1 + slideCount) % slideCount);
    }
  }, [slideCount]);

  const articleBody = review ? portableTextToPlain(review.body) : '';
  const galleryMeta = useMemo(() => extractGalleryMeta(review), [review]);
  const location = galleryMeta.name ? `${galleryMeta.name}${galleryMeta.city ? `, ${galleryMeta.city}` : ''}` : 'Gallery Location';

  const hostGalleryName = galleryMeta.name;
  
  const galleryId =
    review?.resolvedExternalGallery?.id ??
    review?.externalExhibition?.gallery?.id ??
    null;
  const galleryLink = galleryId ? `/galleries/${galleryId}` : null;
  
  const galleryWebsite = review?.resolvedExternalGallery?.placeurl ?? galleryMeta.website ?? null;
  const galleryWebsiteLabel = galleryWebsite
    ? getDisplayDomain(galleryWebsite) ?? galleryWebsite.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    : null;

  const exhibitionTimeline = useMemo(() => {
    const formatted = formatExhibitionWindow(review?.resolvedExternalExhibition, review?.externalExhibition);
    return formatted ?? {primary: 'Dates to be announced', secondary: null};
  }, [review?.externalExhibition, review?.resolvedExternalExhibition]);

  const admissionDetails = useMemo(
    () =>
      deriveAdmissionDetails(
        review?.resolvedExternalGallery,
        review?.resolvedExternalExhibition,
        review?.externalExhibition ?? null,
      ),
    [review?.externalExhibition, review?.resolvedExternalExhibition, review?.resolvedExternalGallery],
  );

  const artistList = useMemo<LinkedDocument[]>(() => {
    if (!review) return [];
    const graphqlNames = parseGraphqlArtists(
      review.resolvedExternalExhibition?.artist ?? review.externalExhibition?.artist,
    );
    return graphqlNames.map((name, index) => ({
      _id: `${review._id}-artist-${index}`,
      name,
    }));
  }, [review]);

  const exhibitionOverview = useMemo(() => {
    if (!review) return null;

    return {
      title: review.resolvedExternalExhibition?.title ?? review.externalExhibition?.title ?? review.title,
      galleryName: hostGalleryName,
      galleryCity: galleryMeta.city ?? review.externalExhibition?.gallery?.city ?? null,
      dates: exhibitionTimeline,
      artists: artistList.map((artist) => artist.name).filter(Boolean) as string[],
      admission: admissionDetails,
      website: galleryWebsite,
      websiteLabel: galleryWebsiteLabel,
    };
  }, [
    admissionDetails,
    artistList,
    exhibitionTimeline,
    galleryMeta.city,
    galleryWebsite,
    galleryWebsiteLabel,
    hostGalleryName,
    review,
  ]);

  const exhibitionTitle = review?.resolvedExternalExhibition?.title ?? review?.externalExhibition?.title ?? null;
  const exhibitionLinkId = review?.resolvedExternalExhibition?.id ?? review?.externalExhibition?.id ?? null;
  const exhibitionHref = exhibitionLinkId ? `/exhibitions/${exhibitionLinkId}` : null;

  const curatorList: LinkedDocument[] = [];

  const authorProfilePath = article?.author
    ? `/ambassadors/${article.author.slug ?? article.author.id}`
    : undefined;

  const handleShare = useCallback(
    (platform: SharePlatform) => {
      if (typeof window === 'undefined') return;
      const pageUrl = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(article?.title ?? 'Art Flâneur review');

      const links: Record<SharePlatform, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${text}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
      };

      const shareLink = links[platform];
      window.open(shareLink, '_blank', 'noopener,noreferrer');
    },
    [article?.title],
  );

  // SEO with JSON-LD Article schema
  const seoTitle = article?.title 
    ? `${article.title} | Art Flaneur` 
    : 'Review | Art Flaneur';
  const seoDescription = useMemo(() => {
    const baseDesc = review?.excerpt || articleBody?.slice(0, 155) || 'Exhibition review on Art Flaneur.';
    const venueInfo = location !== 'Gallery Location' ? ` — ${location}` : '';
    return `${baseDesc}${venueInfo}`.slice(0, 160);
  }, [review?.excerpt, articleBody, location]);

  const articleJsonLd = useMemo(() => {
    if (!review || !article) return undefined;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: seoDescription,
      image: article.image,
      datePublished: review.publishedAt || undefined,
      dateModified: review._updatedAt || review.publishedAt || undefined,
      author: article.author ? {
        '@type': 'Person',
        name: article.author.name,
        url: authorProfilePath ? `https://www.artflaneur.art${authorProfilePath}` : undefined,
      } : {
        '@type': 'Organization',
        name: 'Art Flaneur',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Art Flaneur Global Pty Ltd',
        url: 'https://www.artflaneur.art/',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.artflaneur.art/stories/${article.slug}`,
      },
      ...(exhibitionTitle && {
        about: {
          '@type': 'ExhibitionEvent',
          name: exhibitionTitle,
          location: hostGalleryName ? {
            '@type': 'Place',
            name: hostGalleryName,
            address: galleryMeta.city || undefined,
          } : undefined,
        }
      }),
    };
  }, [review, article, seoDescription, authorProfilePath, exhibitionTitle, hostGalleryName, galleryMeta.city]);

  useSeo({
    title: seoTitle,
    description: seoDescription,
    imageUrl: article?.image,
    canonicalUrl: article ? `https://www.artflaneur.art/stories/${article.slug}` : undefined,
    ogType: 'article',
    jsonLd: articleJsonLd,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-art-paper">
        <p className="font-mono text-sm uppercase tracking-[0.3em]">Loading review…</p>
      </div>
    );
  }

  if (!review || !article) {
    return (
      <div className="min-h-screen bg-art-paper flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-[0.3em]">{error ?? 'Review not found'}</p>
          <Link
            to="/stories"
            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Back to articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-art-paper">
      {error && (
        <div className="bg-art-yellow border-b-2 border-black text-center py-3 font-mono text-xs uppercase tracking-widest">
          {error}
        </div>
      )}
      {/* Brutalist Header */}
      <div className="border-b-2 border-black bg-white">
          <div className="container mx-auto px-4 md:px-6 pt-8 pb-6">
            {sponsorBadge && (
              <div
                className="mb-6 inline-flex items-center gap-3 px-4 py-2 border-2 border-black uppercase text-xs font-mono tracking-widest"
                style={{backgroundColor: sponsorBadge.color ?? '#FFE8E8'}}
              >
                {sponsorBadge.logoUrl && (
                  <img src={sponsorBadge.logoUrl} alt="Sponsor logo" className="h-6 w-auto" />
                )}
                <span>{sponsorBadge.text}</span>
              </div>
            )}
            <div className="flex flex-col gap-4 mb-8">
                <span className="font-mono text-art-red font-bold uppercase tracking-widest text-sm border border-art-red self-start px-2 py-1">
                    {article.type}
                </span>
                <h1 className="text-2xl md:text-3xl font-black uppercase leading-tight max-w-4xl">
                    {article.title}
                </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 border-t-2 border-black pt-4 gap-4 font-mono text-xs uppercase">
                <div>
                    <span className="text-gray-500 block mb-1">Author</span>
                    {article.author ? (
                      authorProfilePath ? (
                        <Link to={authorProfilePath} className="font-bold hover:text-art-blue underline-offset-4 hover:underline">
                          {article.author.name}
                        </Link>
                      ) : (
                        <span className="font-bold">{article.author.name}</span>
                      )
                    ) : (
                      <span className="font-bold">Art Flâneur Editorial</span>
                    )}
                </div>
                <div>
                    <span className="text-gray-500 block mb-1">Date</span>
                    <span className="font-bold">{article.date ?? '—'}</span>
                </div>
                <div>
                    <span className="text-gray-500 block mb-1">Read Time</span>
                    <span className="font-bold">6 Minutes</span>
                </div>
                 <div>
                    <span className="text-gray-500 block mb-1">Share</span>
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleShare('facebook')}
                          className="hover:text-art-blue cursor-pointer font-bold"
                          aria-label="Share on Facebook"
                        >
                          FB
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare('twitter')}
                          className="hover:text-art-blue cursor-pointer font-bold"
                          aria-label="Share on Twitter"
                        >
                          TW
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare('linkedin')}
                          className="hover:text-art-blue cursor-pointer font-bold"
                          aria-label="Share on LinkedIn"
                        >
                          LN
                        </button>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Hero Gallery */}
      <div className="border-b-2 border-black">
        <div className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden bg-black">
          {heroSlides.map((slide, index) => (
            <img
              key={`${slide.url}-${index}`}
              src={slide.url}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {slideCount > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black border-2 border-black rounded-full p-3"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black border-2 border-black rounded-full p-3"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={`dot-${idx}`}
                    type="button"
                    className={`w-3 h-3 border border-white rounded-full ${
                      idx === activeSlide ? 'bg-white' : 'bg-transparent opacity-70'
                    }`}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {currentSlide?.caption && (
          <div className="border-t-2 border-black bg-white px-4 py-3 text-xs font-mono uppercase tracking-[0.3em]">
            <span>{currentSlide.caption}</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar / Info */}
            <div className="lg:col-span-4 order-2 lg:order-1">
                 <div className="sticky top-32 p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h4 className="font-black uppercase text-lg mb-6 border-b-2 border-black pb-2">
                       {hasFilmEntries ? 'Film Stack' : 'Details'}
                     </h4>
                     {hasFilmEntries ? (
                       <FilmReviewSidebar films={filmEntries} />
                     ) : (
                       <div className="space-y-6 font-mono text-sm">
                         {/* Exhibition Title and Dates */}
                         {exhibitionTitle && (
                           <div className="pb-4 border-b border-gray-200">
                             {exhibitionHref ? (
                               <Link
                                 to={exhibitionHref}
                                 className="font-bold text-base leading-tight mb-2 underline-offset-2 hover:underline"
                               >
                                 {exhibitionTitle}
                               </Link>
                             ) : (
                               <p className="font-bold text-base leading-tight mb-2">{exhibitionTitle}</p>
                             )}
                             <div className="text-xs text-gray-600">
                               <span className="font-bold">{exhibitionTimeline.primary}</span>
                               {exhibitionTimeline.secondary && (
                                 <span className="block text-gray-500">{exhibitionTimeline.secondary}</span>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {/* Gallery Name */}
                         {hostGalleryName && (
                           <div className="flex items-start gap-3">
                             <MapPin className="w-4 h-4 mt-1" />
                             <div className="flex-1">
                               {galleryLink ? (
                                 <Link
                                   to={galleryLink}
                                   className="font-bold hover:underline underline-offset-2"
                                 >
                                   {hostGalleryName}
                                 </Link>
                               ) : (
                                 <p className="font-bold">{hostGalleryName}</p>
                               )}
                             </div>
                           </div>
                         )}
                         
                         {/* Artist */}
                         <div className="border-t border-gray-200 pt-4">
                           <div>
                             <p className="font-bold uppercase text-xs tracking-widest mb-2">Artist{artistList.length > 1 ? 's' : ''}</p>
                             {artistList.length ? (
                               <p className="text-base font-mono leading-relaxed">
                                 {artistList.map((artist, index) => {
                                   const label = artist?.name ?? 'Unknown artist';
                                   const isLast = index === artistList.length - 1;
                                   return (
                                     <React.Fragment key={artist._id}>
                                       {label}
                                       {!isLast && ', '}
                                     </React.Fragment>
                                   );
                                 })}
                               </p>
                             ) : (
                               <p className="text-gray-500 text-xs">Artist details coming soon.</p>
                             )}
                           </div>
                         </div>
                       </div>
                     )}
                 </div>
            </div>

              {/* Content Body */}
              <div className="lg:col-span-8 lg:col-start-5 order-1 lg:order-2">
                <div className="prose prose-lg max-w-none">
                  {article.subtitle && (
                    <p className="font-serif text-lg md:text-xl leading-relaxed text-black mb-8 italic">
                      {article.subtitle}
                    </p>
                  )}
                  <PortableTextRenderer value={review?.body} />
                </div>
                {hasFilmEntries && (
                  <div className="mt-16">
                    <FilmReviewGrid films={filmEntries} />
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* Related Content */}
      <section className="bg-white border-t-2 border-black py-20 mt-12">
          <div className="container mx-auto px-4 md:px-6">
              <h3 className="text-3xl font-black uppercase mb-12 flex items-center gap-4">
                  <span className="w-4 h-4 bg-art-yellow border border-black"></span>
                  Related Stories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {relatedArticles.map(a => (
                      <ArticleCard key={a.id} article={a} variant="vertical" />
                  ))}
              </div>
          </div>
      </section>
    </div>
  );
};

const FilmReviewSidebar: React.FC<{ films: FilmReviewEntryType[] }> = ({ films }) => {
  const releaseYears = films
    .map((film) => film?.releaseYear)
    .filter((year): year is number => typeof year === 'number');
  const releaseLabel = releaseYears.length
    ? releaseYears.length === 1
      ? `${releaseYears[0]}`
      : `${Math.min(...releaseYears)} – ${Math.max(...releaseYears)}`
    : null;
  const platforms = Array.from(
    new Set(
      films
        .map((film) => film?.whereToWatch?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const lineup = films
    .map((film, index) => ({
      title: film?.title?.trim(),
      anchor: getFilmAnchorId(film ?? null, index),
    }))
    .filter((entry): entry is {title: string; anchor: string} => Boolean(entry.title));

  return (
    <div className="space-y-6 font-mono text-sm">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">Film Count</p>
        <p className="text-3xl font-black">{films.length}</p>
      </div>

      {lineup.length > 0 && (
        <div>
          <ol className="space-y-1">
            {lineup.map((entry, index) => (
              <li key={`${entry.title}-${index}`} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono w-6">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <a
                  href={`#${entry.anchor}`}
                  className="font-bold leading-tight hover:text-art-blue transition-colors"
                >
                  {entry.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}

      {platforms.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Where to Watch</p>
          <p className="text-sm leading-relaxed">{platforms.join(' • ')}</p>
        </div>
      )}

      {releaseLabel && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Release Window</p>
          <p className="text-base font-bold">{releaseLabel}</p>
        </div>
      )}
    </div>
  );
};

const FilmReviewGrid: React.FC<{ films: FilmReviewEntryType[] }> = ({ films }) => {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 border-2 border-black rounded-full bg-art-yellow/80">
          <Film className="w-4 h-4" />
        </div>
        <h2 className="text-2xl font-black uppercase">{films.length} Films In Focus</h2>
      </div>
      <div className="grid gap-6">
        {films.map((film, index) => {
          const metaBits: string[] = [];
          if (film?.releaseYear) {
            metaBits.push(film.releaseYear.toString());
          }
          if (film?.duration) {
            metaBits.push(`${film.duration} min`);
          }
          const imageUrl = film?.still?.asset?.url ?? null;
          const imageAlt = film?.still?.alt ?? `${film?.title ?? 'Film'} still`;
          const imageCaption = film?.still?.caption;
          const anchorId = getFilmAnchorId(film ?? null, index);
          return (
            <article
              id={anchorId}
              key={film?._key ?? `${film?.title ?? 'film'}-${index}`}
              className="relative border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scroll-mt-32"
            >
              <span className="absolute -top-3 -left-3 bg-black text-white w-10 h-10 flex items-center justify-center font-black text-lg">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                {imageUrl && (
                  <figure className="md:w-1/3 border-2 border-black bg-gray-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-full object-cover"
                      loading={index > 2 ? 'lazy' : 'eager'}
                    />
                    {imageCaption && (
                      <figcaption className="text-[10px] font-mono uppercase tracking-[0.3em] px-3 py-2 border-t border-black">
                        {imageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}
                <div className="flex-1 pl-0 md:pl-2">
                  <h3 className="text-xl font-black uppercase mb-1">{film?.title ?? 'Untitled film'}</h3>
                  {film?.director && (
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
                      Directed by {film.director}
                    </p>
                  )}
                  {metaBits.length > 0 && (
                    <p className="text-xs font-mono text-gray-600 mb-3">{metaBits.join(' • ')}</p>
                  )}
                  {film?.summary && (
                    <p className="font-mono text-base leading-relaxed mb-4">{film.summary}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-gray-600">
                    {film?.whereToWatch && film?.filmLink && (
                      <a
                        href={film.filmLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-art-yellow px-3 py-1 border border-black text-black hover:bg-black hover:text-art-yellow transition-colors"
                      >
                        {film.whereToWatch}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {film?.whereToWatch && !film?.filmLink && (
                      <span className="bg-art-yellow px-3 py-1 border border-black text-black">
                        {film.whereToWatch}
                      </span>
                    )}
                    {!film?.whereToWatch && film?.filmLink && (
                      <a
                        href={film.filmLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-black hover:text-art-blue"
                      >
                        Watch
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ArticleView;