# Статус интеграции: Sanity ↔ Supabase ↔ GraphQL

## ✅ Реализованная архитектура

### 1. Reviews + Exhibitions (Sanity → Supabase)

**Как это работает:**

```
Supabase (exhibition_submissions) 
    ↓ [админ одобряет]
AdminModeration → syncExhibitionToSanity()
    ↓
Sanity (exhibition document с supabaseId)
    ↓
Review может ссылаться через reference
```

**Потоки данных:**

1. **Галерея создаёт выставку** через GalleryExhibitionForm
   - Данные сохраняются в `exhibition_submissions` (Supabase)
   - Статус: `pending`

2. **Админ одобряет** через AdminModeration
   - `handleApprove()` вызывает `syncExhibitionToSanity()`
   - Создается документ `exhibition` в Sanity с полем `supabaseId`
   - В Supabase обновляется `approved_at` и `sanity_exhibition_id`

3. **Редактор создаёт review** в Sanity Studio
   - Может выбрать exhibition по reference
   - Exhibition уже содержит `supabaseId` для обратной связи
   - Query в GROQ возвращает `supabaseId` и `graphqlId`

**Файлы:**
- Schema: `apps/studio/schemaTypes/exhibition.ts` (поля `supabaseId`, `graphqlId`)
- Sync: `apps/web/lib/sanitySync.ts` (функция `syncExhibitionToSanity`)
- Admin: `apps/web/pages/AdminModeration.tsx` (вызов sync при approve)
- Query: `apps/web/sanity/lib/queries.ts` (REVIEW_QUERY возвращает supabaseId)

---

### 2. Guides + Galleries (Sanity → GraphQL Catalog)

**Как это работает:**

```
GraphQL API (глобальный каталог галерей)
    ↓
GraphqlGalleryInput (поиск в Studio)
    ↓
Guide stop с externalGalleryReference
    ↓
Frontend гидратирует через fetchGalleryById()
```

**Потоки данных:**

1. **Редактор создаёт guide** в Sanity Studio
   - Добавляет stops (остановки маршрута)
   - Для каждого stop может выбрать:
     - **Sanity gallery** (через reference) — редакторские галереи
     - **GraphQL gallery** (через GraphqlGalleryInput) — глобальный каталог

2. **Выбор external gallery:**
   - Компонент `GraphqlGalleryInput` делает поиск по GraphQL API
   - Сохраняет `externalGalleryReference` с полями:
     - `id` (GraphQL gallery ID)
     - `name`, `city`, `address`, `website`

3. **Frontend рендерит guide:**
   - `GuideView` загружает guide через GROQ query
   - `hydrateStops()` извлекает все `externalGallery.id`
   - Вызывает `fetchGalleryById()` для каждого ID
   - Обогащает stops полной информацией из GraphQL

**Файлы:**
- Schema: `apps/studio/schemaTypes/guide/index.ts` (stops с gallery + externalGallery)
- Schema: `apps/studio/schemaTypes/externalGalleryReference.ts` (тип для GraphQL galleries)
- Input: `apps/studio/schemaTypes/guide/GraphqlGalleryInput.tsx` (UI для выбора)
- Frontend: `apps/web/pages/GuideView.tsx` (гидратация через GraphQL)
- Query: `apps/web/sanity/lib/queries.ts` (GUIDE_QUERY возвращает externalGallery)
- GraphQL: `apps/web/lib/graphql.ts` (fetchGalleryById)

---

### 3. Galleries (Supabase → Sanity sync опционален)

**Текущее состояние:**

- Sanity `gallery` имеет поля `supabaseId` и `graphqlId`
- Можно вручную создавать gallery в Sanity и указывать external IDs
- Автоматическая синхронизация галерей **пока не реализована** (только exhibitions)

**Если нужна автосинхронизация галерей:**
```typescript
// В apps/web/lib/sanitySync.ts можно добавить:
export async function syncGalleryToSanity(supabaseGallery: GalleryRow) {
  // Аналогично syncExhibitionToSanity
  // Проверить существование, создать/обновить
}
```

