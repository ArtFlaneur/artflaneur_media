import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { client } from '../sanity/lib/client';
import { ARTIST_QUERY } from '../sanity/lib/queries';
import { getDisplayDomain } from '../lib/formatters';

type ArtistQueryResponse = {
  _id: string;
  name?: string | null;
  slug?: { current?: string | null } | null;
  bio?: string | null;
  birthYear?: number | null;
  country?: string | null;
  photo?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
  website?: string | null;
  social?: {
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
  } | null;
  exhibitions?: Array<{
    _id: string;
    title?: string | null;
    slug?: { current?: string | null } | null;
    startDate?: string | null;
    endDate?: string | null;
    gallery?: {
      name?: string | null;
      city?: string | null;
    } | null;
  }> | null;
};

const ArtistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistQueryResponse | null>(null);
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
        const artistData = await client.fetch<ArtistQueryResponse>(ARTIST_QUERY, { slug: id });
        setArtist(artistData ?? null);
        setError(artistData ? null : 'Artist not found.');
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching artist:', error);
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

  const heroImage = artist.photo?.asset?.url;
  const exhibitions = Array.isArray(artist.exhibitions) ? artist.exhibitions : [];
  const socialLinks = [
    { label: 'Instagram', href: artist.social?.instagram },
    { label: 'Facebook', href: artist.social?.facebook },
    { label: 'Twitter', href: artist.social?.twitter },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  const websiteLabel = artist.website ? getDisplayDomain(artist.website) ?? artist.website.replace(/^https?:\/\//i, '').replace(/\/$/, '') : null;

  return (
    <div className="bg-white">
        {/* Split Screen Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] border-b-2 border-black">
            <div className="relative border-b-2 md:border-b-0 md:border-r-2 border-black h-[50vh] md:h-auto">
                {heroImage ? (
                  <img src={heroImage} alt={artist.name ?? 'Artist portrait'} className="w-full h-full object-cover grayscale" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center font-mono text-xs uppercase">Portrait coming soon</div>
                )}
                <div className="absolute bottom-0 left-0 bg-white border-t-2 border-r-2 border-black px-6 py-4">
                     <h1 className="text-4xl md:text-6xl font-black uppercase leading-none">{artist.name || 'Untitled Artist'}</h1>
                </div>
            </div>
            <div className="p-12 md:p-24 flex flex-col justify-center bg-art-paper">
                <p className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8">
                    {artist.bio ? `"${artist.bio}"` : 'Biography coming soon.'}
                </p>
                <div className="font-mono text-sm text-gray-600 space-y-2">
                    <p><strong className="text-black">Based in:</strong> {artist.country || 'Location TBD'}</p>
                    {artist.birthYear && (
                      <p><strong className="text-black">Born:</strong> {artist.birthYear}</p>
                    )}
                    {artist.website && websiteLabel && (
                      <p>
                        <strong className="text-black">Website:</strong>{' '}
                        <a href={artist.website} target="_blank" rel="noreferrer" className="underline hover:text-art-blue">{websiteLabel}</a>
                      </p>
                    )}
                </div>
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-8">
                    {socialLinks.map((link) => (
                      <a key={link.label} href={link.href!} target="_blank" rel="noreferrer" className="border border-black px-4 py-2 font-mono text-xs uppercase hover:bg-black hover:text-white transition-colors">
                        {link.label}
                      </a>
                    ))}
                  </div>
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
                    key={exhibition._id}
                    to={`/exhibitions/${exhibition.slug?.current || exhibition._id}`}
                    className="group border-2 border-black p-4 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs uppercase text-gray-500">
                      <span>{exhibition.gallery?.name || 'Gallery'}</span>
                      {exhibition.gallery?.city && <span>· {exhibition.gallery.city}</span>}
                    </div>
                    <h3 className="text-xl font-black uppercase leading-tight">{exhibition.title || 'Untitled exhibition'}</h3>
                    <p className="font-mono text-xs text-gray-600">
                      {exhibition.startDate || 'TBA'} — {exhibition.endDate || 'TBA'}
                    </p>
                    <span className="font-mono text-xs text-art-blue group-hover:underline">View details</span>
                  </Link>
                ))}
              </div>
            )}
        </div>
    </div>
  );
};

export default ArtistView;