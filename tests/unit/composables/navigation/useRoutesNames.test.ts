import { describe, it, expect } from 'vitest'

// Благодаря алиасу в vitest.config.ts импорт @typed-router
// резолвится в tests/__mocks__/@typed-router.ts
import { routesNames as mockRoutes } from '@typed-router'
import { useRoutesNames } from '~/composables/navigation/useRoutesNames'

describe('useRoutesNames', () => {
  it('возвращает объект routesNames', () => {
    const routes = useRoutesNames()
    expect(routes).toBe(mockRoutes)
  })

  it('содержит ожидаемые ключи маршрутов', () => {
    const r: any = useRoutesNames()
    expect(r.home).toBe('home')
    expect(r.dashboard).toBe('dashboard')
  })
}) 