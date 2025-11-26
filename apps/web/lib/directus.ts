/**
 * Directus API client for fetching galleries, exhibitions, and artists
 * Data is fetched directly from AWS Directus instance
 */

// В dev режиме используем прокси для обхода CORS
const isDev = import.meta.env.DEV;
const DIRECTUS_URL = isDev 
  ? '/api/directus' 
  : (import.meta.env.VITE_DIRECTUS_URL || 'https://your-directus-instance.com');
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '';

// Debug logging
console.log('🔧 Directus Config:', {
  mode: isDev ? 'development (using proxy)' : 'production',
  url: DIRECTUS_URL,
  hasToken: !!DIRECTUS_TOKEN,
  tokenLength: DIRECTUS_TOKEN.length
});

export interface DirectusGallery {
  id: number;
  galleryname: string;
  city: string;
  country: string;
  fulladdress?: string;
  lat?: number;
  lon?: number;
  placeurl?: string;
  openinghours?: string;
  gallery_img?: string;
  gallery_img_file?: string; // UUID для загрузки через /assets/
}

export interface DirectusExhibition {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  gallery_id?: number;
  artist_id?: number;
  image?: {
    id: string;
    filename_disk: string;
  };
}

export interface DirectusArtist {
  id: number;
  name: string;
  bio?: string;
  birth_year?: number;
  nationality?: string;
  website?: string;
  image?: {
    id: string;
    filename_disk: string;
  };
}

class DirectusClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Для прокси используем относительный URL, для продакшна - абсолютный
    const baseUrl = this.baseUrl.startsWith('/') 
      ? `${window.location.origin}${this.baseUrl}`
      : this.baseUrl;
    
    const url = new URL(`${baseUrl}/items/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Для фильтров и других объектов преобразуем в JSON
          if (typeof value === 'object') {
            url.searchParams.append(key, JSON.stringify(value));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    console.log('🔗 Directus request:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Directus response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Directus API error:', errorText);
      throw new Error(`Directus API error: ${response.statusText}`);
    }

    const json = await response.json();
    console.log('✅ Directus data received:', json.data?.length || 'single item');
    return json.data;
  }

  /**
   * Получить галереи в радиусе от точки (в километрах)
   * @param lat - широта центра
   * @param lng - долгота центра
   * @param radiusKm - радиус в километрах (по умолчанию 10 км)
   */
  async getGalleriesInRadius(lat: number, lng: number, radiusKm: number = 10): Promise<DirectusGallery[]> {
    try {
      // Вычисляем примерные границы квадрата вокруг точки
      // 1 градус широты ≈ 111 км
      // 1 градус долготы ≈ 111 км * cos(latitude)
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      const minLat = lat - latDelta;
      const maxLat = lat + latDelta;
      const minLng = lng - lngDelta;
      const maxLng = lng + lngDelta;

      console.log(`🔍 Fetching galleries in bounds: lat ${minLat.toFixed(2)} to ${maxLat.toFixed(2)}, lng ${minLng.toFixed(2)} to ${maxLng.toFixed(2)}`);

      // Получаем галереи с фильтром по границам
      const allGalleries = await this.fetch<DirectusGallery[]>('galleries', {
        limit: -1,
        fields: 'id,galleryname,city,country,fulladdress,lat,lon,placeurl,openinghours,gallery_img,gallery_img_file',
        filter: {
          _and: [
            { lat: { _nnull: true } },
            { lon: { _nnull: true } },
            { lat: { _gte: minLat } },
            { lat: { _lte: maxLat } },
            { lon: { _gte: minLng } },
            { lon: { _lte: maxLng } }
          ]
        }
      });
      
      console.log(`📦 Server returned ${allGalleries.length} galleries in bounds`);

      // Дополнительно фильтруем по точному радиусу (круг, а не квадрат)
      const filtered = allGalleries.filter(gallery => {
        if (!gallery.lat || !gallery.lon) return false;
        
        const distance = this.calculateDistance(lat, lng, gallery.lat, gallery.lon);
        return distance <= radiusKm;
      });

      console.log(`✅ ${filtered.length} galleries within ${radiusKm}km radius`);
      return filtered;
    } catch (error) {
      console.error('Error fetching galleries in radius:', error);
      throw error;
    }
  }

  /**
   * Вычислить расстояние между двумя точками (формула Haversine)
   * @returns расстояние в километрах
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Радиус Земли в км
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Получить все галереи с координатами для карты (deprecated - используйте getGalleriesInRadius)
   */
  async getGalleriesForMap(): Promise<DirectusGallery[]> {
    try {
      // Сначала получим все галереи без фильтра
      const allGalleries = await this.fetch<DirectusGallery[]>('galleries', {
        limit: -1,
        fields: 'id,galleryname,city,country,fulladdress,lat,lon,placeurl,openinghours,gallery_img,gallery_img_file',
      });
      
      // Фильтруем на клиенте только те, у которых есть координаты
      return allGalleries.filter(g => g.lat != null && g.lon != null);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      throw error;
    }
  }

  /**
   * Получить галерею по ID
   */
  async getGallery(id: number): Promise<DirectusGallery> {
    const response = await fetch(`${this.baseUrl}/items/galleries/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    const json = await response.json();
    return json.data;
  }

  /**
   * Поиск галерей
   */
  async searchGalleries(query: string): Promise<DirectusGallery[]> {
    return this.fetch<DirectusGallery[]>('galleries', {
      search: query,
      limit: 50,
    });
  }

  /**
   * Получить выставки по галерее
   */
  async getExhibitionsByGallery(galleryId: number): Promise<DirectusExhibition[]> {
    const now = new Date().toISOString().split('T')[0];
    
    return this.fetch<DirectusExhibition[]>('exhibitions', {
      filter: {
        gallery_id: { _eq: galleryId },
        end_date: { _gte: now }, // Только актуальные или будущие
      },
      sort: 'start_date',
      limit: 20,
    });
  }

  /**
   * Получить всех художников
   */
  async getArtists(limit: number = 100): Promise<DirectusArtist[]> {
    return this.fetch<DirectusArtist[]>('artists', {
      limit,
      sort: 'name',
    });
  }

  /**
   * Поиск художников
   */
  async searchArtists(query: string): Promise<DirectusArtist[]> {
    return this.fetch<DirectusArtist[]>('artists', {
      search: query,
      limit: 50,
    });
  }

  /**
   * Получить URL изображения из Directus
   */
  getImageUrl(fileId: string, params?: { width?: number; height?: number; quality?: number }): string {
    // Для прокси используем относительный URL, для продакшна - абсолютный
    const baseUrl = this.baseUrl.startsWith('/') 
      ? `${window.location.origin}${this.baseUrl}`
      : this.baseUrl;
    
    const url = new URL(`${baseUrl}/assets/${fileId}`);
    
    if (params?.width) url.searchParams.append('width', String(params.width));
    if (params?.height) url.searchParams.append('height', String(params.height));
    if (params?.quality) url.searchParams.append('quality', String(params.quality));
    if (this.token) {
      url.searchParams.append('access_token', this.token);
    }
    
    return url.toString();
  }
}

// Экспортируем единственный экземпляр клиента
export const directusClient = new DirectusClient(DIRECTUS_URL, DIRECTUS_TOKEN);
