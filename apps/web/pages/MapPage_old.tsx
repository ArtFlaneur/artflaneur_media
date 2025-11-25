import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_POINTS } from '../constants';
import { MapPin, Navigation, Clock, Globe, X } from 'lucide-react';
import { directusClient, DirectusGallery } from '../lib/directus';

interface MapPoint {
    id: number;
    name: string;
    lat: number;
    lng: number;
    type: 'Gallery' | 'Museum' | 'Event';
    address?: string;
    city?: string;
    country?: string;
    website?: string;
    opening_hours?: string;
}

const MapPage: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
    const [galleries, setGalleries] = useState<MapPoint[]>(MAP_POINTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'Gallery' | 'Museum' | 'Event'>('all');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('🔍 Fetching galleries from Directus...');
                console.log('📍 Directus URL:', import.meta.env.VITE_DIRECTUS_URL);
                
                const galleriesData = await directusClient.getGalleriesForMap();
                console.log('📦 Galleries from Directus:', galleriesData.length, 'galleries');
                
                if (galleriesData && galleriesData.length > 0) {
                    const mappedGalleries: MapPoint[] = galleriesData.map((gallery) => ({
                        id: gallery.id,
                        name: gallery.galleryname,
                        // Конвертируем координаты: lat/lon уже в процентах от -90 до 90 / -180 до 180
                        // Нормализуем в проценты для отображения на карте (0-100%)
                        lat: ((gallery.lat || 0) + 90) / 180 * 100,
                        lng: ((gallery.lon || 0) + 180) / 360 * 100,
                        type: 'Gallery' as const,
                        address: gallery.fulladdress,
                        city: gallery.city,
                        country: gallery.country,
                        website: gallery.placeurl,
                        opening_hours: gallery.openinghours,
                    }));
                    console.log('✅ Mapped galleries:', mappedGalleries.length);
                    setGalleries(mappedGalleries);
                } else {
                    console.log('⚠️ No galleries found, using mock data');
                    setGalleries(MAP_POINTS);
                }
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching galleries from Directus:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to load galleries: ${errorMessage}`);
                setGalleries(MAP_POINTS);
                setLoading(false);
            }
        };
        
        fetchGalleries();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            // Reload all galleries
            const galleriesData = await directusClient.getGalleriesForMap();
            const mappedGalleries: MapPoint[] = galleriesData.map((gallery) => ({
                id: gallery.id,
                name: gallery.galleryname,
                lat: ((gallery.lat || 0) + 90) / 180 * 100,
                lng: ((gallery.lon || 0) + 180) / 360 * 100,
                type: 'Gallery' as const,
                address: gallery.fulladdress,
                city: gallery.city,
                country: gallery.country,
                website: gallery.placeurl,
                opening_hours: gallery.openinghours,
            }));
            setGalleries(mappedGalleries);
            return;
        }

        try {
            const results = await directusClient.searchGalleries(searchQuery);
            const mappedResults: MapPoint[] = results
                .filter(g => g.lat && g.lon)
                .map((gallery) => ({
                    id: gallery.id,
                    name: gallery.galleryname,
                    lat: ((gallery.lat || 0) + 90) / 180 * 100,
                    lng: ((gallery.lon || 0) + 180) / 360 * 100,
                    type: 'Gallery' as const,
                    address: gallery.fulladdress,
                    city: gallery.city,
                    country: gallery.country,
                    website: gallery.placeurl,
                    opening_hours: gallery.openinghours,
                }));
            setGalleries(mappedResults);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const filteredGalleries = filterType === 'all' 
        ? galleries 
        : galleries.filter(g => g.type === filterType);

    const selectedGallery = selectedPoint 
        ? galleries.find(g => g.id === selectedPoint) 
        : null;

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
                    <form onSubmit={handleSearch} className="relative">
                        <input 
                            type="text" 
                            placeholder="Search galleries, cities..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border-b border-gray-300 pb-2 focus:outline-none focus:border-black font-serif" 
                        />
                    </form>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                        <button 
                            onClick={() => setFilterType('all')}
                            className={`whitespace-nowrap px-3 py-1 text-xs uppercase font-bold rounded-full ${filterType === 'all' ? 'bg-black text-white' : 'border border-gray-300 hover:border-black'}`}
                        >
                            All ({galleries.length})
                        </button>
                        <button 
                            onClick={() => setFilterType('Gallery')}
                            className={`whitespace-nowrap px-3 py-1 text-xs uppercase font-bold rounded-full ${filterType === 'Gallery' ? 'bg-black text-white' : 'border border-gray-300 hover:border-black'}`}
                        >
                            Galleries ({galleries.filter(g => g.type === 'Gallery').length})
                        </button>
                        <button 
                            onClick={() => setFilterType('Museum')}
                            className={`whitespace-nowrap px-3 py-1 text-xs uppercase font-bold rounded-full ${filterType === 'Museum' ? 'bg-black text-white' : 'border border-gray-300 hover:border-black'}`}
                        >
                            Museums ({galleries.filter(g => g.type === 'Museum').length})
                        </button>
                        <button 
                            onClick={() => setFilterType('Event')}
                            className={`whitespace-nowrap px-3 py-1 text-xs uppercase font-bold rounded-full ${filterType === 'Event' ? 'bg-black text-white' : 'border border-gray-300 hover:border-black'}`}
                        >
                            Events ({galleries.filter(g => g.type === 'Event').length})
                        </button>
                    </div>
                    {loading && <p className="text-xs text-gray-500 mt-2">Loading galleries...</p>}
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>

                {/* Markers */}
                {filteredGalleries.map((point) => (
                    <button 
                        key={point.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${selectedPoint === point.id ? 'z-20 scale-125' : 'z-10'}`}
                        style={{ top: `${point.lat}%`, left: `${point.lng}%` }}
                        onClick={() => setSelectedPoint(point.id)}
                    >
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${point.type === 'Event' ? 'bg-art-red text-white' : 'bg-black text-white'}`}>
                            <MapPin className="w-5 h-5" />
                        </div>
                    </button>
                ))}

                {/* Selected Point Card */}
                {selectedPoint && selectedGallery && (
                    <div className="absolute bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white p-0 shadow-2xl animate-in slide-in-from-bottom-5 z-30">
                        <div className="h-32 bg-gray-100 relative">
                             <img src={`https://picsum.photos/400/200?random=${selectedPoint}`} className="w-full h-full object-cover" alt={selectedGallery.name} />
                             <button className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white" onClick={() => setSelectedPoint(null)}>✕</button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-serif text-xl font-medium mb-1">{selectedGallery.name}</h3>
                            <p className="text-xs font-bold uppercase text-gray-400 mb-4">{selectedGallery.type}</p>
                            
                            <div className="text-sm text-gray-600 space-y-2 mb-6">
                                {selectedGallery.address && (
                                    <p className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{selectedGallery.address}, {selectedGallery.city}, {selectedGallery.country}</span>
                                    </p>
                                )}
                                {selectedGallery.opening_hours && (
                                    <p className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span className="whitespace-pre-line">{selectedGallery.opening_hours}</span>
                                    </p>
                                )}
                                {selectedGallery.website && (
                                    <p className="flex items-start gap-2">
                                        <Globe className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <a href={selectedGallery.website} target="_blank" rel="noopener noreferrer" className="text-art-blue hover:underline">
                                            Visit Website
                                        </a>
                                    </p>
                                )}
                            </div>

                            <button className="w-full bg-black text-white py-3 flex items-center justify-center gap-2 font-bold uppercase text-xs hover:bg-art-blue transition-colors">
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