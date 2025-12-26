# Art Flaneur Studio

Sanity Studio для управления редакционным контентом Art Flaneur.

## Запуск

```bash
npm run dev
```

Studio откроется на http://localhost:3333

## Типы контента

| Тип | Описание |
|-----|----------|
| `review` | Ревью выставок с рейтингом и спонсорством |
| `exhibition` | Выставки (редакционные) |
| `gallery` | Галереи (редакционные) |
| `artist` | Художники |
| `artistStory` | Истории художников |
| `author` | Авторы / Амбассадоры |
| `guide` | Путеводители по городам |
| `curator` | Кураторы |
| `sponsor` | Спонсоры |
| `homepageContent` | Контент главной страницы |
| `siteSettings` | Глобальные настройки |
| `landingPage` | Лендинги |

## Интеграция GraphQL каталога

Чтобы использовать поиск галерей внутри полей `Guide → Stops`, добавьте в `apps/studio/.env` следующие переменные:

```env


Без этих значений кастомный инпут для внешних галерей будет отображать предупреждение и работать в режиме только чтения.

## Скрипты

### Разработка

```bash
npm run dev          # Запустить Studio локально
npm run build        # Собрать для деплоя
npm run deploy       # Задеплоить на Sanity hosting
```

### Типы TypeScript

```bash
npm run typegen      # Сгенерировать типы из схемы
npm run typecheck    # Проверить типы
```

### Импорт данных

```bash
npm run import-json  # Импортировать из JSON файла
```

### Очистка данных

Удаление всех документов определённого типа (сначала снимаются ссылки, затем удаляются документы):

```bash
npm run clear:exhibitions    # Удалить все выставки
npm run clear:galleries      # Удалить все галереи
npm run clear:artists        # Удалить всех художников
```

> ⚠️ Требуется `SANITY_API_TOKEN` с правами на запись в `.env`

### Синхронизация (legacy)

```bash
npm run sync:directus        # Синхронизация с Directus (устаревшее)
```

## Переменные окружения

Создайте `.env` в папке `apps/studio`:

```env

```

## Структура

```
apps/studio/
├── schemaTypes/         # Схемы контента
│   ├── review.ts
│   ├── exhibition.ts
│   ├── gallery.ts
│   ├── artist.ts
│   ├── author.ts
│   ├── guide.ts
│   └── ...
├── scripts/             # Скрипты импорта/очистки
│   ├── clearExhibitions.ts
│   ├── clearGalleries.ts
│   ├── clearArtists.ts
│   └── ...
├── components/          # Кастомные компоненты
├── sanity.config.ts     # Конфигурация Studio
├── structure.ts         # Структура навигации
└── sanity-typegen.json  # Конфигурация TypeGen
```

## Плагины

- `@sanity/vision` — GROQ playground
- `@sanity/dashboard` — Dashboard
- `@sanity/document-internationalization` — Локализация (EN/RU)
- `@sanity/google-maps-input` — Ввод геолокации
- `@sanity/color-input` — Выбор цвета
- `@sanity/table` — Табличные данные
