# 🎨 Art Flaneur Media - Готов к запуску!

## ✅ Интеграция завершена!

Проект **Sanity Studio** и **Web приложение** теперь полностью интегрированы и готовы к запуску.

---

## 🚀 Быстрый старт

### 1. Запустите весь проект (Studio + Web одновременно)

```bash
npm run dev
```

После запуска откроются:
- **Sanity Studio**: http://localhost:3333
- **Web App**: http://localhost:3000

### 2. Или запустите раздельно

```bash
# Только Sanity Studio
npm run dev:studio

# Только Web приложение
npm run dev:web
```

---

## 🏗️ Архитектура проекта

### Data Sources & Responsibilities

1. **Sanity CMS** — редакционный контент (ревью, лендинги, авторы, гайды, спонсоры). Все схемы находятся в `apps/studio/schemaTypes` и автоматически типизируются для фронтенда.
2. **AppSync GraphQL API** — продуктивный каталог галерей и выставок (10k+ записей). Клиентская обёртка и запросы лежат в `apps/web/lib/graphql.ts` и используют API ключ + `x-tenant-id` для мульти-арендной фильтрации.
3. **Supabase** — кабинет галерей, аутентификация и модерация заявок. Запросы реализованы в `apps/web/lib/supabase.ts`, схема описана в `apps/web/lib/database.types.ts` и сопровождающих документах.

### Data Flow

```
Gallery Owner → Supabase (draft + moderation) → AppSync GraphQL (published) → React/Vite Web
```

---

## 📦 Что было сделано

### ✅ 1. Sanity Client Configuration
- Обновлен `sanity/lib/client.ts` для работы с Vite
- Поддержка переменных окружения через `import.meta.env`

### ✅ 2. GraphQL API Client
- Создан `apps/web/lib/graphql.ts` с общим `executeGraphQL`, фильтрами и пост-обработкой городов
- Реализованы запросы `fetchGalleries`, `searchGalleries`, `fetchNearbyGalleries`, `fetchExhibitions`
- Добавлена обработка `VITE_GRAPHQL_TENANT_ID` для мультитенантного доступа

### ✅ 3. Supabase Dashboard
- `apps/web/lib/supabase.ts` инкапсулирует авторизацию, CRUD по галереям и модерацию выставок
- Все типы берутся из `apps/web/lib/database.types.ts`
- Кабинет галерей и модерация используют эти хелперы напрямую

### ✅ 4. GROQ Queries
- `sanity/lib/queries.ts` содержит запросы для редакционных страниц (`REVIEWS_QUERY`, `HOMEPAGE_QUERY`, `SITE_SETTINGS_QUERY` и т.д.)

### ✅ 5. Environment Variables
Настроены переменные окружения:

**apps/studio/.env** (уже существует):
```env
SANITY_STUDIO_PROJECT_ID=o1yl0ri9
SANITY_STUDIO_DATASET=blog
```

**apps/web/.env.local** (обновлен):
```env
VITE_SANITY_PROJECT_ID=o1yl0ri9
VITE_SANITY_DATASET=blog
VITE_SANITY_API_VERSION=2024-01-01
VITE_SANITY_STUDIO_URL=http://localhost:3333
VITE_GRAPHQL_ENDPOINT=<https://your-appsync-endpoint>
VITE_GRAPHQL_API_KEY=<graphQLApiKey>
VITE_GRAPHQL_TENANT_ID=artflaneur
VITE_SUPABASE_URL=<https://your-project.supabase.co>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### ✅ 4. Package.json Updates

**Корневой package.json**:
```json
{
  "scripts": {
    "dev": "npm run dev:all",
    "dev:all": "concurrently \"npm --prefix apps/studio run dev\" \"npm --prefix apps/web run dev\"",
    "dev:studio": "npm --prefix apps/studio run dev",
    "dev:web": "npm --prefix apps/web run dev",
    "build": "npm run build:studio && npm run build:web",
    "typegen": "npm --prefix apps/studio run typegen",
    "typecheck": "npm --prefix apps/studio run typecheck && npm --prefix apps/web run typecheck"
  }
}
```

**apps/web/package.json** (добавлены зависимости):
- `@sanity/client` - клиент для запросов к Sanity
- `@sanity/image-url` - обработка изображений
- `groq` - типы для GROQ запросов

### ✅ 5. TypeScript Configuration
- Обновлен `apps/web/tsconfig.json`
- Настроены path aliases
- Включены файлы из `sanity/` директории

### ✅ 6. Vite Configuration
- Обновлен `apps/web/vite.config.ts`
- Добавлены алиасы для удобного импорта

### ✅ 7. TypeGen Setup
- Создан `apps/studio/sanity-typegen.json`
- Настроена генерация TypeScript типов из Sanity схемы

### ✅ 8. Entry Points
- Создан `apps/web/main.tsx` - точка входа React
- Обновлен `apps/web/index.html`

---

## 📋 Следующие шаги

### Шаг 1: Первый запуск
```bash
npm run dev
```

### Шаг 2: Сгенерируйте TypeScript типы
После того, как Studio запустится и схема будет загружена:
```bash
npm run typegen
```

Это создаст файл `apps/web/sanity/types.ts` с типами для всех ваших документов.

### Шаг 3: Используйте Sanity в компонентах

Пример использования в React компоненте:

```typescript
import { useEffect, useState } from 'react'
import { client } from '../../sanity/lib/client'
import { REVIEWS_QUERY } from '../../sanity/lib/queries'

