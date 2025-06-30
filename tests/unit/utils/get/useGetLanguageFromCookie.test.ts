import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGetLanguageFromCookie } from '../../../../composables/utils/get/useGetLanguageFromCookie'

// Мокаем i18n
vi.mock('../../../../i18n/i18n', () => ({
  defaultLocale: 'en'
}))

describe('useGetLanguageFromCookie', () => {
  // Сохраняем оригинальные значения
  const originalDocument = global.document
  const originalWindow = global.window

  beforeEach(() => {
    // Мокаем document для каждого теста
    global.document = {
      cookie: ''
    } as any
  })

  afterEach(() => {
    // Восстанавливаем оригинальные значения
    global.document = originalDocument
    global.window = originalWindow
  })

  it('should return default locale when document is undefined (SSR)', () => {
    // Имитируем серверную среду
    global.document = undefined as any
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('en')
  })

  it('should return language from cookie when present', () => {
    global.document.cookie = 'i18n_lang=ru; other=value'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('ru')
  })

  it('should return language from cookie with different position', () => {
    global.document.cookie = 'other=value; i18n_lang=sr; another=test'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('sr')
  })

  it('should return default locale when i18n_lang cookie is not present', () => {
    global.document.cookie = 'other=value; different=test'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('en')
  })

  it('should return default locale when cookies are empty', () => {
    global.document.cookie = ''
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('en')
  })

  it('should handle cookie with spaces correctly', () => {
    global.document.cookie = 'other=value; i18n_lang=de ; another=test'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('de')
  })

  it('should handle cookie with spaces around the name', () => {
    global.document.cookie = 'other=value;  i18n_lang=fr  ; another=test'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('fr')
  })

  it('should return first matching cookie if multiple exist', () => {
    // Это не должно происходить в реальности, но тестируем edge case
    global.document.cookie = 'i18n_lang=es; other=value; i18n_lang=it'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('es')
  })

  it('should handle empty cookie value', () => {
    global.document.cookie = 'other=value; i18n_lang=; another=test'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('')
  })

  it('should handle cookie without equals sign', () => {
    global.document.cookie = 'other=value; invalidcookie; i18n_lang=pt'
    
    const result = useGetLanguageFromCookie()
    expect(result).toBe('pt')
  })

  it('should handle various language codes', () => {
    const testCases = [
      { cookie: 'i18n_lang=en-US', expected: 'en-US' },
      { cookie: 'i18n_lang=zh-CN', expected: 'zh-CN' },
      { cookie: 'i18n_lang=sr-Latn-RS', expected: 'sr-Latn-RS' },
      { cookie: 'i18n_lang=bs', expected: 'bs' },
      { cookie: 'i18n_lang=hr', expected: 'hr' }
    ]

    testCases.forEach(({ cookie, expected }) => {
      global.document.cookie = cookie
      expect(useGetLanguageFromCookie()).toBe(expected)
    })
  })

  describe('edge cases', () => {
    it('should handle malformed cookies gracefully', () => {
      global.document.cookie = 'malformed;i18n_lang=test;=value'
      
      const result = useGetLanguageFromCookie()
      expect(result).toBe('test')
    })

    it('should handle cookie with special characters', () => {
      global.document.cookie = 'i18n_lang=test-locale_123'
      
      const result = useGetLanguageFromCookie()
      expect(result).toBe('test-locale_123')
    })

    it('should handle very long cookie strings', () => {
      const longValue = 'a'.repeat(1000)
      global.document.cookie = `other=${longValue}; i18n_lang=ru; more=${longValue}`
      
      const result = useGetLanguageFromCookie()
      expect(result).toBe('ru')
    })
  })
}) 