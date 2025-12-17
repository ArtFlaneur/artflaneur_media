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

### Dual Database Architecture

Проект использует две базы данных:

1. **Sanity CMS** - для редакционного контента:
   - Reviews (обзоры выставок)
   - Authors (авторы, амбассадоры)
   - Sponsors (спонсоры, партнеры)
   - Guides (гайды по городам)

2. **Directus/PostgreSQL** - для больших объемов данных:
   - Galleries (10000+ галерей)
   - Exhibitions (выставки)
   - Artists (художники)

3. **Supabase** - для Gallery Dashboard:
   - User authentication
   - Exhibition submissions (черновики, модерация)
   - Image storage

### Data Flow

```
Gallery Owner → Supabase (draft) → Admin Moderation → Directus (published) → Website
```

---

## 📦 Что было сделано

### ✅ 1. Sanity Client Configuration
- Обновлен `sanity/lib/client.ts` для работы с Vite
- Поддержка переменных окружения через `import.meta.env`

### ✅ 2. GROQ Queries
Создан `sanity/lib/queries.ts` с готовыми запросами:
- `REVIEWS_QUERY` / `REVIEW_QUERY` - обзоры выставок
- `POSTS_QUERY` / `POST_QUERY` - статьи и блог-посты
- `EXHIBITIONS_QUERY` / `EXHIBITION_QUERY` - выставки
- `GALLERIES_QUERY` / `GALLERY_QUERY` - галереи
- `ARTISTS_QUERY` / `ARTIST_QUERY` - художники
- `HOMEPAGE_QUERY` - контент главной страницы
- `SITE_SETTINGS_QUERY` - настройки сайта

### ✅ 3. Environment Variables
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
├── DIRECTUS_MIGRATION.md          # Миграция на Directus для exhibitions
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

- [DIRECTUS_MIGRATION.md](./DIRECTUS_MIGRATION.md) - Миграция exhibitions/galleries на Directus
- [DIRECTUS_ADD_FIELDS_UI.md](./DIRECTUS_ADD_FIELDS_UI.md) - Добавление полей через Directus Admin UI
- [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md) - Настройка Supabase Storage для изображений
- [Sanity Docs](https://www.sanity.io/docs) - Для работы с reviews и sponsors
- [Directus Docs](https://docs.directus.io/) - Для работы с galleries и exhibitions
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
