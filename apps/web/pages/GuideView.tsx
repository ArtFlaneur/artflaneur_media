import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowDown, Plus } from 'lucide-react';
import { fetchGalleryById, type GraphqlGallery } from '../lib/graphql';
import { client } from '../sanity/lib/client';
import { GUIDE_QUERY } from '../sanity/lib/queries';
import type { GUIDE_QUERYResult, ExternalGalleryReference } from '../sanity/types';
import PortableTextRenderer from '../components/PortableTextRenderer';
import SecureImage from '../components/SecureImage';
 
type SanityGuideStop = NonNullable<NonNullable<GUIDE_QUERYResult['stops']>[number]>;
type RawGuideStop = Omit<SanityGuideStop, 'externalGallery'> & {
    externalGallery: ExternalGalleryReference | null;
};
type GuideStop = RawGuideStop & { resolvedExternalGallery?: GraphqlGallery | null };
type GuideDocument = Omit<GUIDE_QUERYResult, 'stops'> & { stops?: GuideStop[] | null };

const GuideView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
        const [guide, setGuide] = useState<GuideDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hydrateStops = React.useCallback(async (stops: RawGuideStop[] = []): Promise<GuideStop[]> => {
        const graphqlIds = stops
            .map((stop) => stop?.externalGallery?.id)
            .filter((value): value is string => Boolean(value));
        const uniqueIds = Array.from(new Set(graphqlIds));

        if (!uniqueIds.length) {
            return stops as GuideStop[];
        }

        const pairs = await Promise.all(
            uniqueIds.map(async (galleryId) => {
                try {
                    const gallery = await fetchGalleryById(galleryId);
                    return gallery ? ([galleryId, gallery] as const) : null;
                } catch (err) {
                    console.error('Failed to fetch gallery for guide stop', galleryId, err);
                    return null;
                }
            }),
        );

        const galleryMap = new Map<string, GraphqlGallery>();
        pairs.forEach((pair) => {
            if (pair) {
                galleryMap.set(pair[0], pair[1]);
            }
        });

        return stops.map((stop) => ({
            ...stop,
            resolvedExternalGallery: stop?.externalGallery?.id
                ? galleryMap.get(stop.externalGallery.id) ?? null
                : null,
        }));
    }, []);

  useEffect(() => {
        let isMounted = true;
    const fetchGuide = async () => {
            if (!id) {
                setError('Missing guide identifier.');
                setLoading(false);
                return;
            }
      
      try {
                                const guideData = await client.fetch<GUIDE_QUERYResult | null>(GUIDE_QUERY, {slug: id});
                                if (!isMounted) return;

                                if (!guideData) {
                                    setGuide(null);
                                    setError('Guide not found.');
                                    setLoading(false);
                                    return;
                                }

                                const stops = Array.isArray(guideData.stops) ? guideData.stops.filter(Boolean) : [];
                                const enrichedStops = await hydrateStops(stops as RawGuideStop[]);
                                if (!isMounted) return;

                                setGuide({...guideData, stops: enrichedStops});
                                setError(null);
                                setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching guide:', error);
                setError('Unable to load this guide right now.');
        setLoading(false);
      }
    };
    
    fetchGuide();
        return () => {
            isMounted = false;
        };
    }, [hydrateStops, id]);

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
            const appScreenshotUrl = guide.appScreenshot?.asset?.url;
            const isSponsored = Boolean(guide.sponsorship?.enabled);
            const sponsorLogoUrl = guide.sponsorship?.sponsor?.logo?.asset?.url;

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
                                        <img src={sponsorLogoUrl} alt={guide.sponsorship?.sponsor?.name ?? 'Sponsor logo'} className="h-4 object-contain" />
                                    ) : (
                                        <span>{guide.sponsorship?.sponsor?.name}</span>
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
                            <a 
                                href="https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-6 bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest border-2 border-black hover:bg-art-blue transition-colors inline-block"
                            >
                                {guide.ctaText}
                            </a>
                        )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
            {/* List / Steps */}
            <div className="lg:col-span-7 p-6 md:p-8">
                {/* Mobile App Promotion */}
                <div className="lg:hidden mb-8 flex flex-col items-center bg-white border-2 border-black p-6">
                    {/* Device Frame + Screenshot */}
                    <div className="relative mb-6">
                        {/* Phone Frame */}
                        <div className="relative w-[200px] h-[400px] bg-black rounded-[2.5rem] p-2.5 shadow-2xl">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-10"></div>
                            {/* Screen */}
                            <div className="relative w-full h-full bg-white rounded-[2rem] overflow-hidden">
                                {appScreenshotUrl ? (
                                    <img 
                                        src={appScreenshotUrl} 
                                        alt={guide.appScreenshot?.alt || 'App map preview'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <MapPin className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -top-3 -right-3 bg-art-red text-white px-2.5 py-1.5 rounded-full border-4 border-white shadow-lg">
                            <p className="font-mono text-[10px] uppercase tracking-wider">{stops.length} Stops</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="w-full max-w-sm space-y-3">
                        <h3 className="text-xl font-black uppercase text-center">Navigate with the App</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white border-2 border-black p-2 rounded">
                                <MapPin className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-[10px] font-mono uppercase">Live Map</p>
                            </div>
                            <div className="bg-white border-2 border-black p-2 rounded">
                                <Plus className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-[10px] font-mono uppercase">Save</p>
                            </div>
                            <div className="bg-white border-2 border-black p-2 rounded">
                                <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-[10px] font-mono uppercase">Offline</p>
                            </div>
                        </div>
                        <a 
                            href="https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full bg-art-blue text-white py-3 px-6 font-mono text-xs uppercase tracking-widest text-center hover:bg-black transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Download Free App
                        </a>
                    </div>
                </div>

                {guide.body && guide.body.length > 0 && (
                    <div className="mb-8 prose prose-sm max-w-none">
                        <PortableTextRenderer value={guide.body} />
                    </div>
                )}
                <div className="relative border-l-2 border-black ml-4 md:ml-6 space-y-8">
                                        {stops.length === 0 && (
                                            <div className="pl-8">
                                                <p className="font-mono text-sm text-gray-500">Stops coming soon.</p>
                                            </div>
                                        )}
                                        {stops.map((step, index) => {
                                                                                        const stopImage = step.resolvedExternalGallery?.gallery_img_url ?? coverImageUrl ?? null;
                                                                                        const galleryName =
                                                                                            step.resolvedExternalGallery?.galleryname ??
                                                                                            step.externalGallery?.name ??
                                                                                            null;
                                                                                        const stopTitle = step.title || galleryName || `Stop ${index + 1}`;
                                                                                        const stopImageAlt = stopTitle;
                                                                                        const galleryAddress =
                                                                                            step.resolvedExternalGallery?.fulladdress ??
                                                                                            step.externalGallery?.address ??
                                                                                            guide.city ??
                                                                                            'Location TBD';
                                                                                        const galleryId = step.resolvedExternalGallery?.id ?? step.externalGallery?.id ?? null;
                                                                                        const galleryLink = galleryId ? `/galleries/${galleryId}` : null;
                                                                                        const openingHours = step.resolvedExternalGallery?.openinghours ?? null;
                                                                                        const curatorQuote = step.curatorQuote ?? null;
                                            return (
                                            <div key={step._key || `stop-${index}`} className="relative pl-8">
                            {/* Number Bubble */}
                            <div className="absolute -left-[13px] top-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold font-mono border-2 border-white ring-2 ring-black">
                                {index + 1}
                            </div>
                            
                                {galleryLink ? (
                                    <Link to={galleryLink} className="group flex gap-3 border-2 border-black bg-white p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                                                {stopImage ? (
                                                                    <div className="w-24 h-24 flex-shrink-0 border-2 border-black overflow-hidden">
                                                    <SecureImage src={stopImage} alt={stopImageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center">
                                                                        <MapPin className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                <div className="flex-1 min-w-0">
                                                                        <h3 className="text-base font-black uppercase mb-1 truncate group-hover:text-art-blue transition-colors">{stopTitle}</h3>
                                                                                                {galleryName && step.title && (
                                                                                                    <p className="text-xs font-mono uppercase tracking-wide text-gray-600 mb-1">
                                                                                                        {galleryName}
                                                                                                    </p>
                                                                                                )}
                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{galleryAddress}</span>
                                    </p>
                                                                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{step.summary || step.notes || 'Details coming soon.'}</p>
                                                                        {curatorQuote && (
                                                                            <p className="text-xs italic text-gray-600 border-l-2 border-art-yellow pl-2 mt-2">
                                                                                "{curatorQuote}"
                                                                            </p>
                                                                        )}
                                </div>
                                    </Link>
                                ) : (
                                    <div className="flex gap-3 border-2 border-black bg-white p-3">
                                                {stopImage ? (
                                                                    <div className="w-24 h-24 flex-shrink-0 border-2 border-black overflow-hidden">
                                                    <SecureImage src={stopImage} alt={stopImageAlt} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center">
                                                                        <MapPin className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                <div className="flex-1 min-w-0">
                                                                        <h3 className="text-base font-black uppercase mb-1 truncate">{stopTitle}</h3>
                                                                                                {galleryName && step.title && (
                                                                                                    <p className="text-xs font-mono uppercase tracking-wide text-gray-600 mb-1">
                                                                                                        {galleryName}
                                                                                                    </p>
                                                                                                )}
                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{galleryAddress}</span>
                                    </p>
                                                                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{step.summary || step.notes || 'Details coming soon.'}</p>
                                                                        {curatorQuote && (
                                                                            <p className="text-xs italic text-gray-600 border-l-2 border-art-yellow pl-2 mt-2">
                                                                                "{curatorQuote}"
                                                                            </p>
                                                                        )}
                                </div>
                                    </div>
                                )}
                            
                                                        {index < stops.length - 1 && (
                                <>
                                    <div className="absolute -left-[5px] bottom-[-24px] w-2 h-2 border-r-2 border-b-2 border-black transform rotate-45"></div>
                                </>
                            )}
                        </div>
                    )})}
                </div>
            </div>

            {/* App Promotion Sidebar */}
            <div className="lg:col-span-5 border-l-2 border-black relative bg-white hidden lg:block">
                 <div className="sticky top-20 h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-8">
                     {/* Device Frame + Screenshot */}
                     <div className="relative mb-8">
                        {/* Phone Frame */}
                        <div className="relative w-[220px] h-[440px] bg-black rounded-[2.5rem] p-2.5 shadow-2xl">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10"></div>
                            {/* Screen */}
                            <div className="relative w-full h-full bg-white rounded-[2rem] overflow-hidden">
                                {appScreenshotUrl ? (
                                    <img 
                                        src={appScreenshotUrl} 
                                        alt={guide.appScreenshot?.alt || 'App map preview'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <MapPin className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -top-3 -right-3 bg-art-red text-white px-2.5 py-1.5 rounded-full border-4 border-white shadow-lg">
                            <p className="font-mono text-[10px] uppercase tracking-wider">{stops.length} Stops</p>
                        </div>
                     </div>

                     {/* CTA Section */}
                     <div className="w-full max-w-sm space-y-4">
                        <h3 className="text-2xl font-black uppercase text-center">Navigate with the App</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white border-2 border-black p-2 rounded">
                                <MapPin className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-[10px] font-mono uppercase">Live Map</p>
                            </div>
                            <div className="bg-white border-2 border-black p-2 rounded">
                                <Plus className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-[10px] font-mono uppercase">Save</p>
                            </div>
                            <div className="bg-white border-2 border-black p-2 rounded">
                                <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-[10px] font-mono uppercase">Offline</p>
                            </div>
                        </div>
                        <a 
                            href="https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full bg-art-blue text-white py-4 px-6 font-mono text-sm uppercase tracking-widest text-center hover:bg-black transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Download Art Flaneur App
                        </a>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default GuideView;