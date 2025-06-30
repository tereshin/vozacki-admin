# Тестирование Vozacki Admin

## 🏗️ Архитектура тестирования

Проект использует трехуровневую пирамиду тестирования:

```
    /\     E2E Tests (Playwright) - Полные пользовательские сценарии
   /  \    ~~~~~~~~~~~~~~~~
  /____\   Integration Tests (Vitest + Testing Library) - Компоненты + API
 /______\  Unit Tests (Vitest) - Отдельные функции и composables
/__________\
```

## 📁 Структура тестов

```
tests/
├── unit/                    # Юнит-тесты
│   ├── composables/         # Тесты композаблов
│   ├── utils/              # Тесты утилит
│   └── stores/             # Тесты Pinia stores
├── integration/            # Интеграционные тесты
│   ├── components/         # Тесты Vue компонентов
│   └── pages/              # Тесты страниц
├── e2e/                    # E2E тесты
│   ├── auth.spec.ts        # Тесты авторизации
│   ├── articles.spec.ts    # Тесты статей
│   └── tests.spec.ts       # Тесты экзаменов
├── fixtures/               # Тестовые данные
├── mocks/                  # Моки для тестов
└── setup/                  # Настройки тестирования
```

## 🚀 Команды для запуска

### Unit & Integration тесты (Vitest)
```bash
# Запуск всех тестов
npm run test

# Запуск с UI интерфейсом
npm run test:ui

# Одноразовый запуск
npm run test:run

# Запуск с покрытием кода
npm run test:coverage
```

### E2E тесты (Playwright)
```bash
# Установка браузеров (только первый раз)
npm run test:e2e:install

# Запуск E2E тестов
npm run test:e2e

# Запуск с UI интерфейсом
npm run test:e2e:ui
```

## 🎯 Что тестируем

### Высокий приоритет (обязательно):
- ✅ **Авторизация** - вход/выход, проверка токенов
- ✅ **CRUD операции** - создание, чтение, обновление, удаление
- ✅ **Роутинг** - переадресация, защищенные страницы
- ✅ **Валидация форм** - корректность введенных данных

### Средний приоритет:
- 🔄 **Composables** - переиспользуемая логика
- 🔄 **Stores (Pinia)** - управление состоянием
- 🔄 **API интеграция** - взаимодействие с backend

### Низкий приоритет:
- 🔄 **UI компоненты** - визуальные элементы
- 🔄 **Интернационализация** - переводы

## 📊 Метрики покрытия

### Цели:
- **Unit Tests**: 80%+ покрытие функций
- **Integration Tests**: Критические пользовательские сценарии
- **E2E Tests**: Основные бизнес-процессы

### Текущие пороги в vitest.config.ts:
```typescript
thresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

## 🛠️ Написание тестов

### Unit Test пример:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { useAuthApi } from '~/composables/api/useAuthApi'

describe('useAuthApi', () => {
  it('should login successfully', async () => {
    vi.mocked($fetch).mockResolvedValue({ user: mockUser })
    
    const { login } = useAuthApi()
    const result = await login('test@example.com', 'password')
    
    expect(result.user.email).toBe('test@example.com')
  })
})
```

### E2E Test пример:
```typescript
import { test, expect } from '@playwright/test'

test('should login and redirect to dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'demo@vozacki.rs')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

## 🔧 Настройка CI/CD

Тесты настроены для автоматического запуска в GitHub Actions:

```yaml
- name: Run Unit Tests
  run: npm run test:run

- name: Run E2E Tests  
  run: npm run test:e2e
```

## 🐛 Отладка тестов

### Vitest:
- Используйте `console.log()` для отладки
- Запускайте `npm run test:ui` для интерактивной отладки
- Используйте `.only()` для запуска конкретного теста

### Playwright:
- Используйте `await page.pause()` для остановки выполнения
- Запускайте с `--debug` для пошагового выполнения
- Используйте `--headed` для просмотра браузера

## 📝 Соглашения

1. **Имена файлов**: `*.test.ts` для unit/integration, `*.spec.ts` для E2E
2. **Описания**: Используйте `describe()` для группировки связанных тестов
3. **Моки**: Размещайте в папке `mocks/`, используйте в `setup/`
4. **Фикстуры**: Тестовые данные в `fixtures/`
5. **Селекторы**: Предпочитайте `data-testid` атрибуты для стабильности

## 🚨 Важные замечания

1. **Не коммитьте** падающие тесты
2. **Очищайте моки** в `beforeEach()`
3. **Используйте типы** TypeScript везде
4. **Тестируйте граничные случаи** и ошибки
5. **Документируйте сложные тесты** комментариями 