---

## 🔐 Переменные окружения

Для работы интеграции необходимы:

### Sanity Write Token (для sync)
```bash
# apps/web/.env
VITE_SANITY_WRITE_TOKEN=sk...  # токен с Editor permissions
```

### GraphQL API (для guide galleries)
```bash
# apps/web/.env + apps/studio/.env
VITE_GRAPHQL_ENDPOINT=https://...appsync-api...amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=da2-...
```

---

## 📊 Схема данных

### Exhibition connections:
```
┌─────────────────┐
│ Supabase        │
│ exhibitions     │─────┐ supabaseId
│ _submissions    │     │
└─────────────────┘     │
                        ↓
                ┌────────────────┐
                │ Sanity         │
                │ exhibition     │───┐
                │ (supabaseId)   │   │ reference
                └────────────────┘   │
                                     ↓
                             ┌───────────────┐
                             │ Sanity        │
                             │ review        │
                             └───────────────┘
```

### Guide Gallery connections:
```
┌──────────────────┐
│ GraphQL API      │
│ Global Galleries │─────┐ external ID
└──────────────────┘     │
                         ↓
                 ┌────────────────────┐
                 │ Sanity             │
                 │ guide.stops[]      │
                 │ externalGallery    │
                 └────────────────────┘
                         │
                         │ reference (опционально)
                         ↓
                 ┌────────────────────┐
                 │ Sanity             │
                 │ gallery            │
                 │ (graphqlId)        │
                 └────────────────────┘
```

---

## ✅ Что работает

1. ✅ **Exhibition sync**: Supabase submissions → Sanity exhibitions (при approve)
2. ✅ **Review → Exhibition**: Sanity reviews могут ссылаться на synced exhibitions
3. ✅ **Guide → External Gallery**: Guide stops могут выбирать галереи из GraphQL
4. ✅ **Guide → Sanity Gallery**: Guide stops могут ссылаться на редакторские галереи
5. ✅ **Frontend hydration**: GuideView загружает GraphQL galleries на лету
6. ✅ **Type safety**: TypeScript типы синхронизированы через typegen

---

## 🔄 Workflow примеры

### Создание Review для выставки из Supabase:

1. Галерея подаёт exhibition через dashboard → сохраняется в Supabase
2. Админ одобряет в AdminModeration → создается в Sanity с `supabaseId`
3. Редактор в Sanity Studio создаёт review
4. Выбирает exhibition по reference
5. Публикует review → пользователи видят на сайте
6. Review автоматически связан с оригинальной записью в Supabase (через supabaseId)

### Создание Weekend Guide с внешними галереями:

1. Редактор в Sanity Studio создаёт guide "Weekend in Berlin"
2. Добавляет stop #1:
   - Вводит название в GraphQL gallery picker
   - Выбирает "Berlinische Galerie" из глобального каталога
   - Сохраняется `externalGallery {id, name, city, address}`
3. Добавляет stop #2:
   - Выбирает редакторскую галерею через Sanity reference
4. Публикует guide
5. На фронтенде GuideView:
   - Загружает guide через GROQ
   - Вызывает GraphQL API для stop #1 (получает полную информацию)
   - Использует Sanity reference для stop #2
   - Отображает оба stops с единым интерфейсом

---

## 🚀 Готово к использованию

Система полностью интегрирована и готова к работе. Убедитесь что:

1. ✅ Переменные окружения настроены (VITE_SANITY_WRITE_TOKEN, VITE_GRAPHQL_*)
2. ✅ Sanity токен имеет Editor permissions
3. ✅ GraphQL API доступен из браузера (CORS настроен)
4. ✅ Запущены `npm run typegen` после изменений схем

**Все запрошенные связки работают:**
- Reviews ↔ Exhibitions (Sanity ↔ Supabase) ✅
- Guides ↔ Galleries (Sanity ↔ GraphQL) ✅
