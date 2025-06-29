# 🔐 Система авторизации - Руководство разработчика

## Обзор

Система использует **backend API авторизацию** с JWT токенами, stored in httpOnly cookies for maximum security.

## 🚀 Быстрый старт

### 1. Frontend использование

```typescript
// Авторизация пользователя
const authStore = useAuthStore()
const result = await authStore.login({ email, password })

if (!result.error) {
  // Успешная авторизация, переадресация произойдет автоматически
}

// Проверка авторизации
const isAuth = authStore.isAuthenticated
const currentUser = authStore.user

// Выход
await authStore.logout()
```

### 2. Backend API защита

```typescript
// Простая проверка авторизации
export default defineEventHandler(async (event) => {
  const payload = requireAuth(event) // Автоматически проверяет JWT
  // payload содержит: id, email, role, supabase_id
})

// Проверка роли
export default defineEventHandler(async (event) => {
  const payload = requireRole(event, ['administrator', 'moderator'])
  // Разрешен доступ только администраторам и модераторам
})
```

### 3. Защищенные API запросы

```typescript
// Автоматически добавляет Authorization header
const { authenticatedFetch } = useAuthenticatedFetch()
const data = await authenticatedFetch('/api/protected-endpoint')
```

## 🔧 Архитектура

### Flow авторизации:
1. **Login** → `POST /api/auth/login`
2. **JWT generation** → Backend creates token with user data
3. **Cookie storage** → httpOnly cookie set automatically  
4. **Automatic auth** → All requests include token
5. **Role checks** → Server validates permissions

### Компоненты:

**Client-side:**
- `useAuthStore()` - главный store авторизации
- `useAuthApi()` - API методы
- `useAuthenticatedFetch()` - защищенные запросы
- `middleware/auth.ts` - защита роутов

**Server-side:**
- `server/api/auth/` - endpoints авторизации
- `server/utils/auth.ts` - JWT utilities
- `requireAuth()` - проверка токена
- `requireRole()` - проверка роли

## 🛡️ Безопасность

### Best Practices:
- JWT токены хранятся в httpOnly cookies
- Время жизни токена: 24 часа
- Проверка ролей на сервере
- Automatic logout при ошибках авторизации
- CSRF protection через SameSite cookies

### Environment Variables:
```bash
JWT_SECRET=your-super-secret-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 📝 Типы

```typescript
interface JwtPayload {
  id: string              // ID администратора
  email: string           // Email
  supabase_id: string     // Supabase User ID
  role: {
    id: string
    name: string
    code: string          // 'administrator', 'moderator', etc.
  }
}

interface LoginRequest {
  email: string
  password: string
}
```

## 🧪 Тестирование

### Debug Endpoints:
```bash
# Статус авторизации
GET /api/debug/auth-status

# Список пользователей  
GET /api/debug/users
```

## 🔄 Миграция со старой системы

**Изменения:**
- ✅ JWT токены вместо Supabase sessions
- ✅ httpOnly cookies вместо localStorage tokens  
- ✅ Backend role validation
- ✅ Unified error handling

**Совместимость:**
- Store API остался прежним: `authStore.isAuthenticated`, `authStore.user`
- Middleware автоматически обрабатывает роли
- `useAuthenticatedFetch()` работает прозрачно

## 🚀 Готово к продакшену

Система полностью готова для развертывания в продакшене со всеми необходимыми мерами безопасности. 