import { describe, it, expect } from 'vitest'
import { useConfig } from '~/composables/core/config/useConfig'

describe('useConfig', () => {
  it('возвращает объект конфигурации', () => {
    const cfg = useConfig()
    expect(cfg).toHaveProperty('isSuperAdmin', true)
  })
}) 