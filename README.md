# Art Flaneur Media

Монорепо, объединяющее **Sanity Studio** (CMS), **React/Vite веб-приложение** и интеграции с **AWS AppSync GraphQL** и **Supabase**.

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

**apps/studio/.env** (уже существует):
```env
SANITY_STUDIO_PROJECT_ID=o1yl0ri9
SANITY_STUDIO_DATASET=blog
SANITY_API_TOKEN=<write-token-for-scripts>
```

**apps/web/.env.local**:
```env
VITE_SANITY_PROJECT_ID=o1yl0ri9
VITE_SANITY_DATASET=blog
VITE_SANITY_API_VERSION=2024-01-01
VITE_SANITY_STUDIO_URL=http://localhost:3333

# GraphQL API (каталог галерей/выставок)
VITE_GRAPHQL_ENDPOINT=https://hv2h5zqj65hwvjq7ylemx3ayaa.appsync-api.ap-southeast-2.amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=da2-qola7vmdgbaqbkks6lje5bkta4
VITE_GRAPHQL_TENANT_ID=artflaneur

# Supabase (кабинет галерей)
VITE_SUPABASE_URL=https://esavlnghlshbzuytkykj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 3. Запуск проекта

```bash
npm run dev
```

Откроются:
- **Sanity Studio**: http://localhost:3333
- **Веб-приложение**: http://localhost:3000

---

## 📦 Структура проекта

```
artflaneur_media/
├── apps/
│   ├── studio/                # Sanity Studio (CMS)
│   │   ├── schemaTypes/       # Схемы контента
│   │   ├── scripts/           # Скрипты импорта и очистки
│   │   └── sanity.config.ts
│   └── web/                   # React + Vite приложение
│       ├── pages/             # Страницы
│       ├── components/        # Компоненты
│       ├── lib/               # GraphQL, Supabase, утилиты
│       └── sanity/            # Sanity client & GROQ запросы
├── sanity/lib/                # Общие re-exports для Sanity
├── package.json               # Корневой workspace
└── pnpm-workspace.yaml
```

---

## 🔗 Архитектура и потоки данных

### Источники данных

| Источник | Назначение | Клиентский код |
|----------|------------|----------------|
| **Sanity CMS** | Редакционный контент (ревью, гайды, авторы, лендинги) | `apps/web/sanity/lib/queries.ts` |
| **AppSync GraphQL** | Каталог галерей и выставок (10k+ записей) | `apps/web/lib/graphql.ts` |
| **Supabase** | Авторизация галеристов, заявки на выставки, модерация | `apps/web/lib/supabase.ts` |

### Поток публикации выставок

```
Gallery Owner → Supabase (draft → pending_review → approved)
                            ↓
                  Sync → Sanity / GraphQL API
                            ↓
                       Public Website
