import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { client } from '../sanity/lib/client';
import { CURATOR_QUERY } from '../sanity/lib/queries';

interface CuratedExhibition {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  startDate?: string | null;
  endDate?: string | null;
  gallery?: {
    name?: string | null;
    city?: string | null;
  } | null;
}

interface CuratorQueryResponse {
  _id: string;
  name?: string | null;
  slug?: { current?: string | null } | null;
  bio?: string | null;
  photo?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
  exhibitions?: CuratedExhibition[] | null;
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return 'Dates TBA';
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const formatter: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  if (startDate && endDate) {
    return `${startDate.toLocaleDateString('en-US', formatter)} – ${endDate.toLocaleDateString('en-US', formatter)}`;
  }
  return (startDate ?? endDate)?.toLocaleDateString('en-US', formatter) ?? 'Dates TBA';
};

const CuratorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [curator, setCurator] = useState<CuratorQueryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurator = async () => {
      if (!id) {
        setError('Missing curator identifier.');
        setLoading(false);
        return;
      }

      try {
        const data = await client.fetch<CuratorQueryResponse>(CURATOR_QUERY, { slug: id });
        setCurator(data ?? null);
        setError(data ? null : 'Curator not found.');
      } catch (fetchError) {
        console.error('❌ Error fetching curator:', fetchError);
        setError('Unable to load this curator right now.');
        setCurator(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurator();
  }, [id]);

  const portrait = curator?.photo?.asset?.url;
  const curatedShows = useMemo(() => curator?.exhibitions ?? [], [curator]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">Loading curator...</p>
      </div>
    );
  }

  if (!curator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">{error ?? 'Curator not found.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-art-paper min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="bg-white border-2 border-black sticky top-24">
              <div className="aspect-square border-b-2 border-black overflow-hidden">
                {portrait ? (
                  <img src={portrait} alt={curator.name ?? 'Curator portrait'} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center font-mono text-xs uppercase">
                    Portrait coming soon
                  </div>
                )}
              </div>
              <div className="p-8">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500">Curator</span>
                <h1 className="text-3xl font-black uppercase mt-2 mb-4">{curator.name ?? 'Curator'}</h1>
                {curator.bio ? (
                  <p className="font-serif italic text-lg leading-relaxed text-gray-800">{curator.bio}</p>
                ) : (
                  <p className="font-mono text-sm text-gray-500">Biography coming soon.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black pb-4">Recent Exhibitions</h2>
            {curatedShows && curatedShows.length > 0 ? (
              <div className="space-y-4">
                {curatedShows.map((show) => {
                  const slug = show.slug?.current ?? show._id;
                  return (
                    <div
                      key={show._id}
                      className="bg-white border-2 border-black p-6 flex flex-col md:flex-row md:items-center gap-4"
                    >
                      <div className="flex-1">
                        <Link
                          to={slug ? `/exhibitions/${slug}` : '#'}
                          className="text-xl font-black uppercase hover:text-art-blue"
                        >
                          {show.title ?? 'Untitled exhibition'}
                        </Link>
                        <p className="font-mono text-xs uppercase text-gray-500 flex items-center gap-2 mt-2">
                          <Calendar className="w-3 h-3" />
                          {formatDateRange(show.startDate, show.endDate)}
                        </p>
                        {show.gallery?.name && (
                          <p className="font-mono text-xs text-gray-600 flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            {show.gallery.name}
                            {show.gallery.city ? ` • ${show.gallery.city}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-xs font-mono uppercase text-gray-500">
                        Curated by {curator.name ?? 'Our team'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-black p-8 font-mono text-sm text-gray-500">
                No exhibitions linked yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratorView;
