# 🚀 Быстрый Гайд: Разделение Бандлов

## Команды для ежедневной работы

```bash
# Сборка + анализ размеров
npm run build:analyze

# Только анализ (после сборки)
npm run analyze

# Разработка с отладкой
npm run dev
```

## Что получили

✅ **37 отдельных JS файлов** вместо 12  
✅ **Автоматическое lazy loading** для каждого раздела  
✅ **75.1% сжатие** с gzip (648KB из 2.5MB)  
✅ **Отдельные chunks** для вендорных библиотек  

## Как работает

### Автоматическое разделение:
- `/login` → отдельный chunk при переходе
- `/dashboard` → отдельный chunk при переходе  
- `/articles` → отдельный chunk при переходе
- `/tests` → отдельный chunk при переходе

### Мониторинг в браузере:
```javascript
// Открой DevTools Console
window.__BUNDLE_ANALYTICS__
```

## Файлы конфигурации

- `nuxt.config.ts` - основная конфигурация Vite
- `app.vue` - динамические импорты разделов
- `plugins/bundle-analyzer.client.ts` - клиентский анализатор
- `scripts/analyze-bundles.cjs` - серверный анализатор

## Troubleshooting

**Проблема**: Большие размеры бандлов  
**Решение**: `npm run analyze` → проверить рекомендации

**Проблема**: Медленная загрузка раздела  
**Решение**: Проверить динамические импорты в `app.vue`

**Проблема**: Не видно разделения  
**Решение**: Убедиться что сборка production (`npm run build`)

---
*Полная документация: `docs/BUNDLE_SPLITTING.md` и `docs/BUNDLE_RESULTS.md`* 