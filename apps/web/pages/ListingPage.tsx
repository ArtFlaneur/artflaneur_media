import React, { useEffect, useState } from 'react';
import { EntityCard } from '../components/Shared';
import { MOCK_ARTICLES, MOCK_ARTISTS, MOCK_EXHIBITIONS, AUTHORS, MOCK_GUIDES } from '../constants';
import { client } from '../sanity/lib/client';
import { REVIEWS_QUERY, POSTS_QUERY, EXHIBITIONS_QUERY, ARTISTS_QUERY, AUTHORS_QUERY, GUIDES_QUERY } from '../sanity/lib/queries';
import { ContentType } from '../types';

interface ListingPageProps {
  title: string;
  type: 'reviews' | 'artists' | 'exhibitions' | 'guides' | 'ambassadors';
}

const ListingPage: React.FC<ListingPageProps> = ({ title, type }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`🔍 Fetching ${type}...`);
        
        let sanityData = null;
        
        switch(type) {
          case 'reviews':
            sanityData = await client.fetch(REVIEWS_QUERY);
            if (sanityData && sanityData.length > 0) {
              setData(sanityData.map((review: any) => ({
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
              })));
            } else {
              setData(MOCK_ARTICLES);
            }
            break;
            
          case 'exhibitions':
            sanityData = await client.fetch(EXHIBITIONS_QUERY);
            if (sanityData && sanityData.length > 0) {
              setData(sanityData.map((exhibition: any) => ({
                id: exhibition._id,
                title: exhibition.title,
                artist: exhibition.artist?.name || 'Various Artists',
                gallery: exhibition.gallery?.name || 'Gallery',
                location: exhibition.gallery?.city || 'City',
                startDate: new Date(exhibition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                endDate: new Date(exhibition.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                image: exhibition.coverImage?.asset?.url || `https://picsum.photos/400/300?random=${exhibition._id}`
              })));
            } else {
              setData(MOCK_EXHIBITIONS);
            }
            break;
            
          case 'artists':
            sanityData = await client.fetch(ARTISTS_QUERY);
            if (sanityData && sanityData.length > 0) {
              setData(sanityData.map((artist: any) => ({
                id: artist._id,
                name: artist.name,
                image: artist.photo?.asset?.url || `https://picsum.photos/300/400?random=${artist._id}`,
                bio: artist.bio || '',
                discipline: artist.discipline || [],
                location: artist.location || 'Unknown'
              })));
            } else {
              setData(MOCK_ARTISTS);
            }
            break;
            
          case 'guides':
            sanityData = await client.fetch(GUIDES_QUERY);
            if (sanityData && sanityData.length > 0) {
              setData(sanityData.map((guide: any) => ({
                id: guide._id,
                title: guide.title,
                city: guide.city || 'City',
                description: guide.description || '',
                image: guide.coverImage?.asset?.url || `https://picsum.photos/800/600?random=${guide._id}`,
                stopsCount: guide.stops?.length || 0
              })));
            } else {
              setData(MOCK_GUIDES);
            }
            break;
            
          case 'ambassadors':
            sanityData = await client.fetch(AUTHORS_QUERY);
            if (sanityData && sanityData.length > 0) {
              setData(sanityData.map((author: any) => ({
                id: author._id,
                name: author.name,
                role: author.role || 'Contributor',
                image: author.photo?.asset?.url || `https://picsum.photos/200/200?random=${author._id}`,
                bio: author.bio || ''
              })));
            } else {
              setData(AUTHORS);
            }
            break;
            
          default:
            setData([]);
        }
        
        console.log(`📦 ${type} data:`, sanityData);
        setLoading(false);
      } catch (error) {
        console.error(`❌ Error fetching ${type}:`, error);
        // Fallback to mock data
        switch(type) {
          case 'reviews': setData(MOCK_ARTICLES); break;
          case 'artists': setData(MOCK_ARTISTS); break;
          case 'exhibitions': setData(MOCK_EXHIBITIONS); break;
          case 'guides': setData(MOCK_GUIDES); break;
          case 'ambassadors': setData(AUTHORS); break;
          default: setData([]);
        }
        setLoading(false);
      }
    };
    
    fetchData();
  }, [type]);
  const cardType = type === 'ambassadors' ? 'author' : type === 'reviews' ? 'article' : type === 'guides' ? 'guide' : type === 'artists' ? 'artist' : 'exhibition';

  return (
    <div className="min-h-screen bg-art-paper">
        {/* Header */}
        <div className="bg-white border-b-2 border-black pt-20 pb-12">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8">{title}</h1>
                
                {/* Simulated Filters */}
                <div className="flex flex-wrap gap-4 font-mono text-xs uppercase font-bold">
                    <button className="bg-black text-white px-4 py-2 border-2 border-black">All</button>
                    <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Featured</button>
                    <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Latest</button>
                    {type === 'exhibitions' && <button className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-gray-100">Opening Soon</button>}
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className={`grid gap-6 ${type === 'artists' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                {data.map((item: any, idx: number) => (
                    <EntityCard key={idx} data={item} type={cardType as any} />
                ))}
            </div>
        </div>
    </div>
  );
};

export default ListingPage;