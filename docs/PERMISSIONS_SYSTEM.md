# Система прав доступа

## Обзор

Система прав доступа в приложении основана на ролях пользователей. Каждый администратор имеет определенную роль, которая определяет его права доступа к различным разделам приложения.

## Роли пользователей

### 1. Administrator (administrator)
- **Полный доступ** ко всем разделам приложения
- Может управлять администраторами
- Может управлять ролями
- Может управлять контентом (статьи, тесты)
- Может просматривать все данные

### 2. Moderator (moderator)
- Может управлять контентом (статьи, тесты)
- Может просматривать тесты
- **НЕ может** управлять администраторами
- **НЕ может** управлять ролями

### 3. User (user)
- Может только просматривать тесты
- **НЕ может** управлять контентом
- **НЕ может** управлять администраторами
- **НЕ может** управлять ролями

## Структура системы

### Типы данных

```typescript
// Расширенный тип пользователя с ролью
interface AdministratorUser extends User {
  role?: {
    id: string;
    name: string;
    code: string;
  };
}
```

### Composable для прав доступа

Файл: `composables/usePermissions.ts`

Основные методы:
- `hasRole(roleCode: string)` - проверка конкретной роли
- `isAdministrator` - проверка на администратора
- `isModerator` - проверка на модератора
- `isUser` - проверка на обычного пользователя
- `canAccessAdministrators` - доступ к разделу администраторов
- `canManageRoles` - доступ к управлению ролями
- `canManageContent` - доступ к управлению контентом
- `canViewTests` - доступ к просмотру тестов

### API Endpoints

#### GET /api/auth/me
Возвращает информацию о текущем администраторе с ролью.

### Middleware

Файл: `middleware/auth.ts`

Проверяет:
1. Аутентификацию пользователя
2. Права доступа к защищенным страницам
3. Перенаправляет на dashboard при отсутствии прав

## Использование в компонентах

### Проверка прав в sidebar

```vue
<script setup>
import { usePermissions } from "~/composables/core/auth/usePermissions";

const { canAccessAdministrators, canManageContent } = usePermissions();

// Условное отображение пунктов меню
const menu = computed(() => {
  const menuItems = [];
  
  if (canManageContent.value) {
    menuItems.push({
      name: "Management",
      nav: [/* пункты меню */]
    });
  }
  
  if (canAccessAdministrators.value) {
    menuItems.push({
      name: "Users",
      nav: [/* пункты меню */]
    });
  }
  
  return menuItems;
});
</script>
```

### Проверка прав в компонентах

```vue
<script setup>
import { usePermissions } from "~/composables/core/auth/usePermissions";

const { isAdministrator } = usePermissions();
</script>

<template>
  <div v-if="isAdministrator">
    <!-- Контент только для администраторов -->
  </div>
</template>
```

## Защищенные страницы

### Требуют роль Administrator:
- `/administrators` - управление администраторами
- `/roles` - управление ролями

### Требуют роль Administrator или Moderator:
- `/articles` - управление статьями
- `/tests` - управление тестами

### Доступны всем авторизованным пользователям:
- `/dashboard` - главная страница

## Добавление новых ролей

1. Добавить роль в базу данных (таблица `roles`)
2. Обновить типы в `types/auth.ts` при необходимости
3. Добавить проверки в `composables/usePermissions.ts`
4. Обновить middleware для новых защищенных страниц
5. Обновить sidebar для условного отображения

## Добавление новых защищенных страниц

1. Создать страницу в `pages/`
2. Добавить middleware в `definePageMeta`
3. Добавить проверку прав в `middleware/auth.ts`
4. Добавить пункт меню в sidebar с проверкой прав

## Безопасность

- Все проверки прав выполняются как на клиенте, так и на сервере
- Middleware проверяет права при каждом переходе на защищенную страницу
- API endpoints могут дополнительно проверять права доступа
- Роли хранятся в базе данных и связаны с администраторами через `role_id` 