function ReviewsList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .fetch(REVIEWS_QUERY)
      .then((data) => {
        setReviews(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {reviews.map((review) => (
        <article key={review._id}>
          <h2>{review.title}</h2>
          <p>{review.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

---

## 📂 Структура проекта

```
artflaneur_media/
├── apps/
│   ├── studio/                    # Sanity Studio (CMS)
│   │   ├── schemaTypes/           # Схемы контента
│   │   │   ├── review.ts          # Обзоры
│   │   │   ├── post.ts            # Статьи
│   │   │   ├── exhibition.ts      # Выставки
│   │   │   ├── gallery.ts         # Галереи
│   │   │   ├── artist.ts          # Художники
│   │   │   └── ...
│   │   ├── .env                   # Конфигурация Sanity
│   │   ├── sanity-typegen.json    # Конфигурация TypeGen
│   │   └── package.json
│   │
│   └── web/                       # React приложение
│       ├── components/            # React компоненты
│       ├── pages/                 # Страницы
│       ├── .env.local             # Конфигурация с Sanity credentials
│       ├── main.tsx               # Точка входа React
│       ├── App.tsx                # Основной компонент приложения
│       ├── vite.config.ts         # Vite конфигурация
│       ├── tsconfig.json          # TypeScript конфигурация
│       └── package.json
│
├── sanity/                        # Общая Sanity конфигурация
│   └── lib/
│       ├── client.ts              # Sanity клиент
│       ├── queries.ts             # GROQ запросы
│       ├── live.ts                # Live preview
│       └── token.ts               # API токены
│
├── package.json                   # Корневой package.json
├── pnpm-workspace.yaml            # Workspace конфигурация
├── CLIENT_GRAPHQL_API_ACCESS.md   # Параметры AppSync GraphQL
├── GALLERY_SYSTEM_SETUP.md        # Описание цепочки данных галерей
├── MULTI_TENANT_SUPABASE.md       # Мультиарендность и Supabase
├── SUPABASE_STORAGE_SETUP.md      # Хранилище изображений
└── README_RUN.md                  # Этот файл
```

---

## 🛠 Полезные команды

### Development
```bash
npm run dev              # Запустить Studio + Web
npm run dev:studio       # Только Studio
npm run dev:web          # Только Web
```

### Build
```bash
npm run build            # Собрать оба проекта
npm run build:studio     # Собрать Studio
npm run build:web        # Собрать Web
```

### TypeScript
```bash
npm run typegen          # Сгенерировать типы из Sanity схемы
npm run typecheck        # Проверить типы во всем проекте
```

### Sanity Studio
```bash
cd apps/studio
npm run deploy           # Задеплоить Studio на Sanity hosting
npm run import-json      # Импортировать данные из JSON
```

---

## 🔧 Конфигурация

### Ваш Sanity проект
- **Project ID**: `o1yl0ri9`
- **Dataset**: `blog`
- **Studio URL** (local): http://localhost:3333
- **API Version**: `2024-01-01`

### Порты
- **Sanity Studio**: 3333
- **Web App**: 3000

---

## 💡 Интеграция с существующими компонентами

Ваши существующие страницы в `apps/web/pages/`:
- `Home.tsx`
- `ArticleView.tsx`
- `ListingPage.tsx`
- `GuideView.tsx`
- `ArtistView.tsx`
- и другие...

Теперь могут использовать данные из Sanity! Просто импортируйте:

```typescript
import { client } from '../../sanity/lib/client'
import { REVIEWS_QUERY, EXHIBITIONS_QUERY } from '../../sanity/lib/queries'
```

---

## 🐛 Troubleshooting

### Ошибка: "Cannot find module '../sanity/lib/client'"

Проверьте путь импорта. Из файлов в `apps/web/`:
```typescript
// ❌ Неправильно
import { client } from '../sanity/lib/client'

// ✅ Правильно (на два уровня вверх)
import { client } from '../../sanity/lib/client'
```

### Studio не запускается

```bash
cd apps/studio
rm -rf node_modules
npm install
npm run dev
```

### Web не запускается

```bash
cd apps/web
rm -rf node_modules
npm install
npm run dev
```

### Проблемы с типами

```bash
npm run typegen
npm run typecheck
```

---

## 📚 Документация

- [CLIENT_GRAPHQL_API_ACCESS.md](./CLIENT_GRAPHQL_API_ACCESS.md) — параметры AppSync GraphQL, политика ключей и переменные окружения
- [GALLERY_SYSTEM_SETUP.md](./GALLERY_SYSTEM_SETUP.md) — описание полного контура данных галерей
- [MULTI_TENANT_SUPABASE.md](./MULTI_TENANT_SUPABASE.md) — архитектура кабинета галерей, роли и миграции
- [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md) — конфигурация хранения медиа
- [Sanity Docs](https://www.sanity.io/docs) — схемы и GROQ
- [AWS AppSync Docs](https://docs.aws.amazon.com/appsync/) — управление GraphQL API
- [GROQ Tutorial](https://www.sanity.io/docs/groq)

---

## 🎉 Готово!

Ваш проект готов к работе. Выполните:

```bash
npm run dev
```

И начинайте разработку! 🚀

---

**Примечание**: Если вы используете `pnpm` вместо `npm`, замените все команды `npm` на `pnpm` в этом документе.
