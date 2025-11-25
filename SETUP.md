# Art Flaneur Media - Запуск проекта

Этот проект объединяет Sanity Studio и веб-приложение в единый монорепозиторий.

## Структура проекта

```
artflaneur_media/
├── apps/
│   ├── studio/          # Sanity Studio (CMS)
│   └── web/             # React веб-приложение
├── sanity/
│   └── lib/             # Общая Sanity конфигурация и запросы
└── package.json         # Корневой package.json с workspace конфигурацией
```

## Предварительные требования

- Node.js 18+ 
- pnpm (рекомендуется) или npm
- Учетная запись Sanity (https://www.sanity.io)

## Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <your-repo-url>
   cd artflaneur_media
   ```

2. **Установите зависимости**
   ```bash
   pnpm install
   ```

3. **Настройте переменные окружения**

   В `apps/studio/.env` уже указаны:
   ```
   SANITY_STUDIO_PROJECT_ID=o1yl0ri9
   SANITY_STUDIO_DATASET=blog
   ```

   В `apps/web/.env.local` уже указаны:
   ```
   VITE_SANITY_PROJECT_ID=o1yl0ri9
   VITE_SANITY_DATASET=blog
   VITE_SANITY_API_VERSION=2024-01-01
   VITE_SANITY_STUDIO_URL=http://localhost:3333
   ```

   Если вам нужно использовать другой проект Sanity, обновите эти значения.

## Запуск проекта

### Запустить оба приложения одновременно

```bash
pnpm dev
```

Это запустит:
- Sanity Studio на http://localhost:3333
- Веб-приложение на http://localhost:3000

### Запустить приложения раздельно

**Запустить только Studio:**
```bash
pnpm dev:studio
```

**Запустить только Web:**
```bash
pnpm dev:web
```

## Генерация типов TypeScript

После изменения схемы в Sanity Studio, сгенерируйте типы:

```bash
pnpm typegen
```

Это создаст файл `apps/web/sanity/types.ts` с TypeScript типами для вашей схемы.

## Сборка для production

```bash
pnpm build
```

Или раздельно:
```bash
pnpm build:studio
pnpm build:web
```

## Проверка типов

```bash
pnpm typecheck
```

## Деплой Sanity Studio

```bash
cd apps/studio
pnpm deploy
```

## Структура данных

Проект использует следующие основные типы контента:
- **reviews** - Обзоры выставок
- **posts** - Статьи и блог-посты
- **exhibitions** - Информация о выставках
- **galleries** - Галереи и музеи
- **artists** - Художники

## Важные файлы

- `sanity/lib/client.ts` - Конфигурация Sanity клиента
- `sanity/lib/queries.ts` - GROQ запросы для получения данных
- `apps/studio/schemaTypes/` - Схемы Sanity
- `apps/web/App.tsx` - Основное React приложение
- `apps/web/main.tsx` - Точка входа React

## Troubleshooting

### Ошибка подключения к Sanity

Убедитесь, что:
1. В `.env` файлах указаны правильные `PROJECT_ID` и `DATASET`
2. Вы имеете доступ к проекту Sanity
3. Dataset существует в вашем проекте

### Ошибки TypeScript

Запустите:
```bash
pnpm typegen
pnpm typecheck
```

### Проблемы с зависимостями

Удалите `node_modules` и `pnpm-lock.yaml`, затем переустановите:
```bash
rm -rf node_modules pnpm-lock.yaml apps/*/node_modules
pnpm install
```

## Дополнительные команды

- `pnpm --filter studio <command>` - Выполнить команду в studio
- `pnpm --filter web <command>` - Выполнить команду в web
- `cd apps/studio && pnpm import-json` - Импортировать данные из JSON

## Ресурсы

- [Sanity Documentation](https://www.sanity.io/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
