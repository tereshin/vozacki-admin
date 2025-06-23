# Разделение Webpack Бандлов по Разделам

## Обзор

Проект настроен для создания отдельных webpack бандлов для каждого основного раздела приложения:

- **Login** (`/login`) - авторизация
- **Dashboard** (`/dashboard`) - главная панель
- **Articles** (`/articles`) - управление статьями
- **Tests** (`/tests`) - управление тестами

## Структура Бандлов

### Основные разделы
```
login-section.js        # Страница логина + компоненты авторизации
dashboard-section.js    # Главная панель + dashboard компоненты
articles-section.js     # Статьи + API + store + типы
tests-section.js        # Тесты + вопросы + ответы + связанные API
```

### Вендорные библиотеки
```
vendor-primevue.js      # PrimeVue компоненты
vendor-supabase.js      # Supabase клиент
vendor-ui.js           # Vue/Nuxt фреймворк
```

### Общие компоненты
```
base-components.js      # Базовые переиспользуемые компоненты
shared-composables.js   # Общие composables
shared-store.js        # Общие store модули
```

## Конфигурация

### Основная конфигурация (nuxt.config.ts)

Бандлы настроены через две стратегии:

1. **Vite rollupOptions.manualChunks** - для статического разделения
2. **Webpack splitChunks.cacheGroups** - для динамического разделения

### Дополнительные файлы

- `webpack.chunks.config.js` - детальная конфигурация chunks
- `plugins/bundle-analyzer.client.ts` - клиентский анализатор загрузки
- `scripts/analyze-bundles.js` - серверный анализатор после сборки

## Использование

### Сборка с анализом
```bash
# Обычная сборка
npm run build

# Сборка с анализом размеров
npm run build:analyze

# Полный отчет (сборка + анализ)
npm run build:report

# Только анализ существующей сборки
npm run analyze
```

### Отладка в браузере

После загрузки приложения в development режиме:

```javascript
// В консоли браузера
window.__BUNDLE_ANALYTICS__

// Просмотр загруженных чанков для текущего раздела
console.log(window.__BUNDLE_ANALYTICS__.currentSection);
console.log(window.__BUNDLE_ANALYTICS__.loadedChunks);
```

## Оптимизация производительности

### Lazy Loading

Каждый раздел загружается только при переходе на соответствующую страницу. Это достигается через:

1. **Route-based splitting** - автоматическое разделение по страницам
2. **Component-based splitting** - разделение компонентов по разделам
3. **API-based splitting** - разделение API методов по функциональности

### Prefetching

Для улучшения UX можно настроить предзагрузку часто используемых разделов:

```vue
<!-- В компоненте навигации -->
<NuxtLink 
  to="/articles" 
  :prefetch="true"
>
  Статьи
</NuxtLink>
```

### Кэширование

Вендорные библиотеки и базовые компоненты кэшируются отдельно и обновляются реже.

## Мониторинг

### Автоматический анализ

При разработке в консоли браузера отображается информация о загруженных чанках:

```
📦 Bundle Analytics - articles
Total chunks loaded: 5
Total size: 245.67 KB
Section-specific chunks:
  - articles-section.hash.js: 89.23 KB
```

### Анализ после сборки

Скрипт `analyze-bundles.js` предоставляет детальный отчет:

```
📊 Bundle Analysis Report
==================================================

📦 JavaScript Bundles by Section:

ARTICLES Section:
  Total: 156.78 KB (52.34 KB gzipped)
    main-articles.js: 89.23 KB (28.45 KB gzipped)
    articles-api.js: 67.55 KB (23.89 KB gzipped)

💡 Recommendations:
  ✅ Bundles are properly separated by sections
  ✅ Use browser DevTools to verify lazy loading
```

## Рекомендации

### Размеры бандлов

- **Критично**: > 500 KB для одного раздела
- **Предупреждение**: > 250 KB для одного раздела  
- **Оптимально**: < 150 KB для одного раздела

### Дальнейшая оптимизация

1. **Tree shaking** - убедитесь, что неиспользуемый код удаляется
2. **Dynamic imports** - используйте динамические импорты для редко используемых компонентов
3. **Compression** - включите gzip/brotli сжатие на сервере

### Отладка проблем

```bash
# Если бандлы не разделяются корректно
npm run build:analyze

# Проверьте в отчете:
# 1. Есть ли отдельные файлы для каждого раздела
# 2. Нет ли дублирования кода между разделами
# 3. Правильно ли категоризированы файлы
```

## Техническая реализация

### Приоритеты splitChunks

```javascript
// Порядок приоритетов:
priority: 30  // Основные разделы (login, dashboard, articles, tests)
priority: 20  // Вендорные библиотеки (primevue, supabase)
priority: 15  // UI фреймворки (vue, nuxt)
priority: 10  // Общие компоненты и утилиты
```

### Паттерны именования

- `{section}-section.{hash}.js` - основные разделы
- `vendor-{library}.{hash}.js` - вендорные библиотеки
- `shared-{type}.{hash}.js` - общие компоненты

## Устранение неполадок

### Бандлы не создаются

1. Проверьте правильность регулярных выражений в `cacheGroups`
2. Убедитесь, что файлы существуют по указанным путям
3. Проверьте приоритеты - более высокий приоритет должен быть у более специфичных правил

### Дублирование кода

1. Проверьте конфликты между `manualChunks` и `splitChunks`
2. Убедитесь, что общие зависимости выделены в отдельные чанки
3. Используйте `enforce: true` для принудительного создания чанков

### Большие размеры бандлов

1. Проверьте импорты - возможно, импортируется вся библиотека вместо отдельных модулей
2. Используйте tree shaking для удаления неиспользуемого кода
3. Рассмотрите возможность lazy loading для тяжелых компонентов 