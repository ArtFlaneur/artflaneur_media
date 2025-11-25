import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_ARTISTS } from '../constants';
import { client } from '../sanity/lib/client';
import { ARTIST_QUERY } from '../sanity/lib/queries';

const ArtistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState(MOCK_ARTISTS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;
      
      try {
        console.log('🔍 Fetching artist:', id);
        const artistData = await client.fetch(ARTIST_QUERY, { slug: id });
        console.log('📦 Artist data:', artistData);
        
        if (artistData) {
          setArtist({
            id: artistData._id,
            name: artistData.name,
            image: artistData.photo?.asset?.url || MOCK_ARTISTS[0].image,
            bio: artistData.bio || '',
            discipline: artistData.discipline || [],
            location: artistData.location || 'Unknown',
            featuredWork: artistData.featuredWork || ''
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching artist:', error);
        setLoading(false);
      }
    };
    
    fetchArtist();
  }, [id]);

  return (
    <div className="bg-white">
        {/* Split Screen Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] border-b-2 border-black">
            <div className="relative border-b-2 md:border-b-0 md:border-r-2 border-black h-[50vh] md:h-auto">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover grayscale" />
                <div className="absolute bottom-0 left-0 bg-white border-t-2 border-r-2 border-black px-6 py-4">
                     <h1 className="text-4xl md:text-6xl font-black uppercase leading-none">{artist.name}</h1>
                </div>
            </div>
            <div className="p-12 md:p-24 flex flex-col justify-center bg-art-paper">
                <div className="flex gap-2 mb-8">
                    {artist.discipline.map(d => (
                        <span key={d} className="border border-black px-3 py-1 font-mono text-xs uppercase">{d}</span>
                    ))}
                </div>
                <p className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8">
                    "{artist.bio}"
                </p>
                <div className="font-mono text-sm text-gray-600">
                    <p className="mb-2"><strong className="text-black">Based in:</strong> {artist.location}</p>
                    <p><strong className="text-black">Represented by:</strong> Gagosian, White Cube</p>
                </div>
            </div>
        </div>

        {/* Selected Works Grid */}
        <div className="container mx-auto px-4 md:px-6 py-24">
            <h2 className="text-4xl font-black uppercase mb-12 border-l-8 border-art-blue pl-6">Selected Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Mock Works */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="group border-2 border-black p-2 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="aspect-square overflow-hidden mb-4 bg-gray-100">
                            <img src={`https://picsum.photos/600/600?random=${i + 100}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" alt="Artwork" />
                        </div>
                        <div className="flex justify-between items-end font-mono text-xs">
                            <span className="font-bold uppercase">Untitled No. {i}</span>
                            <span className="text-gray-500">2023</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ArtistView;