# Composables

Эта папка содержит все композаблы (composables) приложения, организованные по функциональности.

## Структура

```
composables/
├── api/                    # API композаблы для работы с серверными данными
├── cache/                  # Композаблы для кеширования данных
├── core/                   # Основные системные композаблы
│   ├── auth/              # Авторизация и права доступа
│   ├── config/            # Конфигурация приложения
│   └── i18n/              # Интернационализация
├── navigation/            # Композаблы для навигации
├── utils/                 # Утилитные композаблы
│   ├── data/              # Работа с данными
│   ├── format/            # Форматирование
│   ├── get/               # Получение данных
│   └── is/                # Проверки условий
└── index.ts               # Главный экспорт всех композаблов
```

## Категории композаблов

### 🔧 Core (Основные)
- **config/** - Конфигурация и настройки приложения
  - `useConfig.ts` - Основная конфигурация
  - `useAppSettings.ts` - Настройки приложения
- **auth/** - Авторизация и безопасность
  - `usePermissions.ts` - Система прав доступа
  - `useSupabase.ts` - Клиент Supabase
- **i18n/** - Интернационализация
  - `useLanguage.ts` - Управление языками интерфейса

### 💾 Cache (Кеширование)
- `useCacheManager.ts` - Основной менеджер кеша
- `useCachedData.ts` - **@deprecated** Общий кеш данных
- `useCachedLanguages.ts` - Кеш языков
- `useCachedRoles.ts` - Кеш ролей

### 🌐 API
Композаблы для работы с API endpoints. Каждый файл соответствует определенной сущности:
- `useAuthApi.ts` - Авторизация
- `useLanguagesApi.ts` - Языки
- `useRolesApi.ts` - Роли
- `useArticlesApi.ts` - Статьи
- И другие...

### 🧭 Navigation
- `useRoutesNames.ts` - Константы имен маршрутов

### 🛠 Utils (Утилиты)
- **data/** - Работа с данными
  - `useIndexedDB.ts` - IndexedDB
  - `useFilters.ts` - Фильтрация
  - `usePageFilters.ts` - Фильтры страниц
- **format/** - Форматирование
  - `useFormatDate.ts` - Форматирование дат
- **get/** - Получение данных
  - `useGetEntityName.ts` - Имена сущностей
  - `useGetIcon.ts` - Иконки
  - `useGetInitials.ts` - Инициалы
  - И другие...
- **is/** - Проверки условий
  - `useIsEmpty.ts` - Проверка на пустоту
  - `useIsLoading.ts` - Проверка загрузки

## Использование

### Импорт из корня (рекомендуется)
```typescript
import { usePermissions, useCacheManager } from '~/composables'
```

### Прямой импорт (для специфических случаев)
```typescript
import { usePermissions } from '~/composables/core/auth/usePermissions'
import { useCacheManager } from '~/composables/cache/useCacheManager'
```

## Миграция

Если вы обновляете существующий код, используйте следующую таблицу:

| Старый путь | Новый путь |
|------------|------------|
| `~/composables/usePermissions` | `~/composables/core/auth/usePermissions` |
| `~/composables/useAppSettings` | `~/composables/core/config/useAppSettings` |
| `~/composables/useCacheManager` | `~/composables/cache/useCacheManager` |
| `~/composables/useLanguage` | `~/composables/core/i18n/useLanguage` |
| `~/composables/useRoutesNames` | `~/composables/navigation/useRoutesNames` |

## Правила добавления новых композаблов

1. **API композаблы** → `api/`
2. **Кеширование** → `cache/`
3. **Конфигурация** → `core/config/`
4. **Авторизация** → `core/auth/`
5. **Интернационализация** → `core/i18n/`
6. **Утилиты** → `utils/` (в соответствующую подпапку)
7. **Навигация** → `navigation/`

Не забудьте добавить экспорт в `index.ts`! 