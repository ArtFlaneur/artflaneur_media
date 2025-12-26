# Art Flaneur Web

React + Vite веб-приложение для Art Flaneur.

## Запуск

```bash
npm run dev
```

Приложение откроется на http://localhost:3000

## Источники данных

| Источник | Назначение | Файл |
|----------|------------|------|
| **Sanity** | Редакционный контент | `sanity/lib/queries.ts` |
| **GraphQL API** | Каталог галерей/выставок | `lib/graphql.ts` |
| **Supabase** | Авторизация, кабинет галерей | `lib/supabase.ts` |

## Страницы

### Публичные (Sanity)

- `/` — Главная
- `/reviews` — Список ревью
- `/reviews/:slug` — Детали ревью
- `/exhibitions` — Выставки
- `/artists` — Художники
- `/artists/:slug` — Профиль художника
- `/guides` — Путеводители
- `/guides/:slug` — Детали путеводителя
- `/ambassadors` — Авторы
- `/ambassadors/:slug` — Профиль автора

### Публичные (GraphQL API)

- `/galleries` — Каталог галерей
- `/galleries/:id` — Детали галереи
- `/search` — Поиск (GraphQL + Sanity)

### Кабинет галерей (Supabase)

- `/gallery-login` — Вход/регистрация
- `/gallery-dashboard` — Dashboard
- `/gallery-dashboard/exhibitions` — Выставки галереи
- `/gallery-dashboard/settings` — Настройки

### Администрирование

- `/admin/moderation` — Модерация заявок

## Скрипты

```bash
npm run dev          # Запустить dev сервер
npm run build        # Собрать для production
npm run preview      # Превью production сборки
npm run typecheck    # Проверить типы
```

## Переменные окружения

Создайте `.env.local`:

```env


## Структура

```
apps/web/
├── pages/               # Страницы
│   ├── Home.tsx
│   ├── ListingPage.tsx
│   ├── GalleryView.tsx
│   ├── SearchResults.tsx
│   └── ...
├── components/          # Компоненты
│   ├── Layout.tsx
│   ├── Shared.tsx
│   ├── SecureImage.tsx
│   └── ...
├── lib/                 # Утилиты и клиенты
│   ├── graphql.ts       # GraphQL API клиент
│   ├── supabase.ts      # Supabase клиент
│   ├── formatters.ts    # Форматирование данных
│   ├── galleryMapping.ts
│   └── ...
├── sanity/              # Sanity интеграция
│   └── lib/
│       ├── client.ts    # Sanity клиент
│       └── queries.ts   # GROQ запросы
├── App.tsx              # Роутинг
├── index.tsx            # Entry point
└── vite.config.ts       # Vite конфигурация
```

## Работа с данными

### Sanity (GROQ)

```typescript
import { client } from '../sanity/lib/client'
import { REVIEWS_QUERY } from '../sanity/lib/queries'

const reviews = await client.fetch(REVIEWS_QUERY)
```

### GraphQL API

```typescript
import { fetchGalleries, searchGalleries, fetchGalleryById } from '../lib/graphql'

// Список галерей
const { items } = await fetchGalleries({ limit: 20 })

// Поиск
const results = await searchGalleries('contemporary')

// По ID
const gallery = await fetchGalleryById('123')
```

### Supabase

```typescript
import { getSupabaseClient } from '../lib/supabase'

const supabase = getSupabaseClient()
const { data } = await supabase.from('galleries').select('*')
```

## Зависимости

- `react` + `react-dom` — UI
- `react-router-dom` — Роутинг
- `@sanity/client` — Sanity API
- `@supabase/supabase-js` — Supabase
- `lucide-react` — Иконки
- `recharts` — Графики
