# Настройка серверного API

Этот документ описывает настройку серверной части приложения для безопасной работы с Supabase.

## 🔧 Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Nuxt Configuration  
NUXT_SECRET_KEY=your_nuxt_secret_key
```

### Где найти ключи Supabase:

1. **SUPABASE_URL** - URL вашего проекта (например: `https://your-project.supabase.co`)
2. **SUPABASE_ANON_KEY** - публичный анонимный ключ для клиентской части
3. **SUPABASE_SERVICE_ROLE_KEY** - секретный ключ с полными правами для серверной части

Ключи можно найти в настройках проекта Supabase:
- Перейдите в Settings → API
- Скопируйте нужные ключи

## 🏗️ Архитектура серверного API

### Структура файлов:

```
server/
├── api/
│   ├── administrators/
│   │   ├── index.get.ts          # GET /api/administrators - список администраторов
│   │   ├── index.post.ts         # POST /api/administrators - создание
│   │   ├── [id].get.ts           # GET /api/administrators/:id - один администратор
│   │   ├── [id].put.ts           # PUT /api/administrators/:id - обновление
│   │   └── [id].delete.ts        # DELETE /api/administrators/:id - удаление
│   └── roles/
│       ├── index.get.ts          # GET /api/roles - список ролей с пагинацией
│       └── all.get.ts            # GET /api/roles/all - все роли
└── utils/
    ├── supabase.ts               # Серверный клиент Supabase
    └── auth.ts                   # Утилиты аутентификации
```

## 🔐 Безопасность

### Аутентификация

Серверные endpoints для изменения данных (POST, PUT, DELETE) требуют аутентификации:

1. **Токен в заголовке**: Клиент должен передавать JWT токен в заголовке `Authorization: Bearer <token>`
2. **Проверка администратора**: Сервер проверяет, что пользователь есть в таблице `administrators`
3. **Валидация токена**: Токен проверяется через Supabase Auth

### Права доступа

- **Чтение (GET)** - доступно всем аутентифицированным пользователям
- **Создание/Изменение/Удаление** - только для администраторов

## 📡 API Endpoints

### Администраторы

| Метод | URL | Описание | Аутентификация |
|-------|-----|----------|----------------|
| GET | `/api/administrators` | Список администраторов с фильтрацией и пагинацией | Нет |
| GET | `/api/administrators/:id` | Получить одного администратора | Нет |
| POST | `/api/administrators` | Создать администратора | Да |
| PUT | `/api/administrators/:id` | Обновить администратора | Да |
| DELETE | `/api/administrators/:id` | Удалить администратора | Да |

### Роли

| Метод | URL | Описание | Аутентификация |
|-------|-----|----------|----------------|
| GET | `/api/roles` | Список ролей с пагинацией | Нет |
| GET | `/api/roles/all` | Все роли (для выпадающих списков) | Нет |

### Параметры запросов

#### GET /api/administrators
```
?page=1&per_page=10&search=john&role_id=uuid&sort_field=email&sort_order=asc
```

#### GET /api/roles
```
?page=1&per_page=10&search=admin&sort_field=name&sort_order=asc
```

## 🔄 Обновление клиентского кода

Клиентские composables были обновлены для использования серверных API вместо прямых вызовов Supabase:

- `composables/api/useAdministratorsApi.ts` - теперь использует `/api/administrators/*`
- `composables/api/useRolesApi.ts` - теперь использует `/api/roles/*`

## 🚀 Преимущества

1. **Безопасность** - секретный ключ Supabase хранится только на сервере
2. **Контроль доступа** - централизованная аутентификация и авторизация
3. **Валидация** - server-side валидация данных
4. **Логирование** - централизованное логирование ошибок
5. **Rate limiting** - возможность добавить ограничения на запросы

## 🛠️ Дополнительные настройки

### CORS (если нужен доступ с других доменов)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    experimental: {
      wasm: true
    },
    cors: {
      origin: ['http://localhost:3000'], // разрешенные домены
      credentials: true
    }
  }
})
```

### Rate Limiting

Можно добавить ограничения на количество запросов:

```typescript
// server/middleware/ratelimit.ts
export default defineEventHandler(async (event) => {
  // Логика rate limiting
})
```

## 🔍 Отладка

Логи серверных ошибок выводятся в консоль. Для продакшена рекомендуется настроить логирование в файлы или внешние сервисы.

```bash
# Запуск в режиме разработки с подробными логами
npm run dev
``` 