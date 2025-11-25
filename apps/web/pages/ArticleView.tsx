import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_ARTICLES } from '../constants';
import { Facebook, Twitter, Linkedin, MapPin, Clock, Ticket } from 'lucide-react';
import { ArticleCard } from '../components/Shared';
import { client } from '../sanity/lib/client';
import { REVIEW_QUERY, REVIEWS_QUERY } from '../sanity/lib/queries';
import { ContentType } from '../types';

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState(MOCK_ARTICLES[0]);
  const [relatedArticles, setRelatedArticles] = useState(MOCK_ARTICLES.slice(1, 4));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        console.log('🔍 Fetching review:', id);
        
        // Fetch single review by slug
        const reviewData = await client.fetch(REVIEW_QUERY, { slug: id });
        console.log('📦 Review data:', reviewData);
        
        if (reviewData) {
          setArticle({
            id: reviewData._id,
            title: reviewData.title,
            subtitle: reviewData.excerpt || '',
            image: reviewData.mainImage?.asset?.url || MOCK_ARTICLES[0].image,
            date: new Date(reviewData.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            type: ContentType.REVIEW,
            author: reviewData.author ? {
              id: reviewData.author._id,
              name: reviewData.author.name,
              role: 'Critic',
              image: reviewData.author.photo?.asset?.url || ''
            } : undefined,
            location: reviewData.exhibition?.gallery?.name 
              ? `${reviewData.exhibition.gallery.name}, ${reviewData.exhibition.gallery.city}`
              : 'Gallery Location',
            content: reviewData.body 
              ? reviewData.body.map((block: any) => block.children?.map((child: any) => child.text).join(' ')).join('\n\n')
              : ''
          });
          
          // Fetch related reviews
          const relatedData = await client.fetch(REVIEWS_QUERY);
          if (relatedData && relatedData.length > 0) {
            setRelatedArticles(relatedData
              .filter((r: any) => r._id !== reviewData._id)
              .slice(0, 3)
              .map((review: any) => ({
                id: review._id,
                title: review.title,
                subtitle: review.excerpt || '',
                image: review.mainImage?.asset?.url || `https://picsum.photos/400/300?random=${review._id}`,
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
                  image: review.author.photo?.asset?.url || ''
                } : undefined
              }))
            );
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching review:', error);
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);

  return (
    <div className="bg-art-paper">
      {/* Brutalist Header */}
      <div className="border-b-2 border-black bg-white">
          <div className="container mx-auto px-4 md:px-6 pt-16 pb-12">
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
                    <span className="font-bold">{article.author.name}</span>
                </div>
                <div>
                    <span className="text-gray-500 block mb-1">Date</span>
                    <span className="font-bold">{article.date}</span>
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
                                 <p className="font-bold">{article.location}</p>
                                 <p className="text-gray-500 text-xs">123 Art Lane, Floor 2</p>
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
                     <button className="w-full mt-8 bg-black text-white py-3 font-bold uppercase tracking-wide text-xs hover:bg-art-blue transition-colors">
                        Save to App
                     </button>
                 </div>
            </div>

            {/* Content Body */}
            <div className="lg:col-span-8 lg:col-start-5 order-1 lg:order-2">
                <div className="prose prose-lg max-w-none">
                     <p className="font-serif text-2xl md:text-3xl leading-relaxed text-black mb-8 italic">
                        {article.subtitle}
                    </p>
                    <div className="font-sans font-light text-lg leading-loose space-y-6 text-gray-800">
                        <p className="first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]">
                            {article.content || "The gallery is silent, save for the faint hum of the air conditioning. It is here, in this vacuum of noise, that the work speaks loudest. The exhibition brings together twenty years of practice, revealing a consistency of thought that is remarkably rare in today's frenetic art market."}
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