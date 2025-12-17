import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchArtistById, fetchExhibitionsForArtist, GraphqlArtist, GraphqlExhibition } from '../lib/graphql';

const ArtistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<GraphqlArtist | null>(null);
  const [exhibitions, setExhibitions] = useState<GraphqlExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) {
        setError('Missing artist identifier.');
        setLoading(false);
        return;
      }
      
      try {
        const [artistData, exhibitionsData] = await Promise.all([
          fetchArtistById(id),
          fetchExhibitionsForArtist(id),
        ]);
        setArtist(artistData);
        setExhibitions(exhibitionsData);
        setError(artistData ? null : 'Artist not found.');
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching artist:', err);
        setError('Unable to load this artist right now.');
        setLoading(false);
      }
    };
    
    fetchArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">Loading artist...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">{error || 'Artist not found'}</p>
      </div>
    );
  }

  const lifespan = artist.birth_year
    ? artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : `b. ${artist.birth_year}`
    : null;

  return (
    <div className="bg-white">
        {/* Split Screen Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] border-b-2 border-black">
            <div className="relative border-b-2 md:border-b-0 md:border-r-2 border-black h-[50vh] md:h-auto">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center font-mono text-xs uppercase">Portrait coming soon</div>
                <div className="absolute bottom-0 left-0 bg-white border-t-2 border-r-2 border-black px-6 py-4">
                     <h1 className="text-4xl md:text-6xl font-black uppercase leading-none">{artist.name || 'Untitled Artist'}</h1>
                </div>
            </div>
            <div className="p-12 md:p-24 flex flex-col justify-center bg-art-paper">
                <p className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8">
                    {artist.description ? `"${artist.description}"` : 'Biography coming soon.'}
                </p>
                <div className="font-mono text-sm text-gray-600 space-y-2">
                    {artist.country && (
                      <p><strong className="text-black">Country:</strong> {artist.country}</p>
                    )}
                    {lifespan && (
                      <p><strong className="text-black">Life:</strong> {lifespan}</p>
                    )}
                    {artist.wikipedia_url && (
                      <p>
                        <strong className="text-black">Wikipedia:</strong>{' '}
                        <a href={artist.wikipedia_url} target="_blank" rel="noreferrer" className="underline hover:text-art-blue">View page</a>
                      </p>
                    )}
                </div>
            </div>
        </div>

        {/* Exhibitions */}
        <div className="container mx-auto px-4 md:px-6 py-24">
            <h2 className="text-4xl font-black uppercase mb-12 border-l-8 border-art-blue pl-6">Exhibitions & Shows</h2>
            {exhibitions.length === 0 ? (
              <div className="border-2 border-dashed border-black p-8 text-center font-mono text-sm text-gray-500">
                Exhibition history coming soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exhibitions.map((exhibition) => (
                  <Link
                    key={exhibition.id}
                    to={`/galleries/${exhibition.gallery_id || ''}`}
                    className="group border-2 border-black p-4 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                      <span>{exhibition.galleryname || 'Gallery'}</span>
                      {exhibition.city && <span>· {exhibition.city}</span>}
                    </div>
                    <h3 className="text-xl font-black uppercase leading-tight">{exhibition.title || 'Untitled exhibition'}</h3>
                    <p className="font-mono text-xs text-gray-600">
                      {exhibition.datefrom ? new Date(exhibition.datefrom).toLocaleDateString() : 'TBA'} — {exhibition.dateto ? new Date(exhibition.dateto).toLocaleDateString() : 'TBA'}
                    </p>
                    <span className="font-mono text-xs text-art-blue group-hover:underline">View gallery</span>
                  </Link>
                ))}
              </div>
            )}
        </div>
    </div>
  );
};

export default ArtistView;