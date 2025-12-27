# Политика безопасности / Security Policy

## Безопасное хранение ключей / Secure Key Storage

### ⚠️ ВАЖНО / IMPORTANT

**НИКОГДА** не коммитьте файлы с реальными ключами API в репозиторий!

**NEVER** commit files with real API keys to the repository!

### Правильная конфигурация / Proper Configuration

1. **Создайте локальные .env файлы:**
   - `apps/web/.env.local`
   - `apps/studio/.env`

2. **Используйте примеры:**
   - `apps/web/.env.example`
   - `apps/studio/.env.example`

3. **Проверьте .gitignore:**
   Все файлы `.env*` (кроме `.env.example`) должны быть в .gitignore

### Защищенные ключи / Protected Keys

Следующие ключи должны храниться ТОЛЬКО в локальных .env файлах:

- `VITE_SANITY_PROJECT_ID`
- `VITE_SANITY_DATASET`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GRAPHQL_ENDPOINT`
- `VITE_GRAPHQL_API_KEY`
- `GEMINI_API_KEY`
- `SANITY_STUDIO_GRAPHQL_API_KEY`

### Ротация ключей / Key Rotation

Если ключ был случайно закоммичен:

1. **Немедленно** отзовите/измените ключ в соответствующем сервисе
2. Удалите его из истории Git (используйте `git filter-branch` или BFG Repo-Cleaner)
3. Создайте новый ключ
4. Обновите локальные .env файлы

### Для продакшена / For Production

Используйте переменные окружения платформы развертывания:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- AWS: Parameter Store или Secrets Manager

## Сообщить о проблеме безопасности / Report Security Issue

Если вы обнаружили уязвимость безопасности, пожалуйста, НЕ создавайте публичный issue. Отправьте сообщение напрямую maintainer'ам проекта.

If you discover a security vulnerability, please DO NOT create a public issue. Send a direct message to the project maintainers.
