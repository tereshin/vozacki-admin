# Руководство по кэшированию IndexedDB

## Обзор

Система кэширования IndexedDB автоматически сохраняет данные таблиц `languages` и `roles` в локальной базе данных браузера для быстрого доступа и работы в офлайн режиме.

## Архитектура

### Файлы системы кэширования

1. **`composables/utils/useIndexedDB.ts`** - Низкоуровневая утилита для работы с IndexedDB
2. **`composables/useCacheManager.ts`** - Менеджер кэша с логикой обновления и синхронизации
3. **`composables/useCachedData.ts`** - Высокоуровневый API для работы с кэшированными данными
4. **`plugins/cache-manager.client.ts`** - Плагин для автоматической инициализации кэша

### Структура базы данных IndexedDB

- **Название БД**: `VozackiAdminCache`
- **Версия**: 2
- **Хранилища**:
  - `languages` - кэш языков (индекс: `code`)
  - `roles` - кэш ролей (индекс: `code`)

## Использование

### Основные методы

```typescript
// Получение кэшированных данных
const { 
  loadLanguages, 
  loadRoles, 
  loadActiveLanguages,
  getLanguageByCode,
  getRoleById,
  refreshCache
} = useCachedData()

// Загрузка всех языков
const languages = await loadLanguages()

// Загрузка только активных языков
const activeLanguages = await loadActiveLanguages()

// Загрузка всех ролей
const roles = await loadRoles()

// Поиск языка по коду
const language = await getLanguageByCode('en')

// Принудительное обновление кэша
await refreshCache()
```

### Использование в компонентах

```vue
<template>
  <div>
    <select v-model="selectedLanguage">
      <option 
        v-for="option in languageOptions" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
const { languageOptions, loadLanguages } = useCachedData()

// Загружаем языки при монтировании компонента
onMounted(async () => {
  await loadLanguages()
})
</script>
```

### Реактивные опции для селектов

```typescript
const { 
  languageOptions,     // Все языки
  activeLanguageOptions, // Только активные языки
  roleOptions          // Все роли
} = useCachedData()
```

## Автоматическая инициализация

Кэш автоматически инициализируется при загрузке приложения через плагин `cache-manager.client.ts`. 

### Умная логика обновления:

1. **Проверка наличия данных**: При инициализации проверяется наличие языков и ролей в IndexedDB
2. **Селективная загрузка**: Если отсутствуют только языки или только роли, загружаются только недостающие данные
3. **Периодическое обновление**: Данные обновляются полностью каждый час
4. **Пропуск ненужных запросов**: Если данные есть и не устарели, запросы к серверу не выполняются

```
Логика работы:
- Нет данных → Селективная загрузка недостающих
- Есть данные, но устарели → Полное обновление
- Есть актуальные данные → Пропуск запросов
```

## Обработка ошибок

Система включает fallback на API серверов если кэш недоступен:

```typescript
const getCachedLanguages = async (): Promise<LanguageResource[]> => {
  try {
    await initializeCache()
    return await getLanguages()
  } catch (error) {
    console.error('Failed to get cached languages:', error)
    // Fallback к API если кэш недоступен
    const response = await languagesApi.getLanguages({ per_page: 1000 })
    return response.data.collection
  }
}
```

## Мониторинг состояния кэша

```typescript
const { getCacheStatus } = useCacheManager()

const status = await getCacheStatus()
console.log({
  isInitialized: status.isInitialized,
  isLoading: status.isLoading,
  lastUpdate: status.lastUpdate,
  shouldUpdate: status.shouldUpdate,
  hasLanguages: status.hasLanguages,
  hasRoles: status.hasRoles,
  isEmpty: status.isEmpty
})
```

## Очистка кэша

```typescript
const { clearCache } = useIndexedDB()

// Полная очистка кэша
await clearCache()
```

## Преимущества

1. **Быстрый доступ**: Данные загружаются локально без запросов к серверу
2. **Офлайн поддержка**: Приложение работает с кэшированными данными без интернета
3. **Автоматическое обновление**: Кэш обновляется периодически или по требованию
4. **Fallback механизм**: При недоступности кэша используется API сервера
5. **Индексированные поиски**: Быстрый поиск по кодам и статусам

## Настройки

- **Время жизни кэша**: 1 час (можно изменить в `useCacheManager.ts`)
- **Размер страницы для загрузки**: 1000 записей
- **Автоматическая инициализация**: Включена через плагин 