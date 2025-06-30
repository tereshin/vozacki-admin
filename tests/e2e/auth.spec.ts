import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу входа перед каждым тестом
    await page.goto('/login')
  })

  test('should display login form correctly', async ({ page }) => {
    // Проверяем наличие формы входа
    await expect(page.locator('form')).toBeVisible()
    
    // Проверяем наличие полей email и password
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Проверяем наличие кнопки входа
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Проверяем заголовок страницы
    await expect(page.locator('h1, h2')).toContainText(/log in/i)
  })

  test('should have disabled submit button for empty fields', async ({ page }) => {
    // Проверяем, что кнопка входа отключена при пустых полях
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // Заполняем только email и проверяем, что кнопка все еще отключена
    await page.fill('input[type="email"]', 'test@example.com')
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // Очищаем email и заполняем только password
    await page.fill('input[type="email"]', '')
    await page.fill('input[type="password"]', 'password')
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
    
    // Заполняем оба поля и проверяем, что кнопка становится активной
    await page.fill('input[type="email"]', 'test@example.com')
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Заполняем неверные данные
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // Отправляем форму
    await page.locator('button[type="submit"]').click()
    
    // Ожидаем сообщение об ошибке
    await expect(page.locator('.error, .p-message-error, [role="alert"]')).toBeVisible()
    
    // Проверяем, что остались на странице входа
    await expect(page).toHaveURL(/\/login/)
  })

  test('should login with demo credentials and redirect to dashboard', async ({ page }) => {
    // Получаем demo учетные данные из runtime config
    const email = process.env.DEMO_EMAIL || 'demo@vozacki.rs'
    const password = process.env.DEMO_PASSWORD || 'password'
    
    // Заполняем форму с demo данными
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    
    // Отправляем форму
    await page.locator('button[type="submit"]').click()
    
    // Ожидаем переадресации на dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Проверяем, что пользователь авторизован (наличие элементов интерфейса)
    await expect(page.locator('.p-drawer-open')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Сначала авторизуемся
    const email = process.env.DEMO_EMAIL || 'demo@vozacki.rs'
    const password = process.env.DEMO_PASSWORD || 'password'
    
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.locator('button[type="submit"]').click()
    
    // Ожидаем переадресации на dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Находим и кликаем на меню пользователя или кнопку выхода
    const logoutTrigger = page.locator('.logout-button').first()
    await logoutTrigger.click()
    
    // Ожидаем переадресации на страницу входа
    await expect(page).toHaveURL('/login')
    
    // Проверяем, что форма входа снова видна
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('should redirect to login when accessing protected page without auth', async ({ page }) => {
    // Пытаемся перейти на защищенную страницу без авторизации
    await page.goto('/dashboard')
    
    // Ожидаем переадресации на страницу входа
    await expect(page).toHaveURL('/login')
  })

  test('should persist session after page refresh', async ({ page }) => {
    // Авторизуемся
    const email = process.env.DEMO_EMAIL || 'demo@vozacki.rs'
    const password = process.env.DEMO_PASSWORD || 'password'
    
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.locator('button[type="submit"]').click()
    
    await expect(page).toHaveURL('/dashboard')
    
    // Обновляем страницу
    await page.reload()
    
    // Проверяем, что остались авторизованными
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('.p-drawer-open')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Имитируем отсутствие сети
    await page.route('/api/auth/login', route => route.abort())
    
    // Пытаемся войти
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.locator('button[type="submit"]').click()
    
    // Ожидаем сообщение об ошибке сети
    await expect(page.locator('.error, .p-message-error, [role="alert"]')).toBeVisible()
    
    // Проверяем, что остались на странице входа
    await expect(page).toHaveURL(/\/login/)
  })
}) 