```

---

## 📋 Типы контента Sanity

| Тип | Описание |
|-----|----------|
| `review` | Ревью выставок |
| `exhibition` | Выставки (Sanity редакционные) |
| `gallery` | Галереи (Sanity редакционные) |
| `artist` | Художники |
| `artistStory` | Истории художников |
| `author` | Авторы / Амбассадоры |
| `guide` | Путеводители по городам |
| `curator` | Кураторы |
| `sponsor` | Спонсоры |
| `homepageContent` | Контент главной страницы |
| `siteSettings` | Глобальные настройки сайта |
| `landingPage` | Лендинги |

---

## 🌐 Страницы веб-приложения

| Роут | Страница | Источник данных |
|------|----------|-----------------|
| `/` | Home | Sanity |
| `/reviews` | Список ревью | Sanity |
| `/reviews/:slug` | Ревью | Sanity |
| `/exhibitions` | Выставки | Sanity |
| `/galleries` | Галереи | GraphQL API |
| `/galleries/:id` | Детали галереи | GraphQL API |
| `/artists` | Художники | Sanity |
| `/artists/:slug` | Профиль художника | Sanity |
| `/guides` | Путеводители | Sanity |
| `/guides/:slug` | Путеводитель | Sanity |
| `/ambassadors` | Авторы | Sanity |
| `/ambassadors/:slug` | Профиль автора | Sanity |
| `/search` | Поиск | GraphQL API + Sanity |
| `/gallery-login` | Вход галеристов | Supabase Auth |
| `/gallery-dashboard/*` | Кабинет галереи | Supabase |
| `/admin/moderation` | Модерация заявок | Supabase |

---

## 🛠️ Скрипты

### Корневые команды

```bash
npm run dev              # Запустить Studio + Web
npm run dev:studio       # Только Studio
npm run dev:web          # Только Web
npm run build            # Собрать оба проекта
npm run typegen          # Сгенерировать TypeScript типы из Sanity схемы
npm run typecheck        # Проверить типы во всём проекте
```

### Скрипты Studio (`apps/studio`)

```bash
npm run build            # Собрать Studio для деплоя
npm run deploy           # Задеплоить Studio на Sanity hosting

# Импорт данных
npm run import-json      # Импортировать данные из JSON

# Очистка данных (удаление документов)
npm run clear:exhibitions    # Удалить все выставки
npm run clear:galleries      # Удалить все галереи
npm run clear:artists        # Удалить всех художников
```

---

## 📝 Разработка

### Добавление нового типа контента

1. Создайте схему в `apps/studio/schemaTypes/newType.ts`
2. Добавьте экспорт в `apps/studio/schemaTypes/index.ts`
3. Создайте GROQ запрос в `apps/web/sanity/lib/queries.ts`
4. Используйте в компонентах:

```typescript
import { client } from '../sanity/lib/client'
import { MY_QUERY } from '../sanity/lib/queries'

const data = await client.fetch(MY_QUERY)
```

### Работа с GraphQL API

```typescript
import { fetchGalleries, searchGalleries, fetchGalleryById } from '../lib/graphql'

// Получить список галерей
const { items, nextToken } = await fetchGalleries({ limit: 20 })

// Поиск галерей
const results = await searchGalleries('contemporary art')

// Получить галерею по ID
const gallery = await fetchGalleryById('gallery-123')
```

### Генерация типов

После изменения схем Sanity:

```bash
npm run typegen
```

Типы появятся в `apps/web/sanity-schema.json` и `apps/studio/sanity.types.ts`.

---

## 🗄️ Импорт тестовых данных

```bash
cd apps/studio
npx sanity dataset import sample-data.ndjson blog --replace
```

---

## 🔍 Отладка

### Логи в консоли браузера

- `🔍 Fetching...` — начало загрузки
- `📦 Data:` — полученные данные
- `❌ Error:` — ошибки

### Частые проблемы

| Проблема | Решение |
|----------|---------|
| Данные не загружаются | Проверьте `.env` файлы и переменные окружения |
| GraphQL ошибки | Убедитесь, что `VITE_GRAPHQL_ENDPOINT` и `VITE_GRAPHQL_API_KEY` заданы |
| Supabase не работает | Проверьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` |
| TypeScript ошибки | Запустите `npm run typegen && npm run typecheck` |
| Зависимости не ставятся | Удалите `node_modules` и `package-lock.json`, запустите `npm install` |

---

## 📚 Дополнительная документация

| Документ | Описание |
|----------|----------|
| [CLIENT_GRAPHQL_API_ACCESS.md](./CLIENT_GRAPHQL_API_ACCESS.md) | Параметры AppSync GraphQL API |
| [GALLERY_SYSTEM_SETUP.md](./GALLERY_SYSTEM_SETUP.md) | Архитектура кабинета галерей |
| [MULTI_TENANT_SUPABASE.md](./MULTI_TENANT_SUPABASE.md) | Мультитенантность и Supabase |
| [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md) | Хранилище изображений |
| [apps/studio/README.md](./apps/studio/README.md) | Документация Sanity Studio |
| [apps/web/README.md](./apps/web/README.md) | Документация веб-приложения |

---

## 🔧 Конфигурация проекта

| Параметр | Значение |
|----------|----------|
| **Sanity Project ID** | `o1yl0ri9` |
| **Sanity Dataset** | `blog` |
| **Studio URL (local)** | http://localhost:3333 |
| **Web App URL (local)** | http://localhost:3000 |
| **GraphQL Region** | `ap-southeast-2` (Sydney) |

---

## 📜 Лицензия

UNLICENSED — проприетарный код Art Flaneur Global Pty Ltd.
