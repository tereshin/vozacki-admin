# API безопасности для статей

## Обзор

Все операции с статьями теперь выполняются через защищенные backend API endpoints с проверкой ролей пользователей.

## Система разрешений

### Типы разрешений

1. **`view_content`** - просмотр контента
   - Доступен ролям: `administrator`, `moderator`, `user`
   - Используется для: получение списка статей, просмотр одной статьи

2. **`manage_content`** - управление контентом  
   - Доступен ролям: `administrator`, `moderator`
   - Используется для: создание, обновление, удаление статей

## API Endpoints

### GET `/api/articles`
- **Назначение**: Получение списка статей
- **Разрешение**: `view_content`
- **Параметры**: page, per_page, search, language_id, category_uid, sort_field, sort_order

### GET `/api/articles/[id]`  
- **Назначение**: Получение одной статьи
- **Разрешение**: `view_content`

### POST `/api/articles`
- **Назначение**: Создание новой статьи
- **Разрешение**: `manage_content` 
- **Тело запроса**: ArticleRequest

### PUT `/api/articles/[id]`
- **Назначение**: Обновление статьи
- **Разрешение**: `manage_content`
- **Тело запроса**: ArticleUpdateRequest

### DELETE `/api/articles/[id]`
- **Назначение**: Удаление статьи  
- **Разрешение**: `manage_content`

## Изменения в клиентском API

Composable `useArticlesApi()` теперь использует HTTP запросы к backend endpoints вместо прямых Supabase вызовов:

```typescript
// Раньше (прямой Supabase)
const { data, error } = await supabase
  .from('articles')
  .insert(body)

// Сейчас (через backend API)
const response = await $fetch('/api/articles', {
  method: 'POST',
  body
})
```

## Типизация EditorJS

Добавлена правильная типизация для контента EditorJS:

```typescript
export interface EditorJSData {
  time?: number
  blocks: EditorJSBlock[]
  version?: string
}

export interface ArticleResource extends Omit<Tables<'articles'>, 'content'> {
  content: EditorJSData
}
```

## Аутентификация

Все запросы к API требуют:
1. Валидный JWT токен в заголовке `Authorization: Bearer <token>`
2. Соответствующую роль пользователя для выполнения операции

## Обработка ошибок

API возвращает стандартные HTTP коды ошибок:
- **401** - Отсутствует или недействительный токен
- **403** - Недостаточно прав доступа  
- **422** - Ошибки валидации данных
- **500** - Внутренняя ошибка сервера

## Безопасность

1. **Проверка токена**: Все endpoints проверяют валидность JWT токена
2. **Проверка ролей**: Каждый endpoint проверяет соответствующие разрешения
3. **Валидация данных**: Server-side валидация всех входящих данных
4. **Типизация**: Строгая типизация предотвращает ошибки типов 