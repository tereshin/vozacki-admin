import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useIndexedDB } from '../../../../../composables/utils/data/useIndexedDB'
import type { LanguageResource } from '../../../../types/languages'
import type { RoleResource } from '../../../../types/administrators'

// Mock данные для тестов
const mockLanguages: LanguageResource[] = [
  {
    id: '1',
    code: 'en',
    name: 'English',
    script: 'Latin',
    is_active: true
  },
  {
    id: '2',
    code: 'ru',
    name: 'Русский',
    script: 'Cyrillic',
    is_active: true
  },
  {
    id: '3',
    code: 'fr',
    name: 'Français',
    script: 'Latin',
    is_active: false
  }
]

const mockRoles: RoleResource[] = [
  {
    id: '1',
    code: 'admin',
    name: 'Administrator',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'editor',
    name: 'Editor',
    created_at: '2023-01-01T00:00:00Z'
  }
]

describe('useIndexedDB', () => {
  let originalIndexedDB: any

  beforeEach(() => {
    // Сохраняем оригинальный indexedDB
    originalIndexedDB = global.indexedDB
    
    // Мокаем IndexedDB API полностью
    global.indexedDB = {
      open: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: null,
        error: null
      }))
    } as any
  })

  afterEach(() => {
    // Восстанавливаем оригинальный indexedDB
    global.indexedDB = originalIndexedDB
    vi.clearAllMocks()
  })

  describe('структура композабла', () => {
    it('должен экспортировать все необходимые методы', () => {
      const composable = useIndexedDB()
      
      expect(composable).toHaveProperty('initDB')
      expect(composable).toHaveProperty('saveLanguages')
      expect(composable).toHaveProperty('saveRoles')
      expect(composable).toHaveProperty('getLanguages')
      expect(composable).toHaveProperty('getRoles')
      expect(composable).toHaveProperty('getActiveLanguages')
      expect(composable).toHaveProperty('saveCacheMeta')
      expect(composable).toHaveProperty('getCacheMeta')
      expect(composable).toHaveProperty('clearCache')
    })

    it('все методы должны быть функциями', () => {
      const composable = useIndexedDB()
      
      expect(typeof composable.initDB).toBe('function')
      expect(typeof composable.saveLanguages).toBe('function')
      expect(typeof composable.saveRoles).toBe('function')
      expect(typeof composable.getLanguages).toBe('function')
      expect(typeof composable.getRoles).toBe('function')
      expect(typeof composable.getActiveLanguages).toBe('function')
      expect(typeof composable.saveCacheMeta).toBe('function')
      expect(typeof composable.getCacheMeta).toBe('function')
      expect(typeof composable.clearCache).toBe('function')
    })
  })

  describe('getActiveLanguages - логика фильтрации', () => {
    it('должен возвращать только активные языки', async () => {
      const composable = useIndexedDB()
      
      // Мокаем getLanguages чтобы он возвращал все языки
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(mockLanguages)

      const result = await composable.getActiveLanguages()

      const expectedActiveLanguages = mockLanguages.filter(lang => lang.is_active === true)
      expect(result).toEqual(expectedActiveLanguages)
      expect(result).toHaveLength(2) // Только английский и русский активны
      expect(result.every((lang: LanguageResource) => lang.is_active === true)).toBe(true)
    })

    it('должен пробросить ошибку из getLanguages', async () => {
      const composable = useIndexedDB()
      
      const testError = new Error('Get languages error')
      vi.spyOn(composable, 'getLanguages').mockRejectedValue(testError)

      await expect(composable.getActiveLanguages()).rejects.toThrow('Get languages error')
    })

    it('должен вернуть пустой массив если getLanguages возвращает пустой массив', async () => {
      const composable = useIndexedDB()
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue([])

      const result = await composable.getActiveLanguages()
      expect(result).toEqual([])
    })

    it('должен правильно фильтровать языки со значением is_active = false', async () => {
      const composable = useIndexedDB()
      
      const mixedLanguages = [
        { ...mockLanguages[0], is_active: true },
        { ...mockLanguages[1], is_active: false },
        { ...mockLanguages[2], is_active: null } // null также должен быть отфильтрован
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(mixedLanguages)

      const result = await composable.getActiveLanguages()
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('en')
    })

    it('должен правильно обрабатывать undefined значения is_active', async () => {
      const composable = useIndexedDB()
      
      const languagesWithUndefined = [
        { ...mockLanguages[0], is_active: true },
        { ...mockLanguages[1], is_active: undefined as any },
        { ...mockLanguages[2], is_active: false }
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(languagesWithUndefined)

      const result = await composable.getActiveLanguages()
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('en')
    })

    it('должен правильно обрабатывать null значения is_active', async () => {
      const composable = useIndexedDB()
      
      const languagesWithNulls = [
        { ...mockLanguages[0], is_active: true },
        { ...mockLanguages[1], is_active: null },
        { ...mockLanguages[2], is_active: false }
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(languagesWithNulls)

      const result = await composable.getActiveLanguages()
      
      // Только языки с is_active === true должны быть возвращены
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('en')
    })

    it('должен возвращать пустой массив когда нет активных языков', async () => {
      const composable = useIndexedDB()
      
      const inactiveLanguages = mockLanguages.map(lang => ({
        ...lang,
        is_active: false
      }))
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(inactiveLanguages)

      const result = await composable.getActiveLanguages()
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('должен сохранять порядок активных языков как в исходном массиве', async () => {
      const composable = useIndexedDB()
      
      const orderedLanguages = [
        { id: '3', code: 'fr', name: 'Français', script: 'Latin', is_active: true },
        { id: '1', code: 'en', name: 'English', script: 'Latin', is_active: false },
        { id: '2', code: 'ru', name: 'Русский', script: 'Cyrillic', is_active: true }
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(orderedLanguages)

      const result = await composable.getActiveLanguages()
      
      expect(result).toHaveLength(2)
      expect(result[0].code).toBe('fr')
      expect(result[1].code).toBe('ru')
    })
  })

  describe('валидация входных параметров методов', () => {
    it('должен принимать пустой массив в getActiveLanguages', async () => {
      const composable = useIndexedDB()
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue([])

      const result = await composable.getActiveLanguages()
      expect(result).toEqual([])
    })

    it('должен корректно обрабатывать языки с минимальными данными', async () => {
      const composable = useIndexedDB()
      
      const minimalLanguages: LanguageResource[] = [
        {
          id: '1',
          code: 'en',
          name: 'English',
          script: null,
          is_active: true
        }
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(minimalLanguages)

      const result = await composable.getActiveLanguages()
      expect(result).toEqual(minimalLanguages)
      expect(result).toHaveLength(1)
    })

    it('должен правильно работать с большим количеством языков', async () => {
      const composable = useIndexedDB()
      
      const manyLanguages: LanguageResource[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        code: `lang${i + 1}`,
        name: `Language ${i + 1}`,
        script: 'Latin',
        is_active: i % 2 === 0 // каждый второй активный
      }))
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(manyLanguages)

      const result = await composable.getActiveLanguages()
      expect(result).toHaveLength(50) // половина должна быть активной
      expect(result.every((lang: LanguageResource) => lang.is_active === true)).toBe(true)
    })
  })

  describe('edge cases для getActiveLanguages', () => {
    it('должен обработать языки с экстремальными значениями is_active', async () => {
      const composable = useIndexedDB()
      
      const extremeLanguages = [
        { ...mockLanguages[0], is_active: true },
        { ...mockLanguages[1], is_active: 0 as any }, // falsy value
        { ...mockLanguages[2], is_active: 1 as any }  // truthy value
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(extremeLanguages)

      const result = await composable.getActiveLanguages()
      
      // Должны вернуться только те, где is_active === true (строго)
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('en')
    })

    it('должен правильно обработать смешанные типы в массиве языков', async () => {
      const composable = useIndexedDB()
      
      const mixedTypesLanguages = [
        { ...mockLanguages[0], is_active: true },
        { ...mockLanguages[1], is_active: 'true' as any }, // string 'true'
        { ...mockLanguages[2], is_active: false }
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(mixedTypesLanguages)

      const result = await composable.getActiveLanguages()
      
      // Только строго boolean true должен пройти
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('en')
    })

    it('должен обработать дублирующиеся языки в массиве', async () => {
      const composable = useIndexedDB()
      
      const duplicatedLanguages = [
        mockLanguages[0], // active: true
        mockLanguages[0], // duplicate - active: true
        mockLanguages[2]  // active: false
      ]
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(duplicatedLanguages)

      const result = await composable.getActiveLanguages()
      
      // Должны вернуться 2 элемента (включая дубликат)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockLanguages[0])
      expect(result[1]).toEqual(mockLanguages[0])
    })
  })

  describe('производительность и стабильность', () => {
    it('должен обрабатывать вызовы getActiveLanguages последовательно', async () => {
      const composable = useIndexedDB()
      
      vi.spyOn(composable, 'getLanguages').mockResolvedValue(mockLanguages)

      // Несколько последовательных вызовов
      const results = await Promise.all([
        composable.getActiveLanguages(),
        composable.getActiveLanguages(),
        composable.getActiveLanguages()
      ])

      // Все результаты должны быть одинаковыми
      results.forEach(result => {
        expect(result).toHaveLength(2)
        expect(result.every((lang: LanguageResource) => lang.is_active === true)).toBe(true)
      })
    })

    it('должен правильно работать при изменении данных между вызовами', async () => {
      const composable = useIndexedDB()
      
      const getLanguagesSpy = vi.spyOn(composable, 'getLanguages')
      
      // Первый вызов возвращает все языки активными
      getLanguagesSpy.mockResolvedValueOnce(mockLanguages.map(lang => ({ ...lang, is_active: true })))
      
      const firstResult = await composable.getActiveLanguages()
      expect(firstResult).toHaveLength(3)
      
      // Второй вызов возвращает оригинальные данные
      getLanguagesSpy.mockResolvedValueOnce(mockLanguages)
      
      const secondResult = await composable.getActiveLanguages()
      expect(secondResult).toHaveLength(2)
    })
  })
}) 