import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_GUIDES } from '../constants';
import { MapPin, ArrowDown, Plus } from 'lucide-react';
import { client } from '../sanity/lib/client';
import { GUIDE_QUERY } from '../sanity/lib/queries';

type GuideQueryResponse = {
    _id: string;
    title?: string | null;
    city?: string | null;
    description?: string | null;
    coverImage?: {
        asset?: {
            url?: string | null;
        } | null;
    } | null;
    stops?: Array<{
        _key?: string;
        title?: string | null;
        description?: string | null;
        location?: {
            lat?: number | null;
            lng?: number | null;
        } | null;
        gallery?: {
            _id: string;
            name?: string | null;
            address?: string | null;
        } | null;
        }> | null;
    };

    type GuideStop = NonNullable<GuideQueryResponse['stops']>[number];

const GuideView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState(MOCK_GUIDES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) return;
      
      try {
                const guideData = await client.fetch<GuideQueryResponse>(GUIDE_QUERY, {slug: id});
        
        if (guideData) {
                    const stops: GuideStop[] = Array.isArray(guideData.stops) ? guideData.stops : [];
          setGuide({
            id: guideData._id,
                        title: guideData.title || 'Untitled Guide',
                        city: guideData.city || 'City',
                        subtitle: guideData.description || '',
                        image: guideData.coverImage?.asset?.url || MOCK_GUIDES[0].image,
            type: guideData.city ? 'Guide' as any : 'Guide' as any,
                        steps: stops.map((stop: GuideStop, index: number) => ({
                            id: stop._key || `stop-${index}`,
                            title: stop.title || `Stop ${index + 1}`,
                            description: stop.description || 'Details coming soon.',
                            location: stop.gallery?.address || guideData.city || 'City',
                            image: `https://picsum.photos/seed/${stop._key ?? index + 40}/800/600`
                        })),
            author: { id: '1', name: 'Art Curator', role: 'Guide Creator', image: '' }
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching guide:', error);
        setLoading(false);
      }
    };
    
    fetchGuide();
  }, [id]);

  return (
    <div className="bg-white">
        {/* Hero */}
        <div className="border-b-2 border-black bg-art-yellow p-8 md:p-16 flex flex-col items-center text-center">
            <span className="bg-black text-white px-3 py-1 font-mono text-xs uppercase mb-6">Weekend Guide</span>
            <h1 className="text-4xl md:text-7xl font-black uppercase mb-6 max-w-4xl">{guide.title}</h1>
            <div className="font-serif italic text-xl">Curated by {guide.author?.name}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
            {/* List / Steps */}
            <div className="lg:col-span-7 p-8 md:p-12">
                <div className="relative border-l-2 border-black ml-4 md:ml-8 space-y-16">
                    {guide.steps.map((step, index) => (
                        <div key={step.id} className="relative pl-12">
                            {/* Number Bubble */}
                            <div className="absolute -left-[17px] top-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold font-mono border-2 border-white ring-2 ring-black">
                                {index + 1}
                            </div>
                            
                            <div className="border-2 border-black bg-white p-0 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                <div className="aspect-video relative overflow-hidden border-b-2 border-black">
                                    <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-black uppercase mb-2">{step.title}</h3>
                                    <p className="text-sm font-mono text-gray-500 mb-4 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> {step.location}
                                    </p>
                                    <p className="text-gray-800 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                            
                            {index < guide.steps.length - 1 && (
                                <div className="absolute left-6 bottom-[-40px] text-black">
                                    <ArrowDown className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    ))}
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