import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, MapPin, Clock, Ticket } from 'lucide-react';
import { ArticleCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import { REVIEW_QUERY, REVIEWS_QUERY } from '../sanity/lib/queries';
import { BlockContent } from '../sanity/types';
import { REVIEW_QUERYResult, REVIEWS_QUERYResult, ExternalExhibitionReference } from '../sanity/types';
import { Article, ContentType } from '../types';
import { getAppDownloadLink, getDisplayDomain } from '../lib/formatters';
import { fetchExhibitionById, fetchGalleryById, type GraphqlExhibition, type GraphqlGallery } from '../lib/graphql';

type ReviewLike = (REVIEW_QUERYResult | REVIEWS_QUERYResult[number]) & {
  externalExhibition?: ExternalExhibitionReference | null;
};

const isFullReview = (review: ReviewLike): review is REVIEW_QUERYResult =>
  'sponsorshipEnabled' in review;

const hasResolvedExternalExhibition = (
  review: ReviewLike | EnrichedReview,
): review is EnrichedReview =>
  typeof review === 'object' && review !== null && 'resolvedExternalExhibition' in review;

const extractGalleryMeta = (review: ReviewLike | EnrichedReview | null) => {
  if (!review) {
    return {name: undefined, city: undefined};
  }

  const resolved = hasResolvedExternalExhibition(review) ? review.resolvedExternalExhibition : undefined;
  const fallback = review.externalExhibition;

  return {
    name: resolved?.galleryname ?? fallback?.gallery?.name ?? undefined,
    city: resolved?.city ?? fallback?.gallery?.city ?? undefined,
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

const portableTextToPlain = (body?: BlockContent | null) => {
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

const getSponsorBadge = (review: REVIEW_QUERYResult | null) => {
  if (!review || review.sponsorshipEnabled !== 'yes' || !review.sponsor) {
    return null;
  }

  const templateKey = review.sponsorBadgeSettings?.template ?? 'default';
  const template =
    templateKey === 'custom'
      ? review.sponsorBadgeSettings?.customText ?? badgeTemplateText.default
      : badgeTemplateText[templateKey] ?? badgeTemplateText.default;

  const text = template.replace('{logo}', review.sponsor.name ?? 'our partner');

  return {
    text,
    logoUrl: review.sponsor.logo?.asset?.url,
    color: review.sponsor.brandColor?.hex ?? undefined,
  };
};

type SharePlatform = 'facebook' | 'twitter' | 'linkedin';

type EnrichedReview = REVIEW_QUERYResult & {
  resolvedExternalExhibition?: GraphqlExhibition | null;
  resolvedExternalGallery?: GraphqlGallery | null;
};

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<EnrichedReview | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const reviewData = await client.fetch<REVIEW_QUERYResult>(REVIEW_QUERY, {slug: id});
        if (!isMounted) return;

        if (!reviewData) {
          setError('We could not find this review.');
          setReview(null);
          setRelatedArticles([]);
          setLoading(false);
          return;
        }

        // Hydrate external exhibition + gallery if present
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
        console.error('❌ Error fetching review:', err);
        if (!isMounted) return;
        setError('Unable to load this review right now.');
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

  const sponsorBadge = useMemo(() => getSponsorBadge(review), [review]);
  const article = useMemo(() => (review ? mapReviewToArticle(review) : null), [review]);
  const articleBody = review ? portableTextToPlain(review.body) : '';
  const galleryMeta = useMemo(() => extractGalleryMeta(review), [review]);
  const location = galleryMeta.name ? `${galleryMeta.name}${galleryMeta.city ? `, ${galleryMeta.city}` : ''}` : 'Gallery Location';

  const galleryAddress = review?.resolvedExternalGallery?.fulladdress ?? galleryMeta.city ?? null;
  const galleryWebsite = review?.resolvedExternalGallery?.placeurl ?? null;
  const galleryWebsiteLabel = galleryWebsite
    ? getDisplayDomain(galleryWebsite) ?? galleryWebsite.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    : null;
  const hostGalleryName = galleryMeta.name;

  const artistList = useMemo<LinkedDocument[]>(() => {
    if (!review) return [];
    const graphqlNames = parseGraphqlArtists(review.resolvedExternalExhibition?.artist);
    if (graphqlNames.length) {
      return graphqlNames.map((name, index) => ({
        _id: `${review._id}-artist-${index}`,
        name,
      }));
    }
    return ((review.artists ?? []) as LinkedDocument[]) || [];
  }, [review]);

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
            to="/reviews"
            className="inline-flex items-center gap-3 px-6 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Back to reviews
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
          <div className="container mx-auto px-4 md:px-6 pt-16 pb-12">
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
                <h1 className="text-4xl md:text-7xl font-black uppercase leading-[0.9] max-w-5xl">
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

      {/* Main Image */}
      <div className="w-full h-[50vh] md:h-[70vh] relative border-b-2 border-black overflow-hidden">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar / Info */}
            <div className="lg:col-span-3 order-2 lg:order-1">
                 <div className="sticky top-32 p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h4 className="font-black uppercase text-lg mb-6 border-b-2 border-black pb-2">Details</h4>
                     <div className="space-y-6 font-mono text-sm">
                         <div className="flex items-start gap-3">
                             <MapPin className="w-4 h-4 mt-1" />
                             <div>
                                 <p className="font-bold">{location}</p>
                                 <p className="text-gray-500 text-xs">{galleryAddress ?? 'Address available soon'}</p>
                                 {galleryWebsite && galleryWebsiteLabel && (
                                   <a
                                     href={galleryWebsite}
                                     target="_blank"
                                     rel="noreferrer"
                                     className="text-art-blue underline text-[10px]"
                                   >
                                     {galleryWebsiteLabel}
                                   </a>
                                 )}
                             </div>
                         </div>
                         <div className="flex items-start gap-3">
                             <Clock className="w-4 h-4 mt-1" />
                             <div>
                                 <p className="font-bold">Open Today</p>
                                 <p className="text-gray-500 text-xs">10:00 - 18:00</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-3">
                             <Ticket className="w-4 h-4 mt-1" />
                             <div>
                                 <p className="font-bold">Entry: Free</p>
                                 {hostGalleryName && (
                                   <p className="text-gray-500 text-xs">Hosted by {hostGalleryName}</p>
                                 )}
                             </div>
                         </div>
                         <div className="border-t border-gray-200 pt-4 space-y-4">
                           <div>
                             <p className="font-bold uppercase text-xs tracking-widest mb-1">Artist{artistList.length > 1 ? 's' : ''}</p>
                             {artistList.length ? (
                               <div className="flex flex-wrap gap-2 text-xs font-mono">
                                 {artistList.map((artist) => {
                                   const path = getReferencePath('/artists', artist);
                                   const label = artist?.name ?? 'Unknown artist';
                                   return path ? (
                                     <Link key={artist._id} to={path} className="underline decoration-dotted hover:text-art-blue">
                                       {label}
                                     </Link>
                                   ) : (
                                     <span key={artist._id}>{label}</span>
                                   );
                                 })}
                               </div>
                             ) : (
                               <p className="text-gray-500 text-xs">Artist details coming soon.</p>
                             )}
                           </div>
                           <div>
                             <p className="font-bold uppercase text-xs tracking-widest mb-1">Curator{curatorList.length > 1 ? 's' : ''}</p>
                             {curatorList.length ? (
                               <div className="flex flex-wrap gap-2 text-xs font-mono">
                                 {curatorList.map((curator) => {
                                   const path = getReferencePath('/curators', curator);
                                   const label = curator?.name ?? 'Unknown curator';
                                   return path ? (
                                     <Link key={curator._id} to={path} className="underline decoration-dotted hover:text-art-blue">
                                       {label}
                                     </Link>
                                   ) : (
                                     <span key={curator._id}>{label}</span>
                                   );
                                 })}
                               </div>
                             ) : (
                               <p className="text-gray-500 text-xs">Curator to be announced.</p>
                             )}
                           </div>
                         </div>
                     </div>
                     {/* Save to App Button - с автоопределением платформы */}
                     <a 
                        href={getAppDownloadLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full mt-8 bg-black text-white py-3 font-bold uppercase tracking-wide text-xs hover:bg-art-blue transition-colors text-center"
                     >
                        Save to App
                     </a>
                 </div>
            </div>

            {/* Content Body */}
            <div className="lg:col-span-8 lg:col-start-5 order-1 lg:order-2">
                <div className="prose prose-lg max-w-none">
                     <p className="font-serif text-2xl md:text-3xl leading-relaxed text-black mb-8 italic">
                        {article.subtitle}
                    </p>
                    <div className="font-sans font-light text-lg leading-loose space-y-6 text-gray-800">
            <p className="first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] whitespace-pre-line">
              {articleBody ||
                "The gallery is silent, save for the faint hum of the air conditioning. It is here, in this vacuum of noise, that the work speaks loudest. The exhibition brings together twenty years of practice, revealing a consistency of thought that is remarkably rare in today's frenetic art market."}
            </p>
                        <p>
                            Walking through the space, one is struck by the scale. Not just physical scale, but the scale of ambition. The artist attempts to map the unmappable: the fleeting nature of memory, the digital decay of our online lives, and the persistence of physical matter.
                        </p>
                        <blockquote className="border-l-4 border-art-blue pl-6 my-12 bg-gray-100 p-8 border-y-2 border-r-2 border-gray-200">
                            <p className="font-black uppercase text-xl not-italic mb-2">"Art is not a mirror to hold up to society, but a hammer with which to shape it."</p>
                        </blockquote>
                        <p>
                            In the second room, the tone shifts. The stark white walls are replaced by a dimly lit environment where video works play in an endless loop. It suggests a trap, a cycle from which we cannot escape. Yet, there is beauty in the repetition.
                        </p>
            <div className="my-12 border-2 border-black p-2">
              <img src="https://picsum.photos/600/600?random=88" alt="Detail view" className="w-full grayscale hover:grayscale-0 transition-all" />
                             <p className="font-mono text-xs text-gray-500 mt-2 uppercase">Fig 1. Installation View, 2024</p>
                        </div>
                        <p>
                            Ultimately, this retrospective is a triumph. It demands patience from the viewer, asking us to slow down our consumption of images and truly look. In an age of infinite scroll, this act of looking feels like a radical political act.
                        </p>
                    </div>
                </div>
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

export default ArticleView;