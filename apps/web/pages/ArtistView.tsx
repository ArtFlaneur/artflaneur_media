import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchArtistById, fetchExhibitionsForArtist, GraphqlArtist, GraphqlExhibition } from '../lib/graphql';

/**
 * Extract artist ID from URL slug.
 * Slug format: "artist-name-uuid" where UUID is 36 chars at the end.
 */
const extractArtistIdFromSlug = (slug: string): string => {
  // UUID format: 8-4-4-4-12 = 36 characters
  const uuidLength = 36;
  if (slug.length > uuidLength) {
    // Extract the last 36 characters as the ID
    return slug.slice(-uuidLength);
  }
  // Fallback: assume the entire slug is the ID
  return slug;
};

const ArtistView: React.FC = () => {
  const { id: slugParam } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<GraphqlArtist | null>(null);
  const [exhibitions, setExhibitions] = useState<GraphqlExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!slugParam) {
        setError('Missing artist identifier.');
        setLoading(false);
        return;
      }
      
      // Extract actual ID from slug (e.g., "yayoi-kusama-0ef8ae4d-..." -> "0ef8ae4d-...")
      const id = extractArtistIdFromSlug(slugParam);
      
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
  }, [slugParam]);

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
        {/* Hero Header */}
        <div className="border-b-2 border-black bg-art-paper">
            <div className="container mx-auto px-4 md:px-6 py-24">
                <h1 className="text-5xl md:text-8xl font-black uppercase leading-none mb-6">{artist.name || 'Untitled Artist'}</h1>
                <div className="font-mono text-sm text-gray-600 flex flex-wrap gap-4 mb-8">
                    {artist.country && (
                      <span className="border-2 border-black px-3 py-1 bg-white">{artist.country}</span>
                    )}
                    {lifespan && (
                      <span className="border-2 border-black px-3 py-1 bg-white">{lifespan}</span>
                    )}
                    {artist.wikipedia_url && (
                      <a href={artist.wikipedia_url} target="_blank" rel="noreferrer" className="border-2 border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors">
                        Wikipedia →
                      </a>
                    )}
                </div>
                {artist.description && (
                  <p className="text-lg md:text-xl leading-relaxed max-w-3xl text-gray-700">
                    {artist.description}
                  </p>
                )}
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