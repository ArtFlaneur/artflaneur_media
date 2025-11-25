import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_ARTICLES } from '../constants';
import { Facebook, Twitter, Linkedin, MapPin, Clock, Ticket } from 'lucide-react';
import { ArticleCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import { REVIEW_QUERY, REVIEWS_QUERY } from '../sanity/lib/queries';
import { BlockContent, REVIEW_QUERYResult, REVIEWS_QUERYResult } from '../sanity/types';
import { Article, ContentType } from '../types';

// Функция для определения платформы пользователя
const getAppStoreLink = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Проверка на iOS
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783';
  }
  
  // Проверка на Android
  if (/android/i.test(userAgent)) {
    return 'https://play.google.com/store/apps/details?id=com.artflaneur';
  }
  
  // По умолчанию для десктопа - App Store
  return 'https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783';
};

const FALLBACK_ARTICLE = MOCK_ARTICLES[0];
const FALLBACK_RELATED = MOCK_ARTICLES.slice(1, 4);

type ReviewLike = REVIEW_QUERYResult | REVIEWS_QUERYResult[number];

const isFullReview = (review: ReviewLike): review is REVIEW_QUERYResult =>
  'sponsorshipEnabled' in review || 'gallery' in review || 'exhibition' in review;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
    : undefined;

const mapReviewToArticle = (review: ReviewLike): Article => {
  const galleryName = isFullReview(review)
    ? review.exhibition?.gallery?.name ?? review.gallery?.name
    : undefined;
  const galleryCity = isFullReview(review)
    ? review.exhibition?.gallery?.city ?? review.gallery?.city
    : undefined;

  return {
    id: review._id,
    slug: review.slug?.current ?? review._id,
    type: ContentType.REVIEW,
    title: review.title ?? 'Untitled Review',
    subtitle: review.excerpt ?? '',
    image: review.mainImage?.asset?.url ?? `https://picsum.photos/seed/${review._id}/1200/900`,
    date: formatDate(review.publishedAt),
    location: galleryName ? `${galleryName}${galleryCity ? `, ${galleryCity}` : ''}` : undefined,
    author: review.author
      ? {
          id: review.author._id,
          name: review.author.name ?? 'Anonymous',
          role: 'Critic',
          image: review.author.photo?.asset?.url ?? '',
        }
      : undefined,
  };
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

const getLocationLabel = (review: REVIEW_QUERYResult | null) => {
  if (review?.exhibition?.gallery?.name) {
    const gallery = review.exhibition.gallery;
    return `${gallery.name}${gallery.city ? `, ${gallery.city}` : ''}`;
  }
  if (review?.gallery?.name) {
    const gallery = review.gallery;
    return `${gallery.name}${gallery.city ? `, ${gallery.city}` : ''}`;
  }
  return 'Gallery Location';
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

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<REVIEW_QUERYResult | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>(FALLBACK_RELATED);
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
          setError('We could not find this review. Showing an archive highlight instead.');
          setReview(null);
          setRelatedArticles(FALLBACK_RELATED);
          setLoading(false);
          return;
        }

        setReview(reviewData);
        const relatedData = await client.fetch<REVIEWS_QUERYResult>(REVIEWS_QUERY);
        if (!isMounted) return;
        const related = (relatedData ?? [])
          .filter((r) => r._id !== reviewData._id)
          .slice(0, 3)
          .map(mapReviewToArticle);
        setRelatedArticles(related.length ? related : FALLBACK_RELATED);
      } catch (err) {
        console.error('❌ Error fetching review:', err);
        if (!isMounted) return;
        setError('Unable to sync the latest review. Showing a curated highlight instead.');
        setReview(null);
        setRelatedArticles(FALLBACK_RELATED);
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

  const article = useMemo(() => (review ? mapReviewToArticle(review) : FALLBACK_ARTICLE), [review]);
  const sponsorBadge = useMemo(() => getSponsorBadge(review), [review]);
  const articleBody = review ? portableTextToPlain(review.body) : article.content;
  const location = getLocationLabel(review);
  const galleryAddress = review?.gallery?.address;
  const galleryWebsite = review?.gallery?.website;

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
                    <span className="font-bold">{article.author?.name ?? 'Art Flâneur Editorial'}</span>
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
                        <span className="hover:text-art-blue cursor-pointer">FB</span>
                        <span className="hover:text-art-blue cursor-pointer">TW</span>
                        <span className="hover:text-art-blue cursor-pointer">LN</span>
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
                                 {galleryWebsite && (
                                   <a
                                     href={galleryWebsite}
                                     target="_blank"
                                     rel="noreferrer"
                                     className="text-art-blue underline text-[10px]"
                                   >
                                     Visit website
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
                             </div>
                         </div>
                     </div>
                     {/* Save to App Button - с автоопределением платформы */}
                     <a 
                        href={getAppStoreLink()}
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
                             <img src="https://picsum.photos/800/500?random=88" alt="Detail view" className="w-full grayscale hover:grayscale-0 transition-all" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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