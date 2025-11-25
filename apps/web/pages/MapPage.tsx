import React, { useState, useEffect } from 'react';
import { MAP_POINTS } from '../constants';
import { MapPin, Navigation } from 'lucide-react';
import { client } from '../sanity/lib/client';
import { GALLERIES_QUERY } from '../sanity/lib/queries';

const MapPage: React.FC = () => {
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
    const [galleries, setGalleries] = useState(MAP_POINTS);

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                console.log('🔍 Fetching galleries for map...');
                const galleriesData = await client.fetch(GALLERIES_QUERY);
                console.log('📦 Galleries data:', galleriesData);
                
                if (galleriesData && galleriesData.length > 0) {
                    const mappedGalleries = galleriesData.map((gallery: any, index: number) => ({
                        id: index + 1,
                        name: gallery.name,
                        lat: gallery.location?.lat || (30 + Math.random() * 40),
                        lng: gallery.location?.lng || (30 + Math.random() * 40),
                        type: 'Gallery' as const
                    }));
                    setGalleries(mappedGalleries);
                } else {
                    setGalleries(MAP_POINTS);
                }
            } catch (error) {
                console.error('❌ Error fetching galleries:', error);
                setGalleries(MAP_POINTS);
            }
        };
        
        fetchGalleries();
    }, []);

    // Simulated "Interactive" Map UI without external library dependencies for demo stability
    return (
        <div className="pt-20 h-screen flex flex-col">
            <div className="flex-1 relative bg-gray-200 overflow-hidden group">
                {/* Simulated Map Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(#999 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>
                
                {/* Simulated Map Blocks (Abstract City) */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-300 rotate-12"></div>
                <div className="absolute top-1/3 right-1/4 w-48 h-64 bg-gray-300 -rotate-6"></div>
                <div className="absolute bottom-1/4 left-1/3 w-64 h-32 bg-gray-300 rotate-3"></div>
                
                {/* Map Interface Overlay */}
                <div className="absolute top-4 left-4 right-4 md:left-8 md:w-96 bg-white p-4 shadow-xl rounded-sm z-10">
                    <div className="relative">
                        <input type="text" placeholder="Search galleries, artists..." className="w-full border-b border-gray-300 pb-2 focus:outline-none focus:border-black font-serif" />
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                        <button className="whitespace-nowrap px-3 py-1 bg-black text-white text-xs uppercase font-bold rounded-full">All</button>
                        <button className="whitespace-nowrap px-3 py-1 border border-gray-300 hover:border-black text-xs uppercase font-bold rounded-full">Galleries</button>
                        <button className="whitespace-nowrap px-3 py-1 border border-gray-300 hover:border-black text-xs uppercase font-bold rounded-full">Museums</button>
                        <button className="whitespace-nowrap px-3 py-1 border border-gray-300 hover:border-black text-xs uppercase font-bold rounded-full">Events</button>
                    </div>
                </div>

                {/* Markers */}
                {galleries.map((point) => (
                    <button 
                        key={point.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${selectedPoint === point.id ? 'z-20 scale-125' : 'z-10'}`}
                        style={{ top: `${point.lat}%`, left: `${point.lng}%` }}
                        onClick={() => setSelectedPoint(point.id)}
                    >
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${point.type === 'Event' ? 'bg-art-accent text-white' : 'bg-black text-white'}`}>
                            <MapPin className="w-5 h-5" />
                        </div>
                    </button>
                ))}

                {/* Selected Point Card */}
                {selectedPoint && (
                    <div className="absolute bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white p-0 shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="h-32 bg-gray-100 relative">
                             <img src={`https://picsum.photos/400/200?random=${selectedPoint}`} className="w-full h-full object-cover" />
                             <button className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white" onClick={() => setSelectedPoint(null)}>✕</button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-serif text-xl font-medium mb-1">{MAP_POINTS.find(p => p.id === selectedPoint)?.name}</h3>
                            <p className="text-xs font-bold uppercase text-gray-400 mb-4">{MAP_POINTS.find(p => p.id === selectedPoint)?.type}</p>
                            
                            <div className="text-sm text-gray-600 space-y-1 mb-6">
                                <p>Open today: 10:00 - 18:00</p>
                                <p>Free Entry</p>
                            </div>

                            <button className="w-full bg-black text-white py-3 flex items-center justify-center gap-2 font-bold uppercase text-xs hover:bg-art-accent transition-colors">
                                <Navigation className="w-4 h-4" /> Navigate in App
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;