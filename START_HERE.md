# 🎉 ПРОЕКТ ГОТОВ К ЗАПУСКУ!

## ✅ ВСЁ НАСТРОЕНО И ГОТОВО

Studio и Web приложение полностью интегрированы в единый проект!

---

## 🚀 ЗАПУСК ПРОЕКТА

### Вариант 1: Запустить всё сразу (рекомендуется)

```bash
npm run dev
```

Откроется:
- **Sanity Studio**: http://localhost:3333
- **Web App**: http://localhost:3000

### Вариант 2: Запустить раздельно

```bash
# В одном терминале
npm run dev:studio

# В другом терминале
npm run dev:web
```

---

## 📋 ЧТО БЫЛО СДЕЛАНО

### 1. ✅ Конфигурация Sanity
- `sanity/lib/client.ts` - настроен для Vite
- `sanity/lib/queries.ts` - готовые GROQ запросы для всех типов контента
- `sanity/lib/live.ts` - live preview
- `sanity/lib/token.ts` - API токены

### 2. ✅ Package.json обновления
**Корневой**:
- Добавлена зависимость `concurrently` для одновременного запуска
- Настроены скрипты для npm (вместо pnpm)

**apps/web/package.json**:
- Добавлены: `@sanity/client`, `@sanity/image-url`, `groq`

**apps/studio/package.json**:
- Обновлен скрипт `typegen` для экспорта в web

### 3. ✅ Переменные окружения
**apps/studio/.env**:
```env
SANITY_STUDIO_PROJECT_ID=o1yl0ri9
SANITY_STUDIO_DATASET=blog
```

**apps/web/.env.local**:
```env
VITE_SANITY_PROJECT_ID=o1yl0ri9
VITE_SANITY_DATASET=blog
VITE_SANITY_API_VERSION=2024-01-01
VITE_SANITY_STUDIO_URL=http://localhost:3333
```

### 4. ✅ TypeScript настройки
- `apps/web/tsconfig.json` - настроены пути и включения
- `apps/studio/sanity-typegen.json` - конфигурация для генерации типов

### 5. ✅ Vite конфигурация
- `apps/web/vite.config.ts` - добавлены алиасы

### 6. ✅ React точки входа
- `apps/web/main.tsx` - создан
- `apps/web/index.html` - обновлен

### 7. ✅ Все зависимости установлены
```bash
npm install  # ✅ Выполнено
```

---

## 📝 ПОСЛЕ ПЕРВОГО ЗАПУСКА

### Шаг 1: Сгенерируйте TypeScript типы

После того, как Studio запустится:

```bash
npm run typegen
```

Это создаст:
- `apps/web/sanity-schema.json` - экспорт схемы
- `apps/web/sanity/types.ts` - TypeScript типы

### Шаг 2: Создайте контент в Studio

1. Откройте http://localhost:3333
2. Войдите с вашими Sanity credentials
3. Создайте несколько документов:
   - Reviews
   - Posts
   - Exhibitions
   - Galleries
   - Artists

---

## 💻 ИСПОЛЬЗОВАНИЕ В КОДЕ

### Пример: Получение данных из Sanity

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
        console.error('Error:', error)
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
          {review.rating && <span>Rating: {review.rating}/5</span>}
        </article>
      ))}
    </div>
  )
}
```

### Доступные запросы в `sanity/lib/queries.ts`:

- `REVIEWS_QUERY` / `REVIEW_QUERY` - обзоры выставок
- `POSTS_QUERY` / `POST_QUERY` - статьи
- `EXHIBITIONS_QUERY` / `EXHIBITION_QUERY` - выставки
- `GALLERIES_QUERY` / `GALLERY_QUERY` - галереи
- `ARTISTS_QUERY` / `ARTIST_QUERY` - художники
- `HOMEPAGE_QUERY` - контент главной страницы
- `SITE_SETTINGS_QUERY` - настройки сайта

---

## 🛠 Полезные команды

```bash
# Development
npm run dev              # Запустить Studio + Web
npm run dev:studio       # Только Studio
npm run dev:web          # Только Web

# Build
npm run build            # Собрать оба проекта
npm run build:studio     # Собрать Studio
npm run build:web        # Собрать Web

# TypeScript
npm run typegen          # Сгенерировать типы
npm run typecheck        # Проверить типы

# Studio специфичные
cd apps/studio
npm run deploy           # Задеплоить Studio
npm run import-json      # Импортировать JSON данные
```

---

## 🎯 СТРУКТУРА ПРОЕКТА

```
artflaneur_media/
├── apps/
│   ├── studio/                  # Sanity Studio (CMS)
│   │   ├── schemaTypes/         # Типы контента
│   │   │   ├── review.ts
│   │   │   ├── post.ts
│   │   │   ├── exhibition.ts
│   │   │   └── ...
│   │   ├── .env
│   │   └── package.json
│   │
│   └── web/                     # React приложение
│       ├── components/
│       ├── pages/
│       ├── main.tsx
│       ├── App.tsx
│       ├── .env.local
│       └── package.json
│
├── sanity/                      # Общая Sanity конфигурация
│   └── lib/
│       ├── client.ts            # ✅ Sanity клиент
│       ├── queries.ts           # ✅ GROQ запросы
│       ├── live.ts
│       └── token.ts
│
├── package.json                 # ✅ Workspace config
├── README_RUN.md                # Инструкции по запуску
├── INTEGRATION_COMPLETE.md      # Детальная документация
└── WHATS_MISSING.md             # Чек-лист недостающих компонентов
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### Node.js версия
Вы используете **Node.js v20.18.0**. 

Некоторые пакеты требуют >= 20.19, но текущая версия **должна работать**. Предупреждения можно игнорировать.

Для обновления (опционально):
```bash
# Используя nvm
nvm install 20.19
nvm use 20.19
```

### Уязвимости зависимостей
Обнаружено 20 уязвимостей. Для исправления:

```bash
npm audit fix
```

Или для автоматического исправления (может привести к breaking changes):
```bash
npm audit fix --force
```

---

## 📚 ДОКУМЕНТАЦИЯ

1. **README_RUN.md** - Краткая инструкция по запуску
2. **INTEGRATION_COMPLETE.md** - Полная документация по интеграции
3. **WHATS_MISSING.md** - Чек-лист того, что нужно сделать
4. **SETUP.md** - Детальная инструкция по настройке

---

## 🐛 TROUBLESHOOTING

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

### Ошибка "Cannot find module"

Проверьте пути импорта. Из `apps/web/`:
```typescript
import { client } from '../../sanity/lib/client'  // ✅ Правильно
```

### TypeScript ошибки

```bash
npm run typegen
npm run typecheck
```

### CORS ошибки

Если при запросах к Sanity возникают CORS ошибки:

1. Зайдите на https://www.sanity.io/manage
2. Выберите проект `o1yl0ri9`
3. API → CORS Origins
4. Добавьте `http://localhost:3000` и `http://localhost:3333`

---

## 🎉 ГОТОВО!

Всё настроено и готово к работе!

### Запустите проект:

```bash
npm run dev
```

### Откройте в браузере:
- Studio: http://localhost:3333
- Web: http://localhost:3000

---

## 📖 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [React Router v7](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)

---

**Успешной разработки! 🚀**
