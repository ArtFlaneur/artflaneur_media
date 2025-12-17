# Multi-Tenant Supabase Setup

## Проблема

Один Supabase проект используется для нескольких фронтендов. При регистрации ссылка на подтверждение email уходит на неправильный сайт.

## Решение

### 1. Настройка Supabase Dashboard

Добавьте все домены в Redirect URLs:

```
Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

Добавьте:
✅ https://artflaneur.art/*
✅ https://artflaneur.art/gallery-dashboard
✅ http://localhost:3000/* (для dev)
✅ https://ваш_другой_сайт.com/*
```

**Важно:** Нажмите "Save" после добавления!

### 2. Как работает код

```typescript
// Автоматически использует текущий домен
const redirectTo = `${window.location.origin}/gallery-dashboard`;

await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectTo // Ссылка в email будет на текущий домен
  }
});
```

### 3. Проверка

**Тест на artflaneur.art:**
1. Регистрация → email → ссылка ведет на `https://artflaneur.art/gallery-dashboard`

**Тест на другом сайте:**
1. Регистрация → email → ссылка ведет на `https://другой_сайт.com/...`

**Тест локально:**
1. Регистрация → email → ссылка ведет на `http://localhost:3000/gallery-dashboard`

## Как это работает

```
User на artflaneur.art
  ↓
signUp с emailRedirectTo: "https://artflaneur.art/gallery-dashboard"
  ↓
Supabase отправляет email с правильной ссылкой
  ↓
User кликает → возвращается на artflaneur.art
```

## Другие auth методы

Код также обновлен для:
- ✅ Password reset (resetPassword)
- ✅ Email confirmation (signUp)
- ✅ Magic link (если добавите)

Все используют `window.location.origin` для динамического определения домена.

## Troubleshooting

### Ошибка: "Invalid redirect URL"

**Причина:** URL не добавлен в Supabase Dashboard

**Решение:** Добавьте URL в Authentication → URL Configuration → Redirect URLs

### Email ссылка все еще ведет не туда

**Причина:** Старые settings закешированы

**Решение:**
1. Очистите кеш браузера
2. Проверьте что Supabase Dashboard settings сохранены
3. Попробуйте новую регистрацию

### Localhost не работает

**Причина:** `http://localhost:3000` не добавлен в Redirect URLs

**Решение:** Добавьте `http://localhost:3000/*` в Supabase Dashboard

## Production Checklist

- [ ] Добавлены все production домены в Redirect URLs
- [ ] Проверена регистрация на каждом домене
- [ ] Email links ведут на правильные домены
- [ ] Password reset работает на каждом домене
- [ ] Локальная разработка работает (localhost)
