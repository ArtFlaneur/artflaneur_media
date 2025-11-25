import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, ArrowDown, Plus } from 'lucide-react';
import { client } from '../sanity/lib/client';
import { GUIDE_QUERY } from '../sanity/lib/queries';

type GuideQueryResponse = {
    _id: string;
    title?: string | null;
    city?: string | null;
    description?: string | null;
    ctaText?: string | null;
    sponsorshipStatus?: 'notSponsored' | 'sponsored' | null;
    sponsor?: {
        _id: string;
        name?: string | null;
        logo?: {
            asset?: {
                url?: string | null;
            } | null;
        } | null;
    } | null;
    sponsorBadgeSettings?: {
        template?: string | null;
        placement?: string | null;
    } | null;
    coverImage?: {
        asset?: {
            url?: string | null;
        } | null;
        alt?: string | null;
    } | null;
    stops?: Array<{
        _key?: string;
        title?: string | null;
        summary?: string | null;
        address?: string | null;
        notes?: string | null;
        location?: {
            lat?: number | null;
            lng?: number | null;
        } | null;
        gallery?: {
            _id: string;
            name?: string | null;
            address?: string | null;
        } | null;
        exhibition?: {
            _id: string;
            title?: string | null;
            slug?: string | null;
        } | null;
        image?: {
            asset?: {
                url?: string | null;
            } | null;
            alt?: string | null;
        } | null;
    }> | null;
};

type GuideStop = NonNullable<GuideQueryResponse['stops']>[number];

const GuideView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [guide, setGuide] = useState<GuideQueryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuide = async () => {
            if (!id) {
                setError('Missing guide identifier.');
                setLoading(false);
                return;
            }
      
      try {
                const guideData = await client.fetch<GuideQueryResponse>(GUIDE_QUERY, {slug: id});
                setGuide(guideData ?? null);
                setError(guideData ? null : 'Guide not found.');
                setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching guide:', error);
                setError('Unable to load this guide right now.');
        setLoading(false);
      }
    };
    
    fetchGuide();
  }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="font-mono text-lg">Loading guide...</p>
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
                <p className="font-mono text-lg mb-4">{error || 'Guide unavailable'}</p>
                <p className="text-sm text-gray-500">Please try another trail while we refresh this one.</p>
            </div>
        );
    }

            const stops: GuideStop[] = Array.isArray(guide.stops) ? guide.stops : [];
            const coverImageUrl = guide.coverImage?.asset?.url;
            const isSponsored = guide.sponsorshipStatus === 'sponsored';
            const sponsorLogoUrl = guide.sponsor?.logo?.asset?.url;

  return (
    <div className="bg-white">
        {/* Hero */}
        <div className="border-b-2 border-black bg-art-yellow p-8 md:p-16 flex flex-col items-center text-center">
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <span className="bg-black text-white px-3 py-1 font-mono text-xs uppercase">Weekend Guide</span>
                            {isSponsored && (
                                <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 font-mono text-[10px] uppercase">
                                    <span>Sponsored by</span>
                                    {sponsorLogoUrl ? (
                                        <img src={sponsorLogoUrl} alt={guide.sponsor?.name ?? 'Sponsor logo'} className="h-4 object-contain" />
                                    ) : (
                                        <span>{guide.sponsor?.name}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black uppercase mb-6 max-w-4xl">{guide.title || 'Untitled guide'}</h1>
                        <div className="font-serif italic text-xl">
                            {guide.city ? `Explore ${guide.city}` : 'Curated art trail'}
                        </div>
                        {guide.description && (
                            <p className="mt-6 max-w-2xl font-mono text-sm text-gray-700">
                                {guide.description}
                            </p>
                        )}
                        {guide.ctaText && (
                            <button className="mt-6 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest border-2 border-black hover:bg-art-blue transition-colors">
                                {guide.ctaText}
                            </button>
                        )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
            {/* List / Steps */}
            <div className="lg:col-span-7 p-8 md:p-12">
                <div className="relative border-l-2 border-black ml-4 md:ml-8 space-y-16">
                                        {stops.length === 0 && (
                                            <div className="pl-12">
                                                <p className="font-mono text-sm text-gray-500">Stops coming soon.</p>
                                            </div>
                                        )}
                                        {stops.map((step, index) => {
                                            const stopImage = step.image?.asset?.url ?? coverImageUrl;
                                            const stopImageAlt = step.image?.alt ?? step.title ?? 'Guide stop visual';
                                            return (
                                            <div key={step._key || `stop-${index}`} className="relative pl-12">
                            {/* Number Bubble */}
                            <div className="absolute -left-[17px] top-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold font-mono border-2 border-white ring-2 ring-black">
                                {index + 1}
                            </div>
                            
                                <div className="border-2 border-black bg-white p-0 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                                {stopImage ? (
                                                                    <div className="aspect-square relative overflow-hidden border-b-2 border-black">
                                                    <img src={stopImage} alt={stopImageAlt} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="aspect-square border-b-2 border-black bg-gray-100 flex items-center justify-center text-xs font-mono tracking-wide text-gray-500">
                                                                        Visual coming soon
                                                                    </div>
                                                                )}
                                <div className="p-6">
                                                                        <h3 className="text-2xl font-black uppercase mb-2">{step.title || `Stop ${index + 1}`}</h3>
                                    <p className="text-sm font-mono text-gray-500 mb-4 flex items-center gap-2">
                                                                            <MapPin className="w-3 h-3" /> {step.address || step.gallery?.address || guide.city || 'Location TBD'}
                                    </p>
                                                                        <p className="text-gray-800 leading-relaxed">{step.summary || step.notes || 'Details coming soon.'}</p>
                                                                        {(step.exhibition?.title || step.gallery?.name) && (
                                                                            <p className="mt-4 text-xs font-mono uppercase tracking-wide text-gray-500">
                                                                                {[step.exhibition?.title, step.gallery?.name].filter(Boolean).join(' • ')}
                                                                            </p>
                                                                        )}
                                </div>
                            </div>
                            
                                                        {index < stops.length - 1 && (
                                <div className="absolute left-6 bottom-[-40px] text-black">
                                    <ArrowDown className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    )})}
                </div>
            </div>

            {/* Map (Sticky Sidebar) */}
            <div className="lg:col-span-5 border-l-2 border-black relative bg-gray-100 hidden lg:block">
                 <div className="sticky top-20 h-[calc(100vh-80px)] w-full">
                     {/* Placeholder for Map Integration */}
                     <div className="absolute inset-0 bg-gray-200">
                        <div className="w-full h-full opacity-30" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-white border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold">Interactive Map Component</span>
                        </div>
                        {/* Fake Pins */}
                        <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-art-red rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">1</div>
                        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-black rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">2</div>
                     </div>
                     
                     <div className="absolute bottom-8 left-8 right-8 bg-white border-2 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                         <div className="flex justify-between items-center">
                             <div>
                                <h4 className="font-bold uppercase text-sm">Save this trail</h4>
                                <p className="text-xs font-mono text-gray-500">Download for offline access</p>
                             </div>
                             <button className="bg-black text-white p-2 hover:bg-art-blue transition-colors">
                                 <Plus className="w-4 h-4" />
                             </button>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default GuideView;