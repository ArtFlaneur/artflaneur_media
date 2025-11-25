import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Clock, Globe, X, Locate } from 'lucide-react';
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
    image?: string;
}

const MapPage: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);
    
    const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
    const [galleries, setGalleries] = useState<MapPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'Gallery' | 'Museum' | 'Event'>('all');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [currentRadius, setCurrentRadius] = useState(10); // км
    const loadedAreas = useRef<Set<string>>(new Set()); // Отслеживаем загруженные области

    // Инициализация карты
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Создаем карту с вашим кастомным стилем
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors'
                    }
                },
                layers: [
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm',
                        minzoom: 0,
                        maxzoom: 19
                    }
                ]
            },
            center: [0, 20], // Временная позиция до получения геолокации
            zoom: 2,
            attributionControl: false
        });

        // Добавляем контролы
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        // Событие завершения загрузки карты
        map.current.on('load', () => {
            setMapReady(true);
            console.log('🗺️ Map ready');
        });

        // Подгрузка галерей при перемещении карты
        map.current.on('moveend', handleMapMove);

        return () => {
            map.current?.off('moveend', handleMapMove);
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Получение геолокации пользователя и начальная загрузка
    useEffect(() => {
        if (!mapReady) return;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    
                    // Центрируем карту на пользователе
                    if (map.current) {
                        map.current.flyTo({
                            center: [longitude, latitude],
                            zoom: 12,
                            duration: 2000
                        });
                    }

                    // Загружаем галереи в радиусе 50 км для начала
                    await loadGalleriesInRadius(latitude, longitude, 50);
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    // Если геолокация не доступна, загружаем дефолтную локацию (например, Париж)
                    const defaultLat = 48.8566;
                    const defaultLng = 2.3522;
                    setUserLocation([defaultLng, defaultLat]);
                    
                    if (map.current) {
                        map.current.flyTo({
                            center: [defaultLng, defaultLat],
                            zoom: 12,
                            duration: 2000
                        });
                    }
                    
                    loadGalleriesInRadius(defaultLat, defaultLng, 50);
                }
            );
        } else {
            // Браузер не поддерживает геолокацию - используем дефолтную локацию
            const defaultLat = 48.8566;
            const defaultLng = 2.3522;
            setUserLocation([defaultLng, defaultLat]);
            
            if (map.current) {
                map.current.flyTo({
                    center: [defaultLng, defaultLat],
                    zoom: 12,
                    duration: 2000
                });
            }
            
            loadGalleriesInRadius(defaultLat, defaultLng, 50);
        }
    }, [mapReady]);

    // Функция загрузки галерей в радиусе
    const loadGalleriesInRadius = async (lat: number, lng: number, radiusKm: number) => {
        try {
            setLoading(true);
            setError(null);
            console.log(`🔍 Loading galleries in ${radiusKm}km radius from (${lat}, ${lng})...`);
            
            const galleriesData = await directusClient.getGalleriesInRadius(lat, lng, radiusKm);
            console.log('📦 Galleries found:', galleriesData.length);
            
            if (galleriesData && galleriesData.length > 0) {
                // Фильтруем галереи с валидными координатами
                const mappedGalleries: MapPoint[] = galleriesData
                    .filter(gallery => {
                        const gLat = gallery.lat || 0;
                        const gLng = gallery.lon || 0;
                        const isValidLat = gLat >= -90 && gLat <= 90;
                        const isValidLng = gLng >= -180 && gLng <= 180;
                        const hasCoords = gLat !== 0 && gLng !== 0;
                        
                        if (!isValidLat || !isValidLng) {
                            console.warn(`Invalid coords for gallery ${gallery.id}: lat=${gLat}, lng=${gLng}`);
                        }
                        
                        return isValidLat && isValidLng && hasCoords;
                    })
                    .map((gallery) => ({
                        id: gallery.id,
                        name: gallery.galleryname,
                        lat: gallery.lat || 0,
                        lng: gallery.lon || 0,
                        type: 'Gallery' as const,
                        address: gallery.fulladdress,
                        city: gallery.city,
                        country: gallery.country,
                        website: gallery.placeurl,
                        opening_hours: gallery.openinghours,
                        image: gallery.gallery_img_file 
                            ? directusClient.getImageUrl(gallery.gallery_img_file, { width: 400, quality: 80 })
                            : gallery.gallery_img, // Fallback to CloudFront if no file UUID
                    }));
                
                console.log('✅ Mapped galleries:', mappedGalleries.length);
                if (mappedGalleries.length > 0) {
                    console.log('📸 Sample gallery with image:', {
                        id: mappedGalleries[0].id,
                        name: mappedGalleries[0].name,
                        hasFileUuid: !!galleriesData[0].gallery_img_file,
                        fileUuid: galleriesData[0].gallery_img_file,
                        image: mappedGalleries[0].image
                    });
                }
                setGalleries(mappedGalleries);
            } else {
                setGalleries([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('❌ Error loading galleries:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to load galleries: ${errorMessage}`);
            setLoading(false);
        }
    };

    // Обработка перемещения карты - подгрузка новых галерей
    const handleMapMove = async () => {
        if (!map.current) return;

        const center = map.current.getCenter();
        const zoom = map.current.getZoom();

        // Увеличиваем радиус при меньшем зуме
        const radius = zoom > 12 ? 30 : zoom > 9 ? 50 : 100;

        // Создаем уникальный ключ для области (округляем до 2 знаков для уменьшения дублирования)
        const areaKey = `${center.lat.toFixed(2)}_${center.lng.toFixed(2)}_${radius}`;

        // Если эта область уже загружена, пропускаем
        if (loadedAreas.current.has(areaKey)) {
            return;
        }

        console.log(`🗺️ Map moved to new area (zoom: ${zoom.toFixed(1)}), loading galleries in ${radius}km radius...`);
        loadedAreas.current.add(areaKey);

        try {
            const galleriesData = await directusClient.getGalleriesInRadius(center.lat, center.lng, radius);
            
            if (galleriesData && galleriesData.length > 0) {
                const newGalleries: MapPoint[] = galleriesData
                    .filter(gallery => {
                        const gLat = gallery.lat || 0;
                        const gLng = gallery.lon || 0;
                        const isValidLat = gLat >= -90 && gLat <= 90;
                        const isValidLng = gLng >= -180 && gLng <= 180;
                        const hasCoords = gLat !== 0 && gLng !== 0;
                        
                        if (!isValidLat || !isValidLng) {
                            console.warn(`Invalid coords for gallery ${gallery.id}: lat=${gLat}, lng=${gLng}`);
                        }
                        
                        return isValidLat && isValidLng && hasCoords;
                    })
                    .map((gallery) => ({
                        id: gallery.id,
                        name: gallery.galleryname,
                        lat: gallery.lat || 0,
                        lng: gallery.lon || 0,
                        type: 'Gallery' as const,
                        address: gallery.fulladdress,
                        city: gallery.city,
                        country: gallery.country,
                        website: gallery.placeurl,
                        opening_hours: gallery.openinghours,
                        image: gallery.gallery_img_file 
                            ? directusClient.getImageUrl(gallery.gallery_img_file, { width: 400, quality: 80 })
                            : gallery.gallery_img,
                    }));

                // Объединяем с существующими галереями (избегаем дубликатов)
                setGalleries(prev => {
                    const existingIds = new Set(prev.map(g => g.id));
                    const uniqueNew = newGalleries.filter(g => !existingIds.has(g.id));
                    console.log(`➕ Added ${uniqueNew.length} new galleries`);
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (err) {
            console.error('Error loading galleries for new area:', err);
        }
    };

    // Обновление маркеров на карте
    useEffect(() => {
        if (!map.current || galleries.length === 0) return;

        // Удаляем старые маркеры
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        const filteredGalleries = filterType === 'all' 
            ? galleries 
            : galleries.filter(g => g.type === filterType);

        // Добавляем новые маркеры
        filteredGalleries.forEach(gallery => {
            // Создаем контейнер для маркера
            const container = document.createElement('div');
            container.style.width = '40px';
            container.style.height = '40px';
            container.style.position = 'relative';
            container.style.cursor = 'pointer';
            
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = gallery.type === 'Event' ? '#D93025' : '#000000';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            el.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
            el.style.transformOrigin = 'center center';
            el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
            
            container.appendChild(el);

            // Используем CSS для hover вместо JS
            container.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.15)';
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
            });
            
            container.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            });

            const marker = new maplibregl.Marker({ 
                element: container,
                anchor: 'center'
            })
                .setLngLat([gallery.lng, gallery.lat])
                .addTo(map.current!);

            container.addEventListener('click', () => {
                setSelectedPoint(gallery);
                map.current?.flyTo({
                    center: [gallery.lng, gallery.lat],
                    zoom: 14,
                    duration: 1000
                });
            });

            markers.current.push(marker);
        });

        console.log(`🗺️ Displayed ${filteredGalleries.length} markers on map`);
    }, [galleries, filterType]);

    // Поиск галерей
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            // Если пустой поиск, перезагружаем галереи вокруг текущей позиции
            if (userLocation) {
                await loadGalleriesInRadius(userLocation[1], userLocation[0], 50);
            }
            return;
        }

        try {
            setLoading(true);
            const results = await directusClient.searchGalleries(searchQuery);
            const mappedResults: MapPoint[] = results
                .filter(gallery => {
                    const lat = gallery.lat || 0;
                    const lng = gallery.lon || 0;
                    const isValidLat = lat >= -90 && lat <= 90;
                    const isValidLng = lng >= -180 && lng <= 180;
                    const hasCoords = lat !== 0 && lng !== 0;
                    if (!isValidLat || !isValidLng) {
                        console.warn(`Invalid coords for gallery ${gallery.id}: lat=${lat}, lng=${lng}`);
                    }
                    return isValidLat && isValidLng && hasCoords;
                })
                .map((gallery) => ({
                    id: gallery.id,
                    name: gallery.galleryname,
                    lat: gallery.lat || 0,
                    lng: gallery.lon || 0,
                    type: 'Gallery' as const,
                    address: gallery.fulladdress,
                    city: gallery.city,
                    country: gallery.country,
                    website: gallery.placeurl,
                    opening_hours: gallery.openinghours,
                    image: gallery.gallery_img_file 
                        ? directusClient.getImageUrl(gallery.gallery_img_file, { width: 400, quality: 80 })
                        : gallery.gallery_img,
                }));
            setGalleries(mappedResults);
            console.log('✅ Search: Found galleries with valid coords:', mappedResults.length);
            setLoading(false);
        } catch (err) {
            console.error('Search error:', err);
            setLoading(false);
        }
    };

    // Определение местоположения пользователя
    const handleNearMe = () => {
        if (!map.current) return;

        if ('geolocation' in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    
                    map.current?.flyTo({
                        center: [longitude, latitude],
                        zoom: 12,
                        duration: 2000
                    });

                    // Загружаем галереи в радиусе 50 км
                    await loadGalleriesInRadius(latitude, longitude, 50);

                    // Добавляем маркер местоположения пользователя
                    const userMarker = document.createElement('div');
                    userMarker.style.width = '20px';
                    userMarker.style.height = '20px';
                    userMarker.style.borderRadius = '50%';
                    userMarker.style.backgroundColor = '#2539e9';
                    userMarker.style.border = '3px solid white';
                    userMarker.style.boxShadow = '0 0 10px rgba(37, 57, 233, 0.5)';

                    new maplibregl.Marker({ element: userMarker })
                        .setLngLat([longitude, latitude])
                        .addTo(map.current!);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please enable location services.');
                    setLoading(false);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const filteredGalleries = filterType === 'all' 
        ? galleries 
        : galleries.filter(g => g.type === filterType);

    return (
        <div className="h-screen flex flex-col">
            {/* Map Container */}
            <div ref={mapContainer} className="flex-1 relative">
                {/* Search & Filter Overlay */}
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
                    </div>
                    {loading && <p className="text-xs text-gray-500 mt-2">Loading galleries...</p>}
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>

                {/* Near Me Button */}
                <button 
                    onClick={handleNearMe}
                    className="absolute top-4 right-4 bg-white p-3 shadow-xl rounded-full z-10 hover:bg-art-blue hover:text-white transition-colors"
                    title="Find galleries near me"
                >
                    <Locate className="w-5 h-5" />
                </button>

                {/* Selected Gallery Card */}
                {selectedPoint && (
                    <div className="absolute bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white p-0 shadow-2xl z-20 rounded-sm">
                        <div className="h-32 bg-gray-100 relative">
                            {selectedPoint.image ? (
                                <img 
                                    src={selectedPoint.image} 
                                    className="w-full h-full object-cover" 
                                    alt={selectedPoint.name}
                                    onError={(e) => {
                                        // Fallback если изображение не загрузилось
                                        e.currentTarget.src = `https://picsum.photos/400/400?random=${selectedPoint.id}`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <MapPin className="w-12 h-12" />
                                </div>
                            )}
                            <button 
                                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white" 
                                onClick={() => setSelectedPoint(null)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-serif text-xl font-medium mb-1">{selectedPoint.name}</h3>
                            <p className="text-xs font-bold uppercase text-gray-400 mb-4">{selectedPoint.type}</p>
                            
                            <div className="text-sm text-gray-600 space-y-2 mb-6">
                                {selectedPoint.address && (
                                    <p className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{selectedPoint.address}, {selectedPoint.city}, {selectedPoint.country}</span>
                                    </p>
                                )}
                                {selectedPoint.opening_hours && (
                                    <p className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span className="whitespace-pre-line">{selectedPoint.opening_hours}</span>
                                    </p>
                                )}
                                {selectedPoint.website && (
                                    <p className="flex items-start gap-2">
                                        <Globe className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <a href={selectedPoint.website} target="_blank" rel="noopener noreferrer" className="text-art-blue hover:underline">
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
