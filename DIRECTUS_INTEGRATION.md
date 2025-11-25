# Directus Integration Guide

## Архитектура данных

Проект использует **гибридную архитектуру** для работы с данными:

### Sanity CMS
- **Контент для публикаций**: Reviews, Guides, Articles
- **Авторы** (Authors/Ambassadors)
- **Настройки сайта** (Site Settings, Homepage Content)
- **Небольшие справочники** (Categories)

### Directus (AWS)
- **Галереи** (Galleries) - большая база данных с геолокацией
- **Выставки** (Exhibitions) - текущие и будущие события
- **Художники** (Artists) - полная база художников
- **Связи**: Exhibitions → Galleries, Exhibitions → Artists

## Настройка Directus

### 1. Переменные окружения

Создайте файл `.env.local` в `apps/web/`:

```bash
# Directus Configuration
VITE_DIRECTUS_URL=https://your-instance.amazonaws.com
VITE_DIRECTUS_TOKEN=your-api-token
```

### 2. Структура данных в Directus

#### Коллекция: `galleries`
```json
{
  "id": number,
  "name": string,
  "city": string,
  "country": string,
  "address": string,
  "latitude": number,
  "longitude": number,
  "website": string,
  "opening_hours": string,
  "phone": string,
  "email": string,
  "description": text,
  "image": file
}
```

#### Коллекция: `exhibitions`
```json
{
  "id": number,
  "title": string,
  "description": text,
  "start_date": date,
  "end_date": date,
  "gallery_id": number (relation to galleries),
  "artist_id": number (relation to artists),
  "image": file
}
```

#### Коллекция: `artists`
```json
{
  "id": number,
  "name": string,
  "bio": text,
  "birth_year": number,
  "nationality": string,
  "website": string,
  "image": file
}
```

## API Клиент

Используйте `directusClient` из `apps/web/lib/directus.ts`:

### Примеры использования

```typescript
import { directusClient } from '../lib/directus';

// Получить все галереи для карты
const galleries = await directusClient.getGalleriesForMap();

// Поиск галерей
const results = await directusClient.searchGalleries('Berlin');

// Получить выставки по галерее
const exhibitions = await directusClient.getExhibitionsByGallery(123);

// Получить URL изображения
const imageUrl = directusClient.getImageUrl('file-id', { 
  width: 400, 
  height: 300, 
  quality: 80 
});
```

## Карта (MapPage)

### Текущая реализация

- **Источник данных**: Directus API
- **Фильтрация**: По типу (Gallery/Museum/Event)
- **Поиск**: По названию галереи или городу
- **Отображение**: Маркеры с координатами (latitude/longitude)

### Координаты

Галереи должны иметь заполненные поля `latitude` и `longitude` для отображения на карте.

Формат:
- **Latitude**: -90 до 90 (север/юг)
- **Longitude**: -180 до 180 (запад/восток)

Пример для Берлина:
- Latitude: 52.520008
- Longitude: 13.404954

## Синхронизация данных

### Вариант 1: Прямая подгрузка (текущий)

✅ **Преимущества**:
- Всегда актуальные данные
- Не нужна синхронизация
- Меньше хранилища в Sanity

❌ **Недостатки**:
- Зависимость от Directus API
- Может быть медленнее

### Вариант 2: Периодическая синхронизация

Используйте скрипт `apps/studio/scripts/syncFromDirectus.ts`:

```bash
cd apps/studio
npm run sync-directus
```

Это скопирует данные из Directus в Sanity для оффлайн доступа.

## Рекомендации

### Для карты
- Используйте прямую подгрузку из Directus (текущий подход)
- Кешируйте результаты в браузере на 5-10 минут

### Для листингов (выставки, художники)
- Можете использовать синхронизацию в Sanity
- Или прямую подгрузку в зависимости от объема

### Для детальных страниц
- Рекомендуется прямая подгрузка из Directus
- Всегда актуальная информация

## Troubleshooting

### Ошибка: "Failed to fetch from Directus"

1. Проверьте `VITE_DIRECTUS_URL` и `VITE_DIRECTUS_TOKEN` в `.env.local`
2. Убедитесь, что Directus API доступен
3. Проверьте CORS настройки в Directus

### Нет галерей на карте

1. Проверьте, что галереи имеют `latitude` и `longitude`
2. Проверьте фильтр `_nnull` в `getGalleriesForMap()`
3. Откройте консоль браузера для логов

### Изображения не загружаются

1. Проверьте права доступа к `/assets` в Directus
2. Используйте `directusClient.getImageUrl()` для корректных URL
3. Проверьте CORS для изображений
