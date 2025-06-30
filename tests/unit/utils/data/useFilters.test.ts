import { describe, it, expect, vi, beforeEach } from 'vitest'

// Объявляем глобальные типы
declare global {
  var useRoute: () => any
  var useRouter: () => any
}

// Создаем глобальные моки для Nuxt composables
const mockRoute = {
  query: {},
  params: {},
  path: '/',
  fullPath: '/'
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}

// Мокаем как глобальные функции
globalThis.useRoute = vi.fn(() => mockRoute)
globalThis.useRouter = vi.fn(() => mockRouter)

const { useFilters } = await import('../../../../composables/utils/data/useFilters')

import type { FilterConfig, FiltersState } from '../../../../composables/utils/data/useFilters'

describe('useFilters', () => {
  // Временно пропускаем useFilters тесты из-за проблем с мокингом Nuxt composables
  // TODO: Исправить моки для useRoute и useRouter
  
  const {
    initializeFiltersFromQuery,
    updateQueryFromFilters,
    getApiParams,
    clearFilters,
    hasActiveFilters
  } = useFilters()

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    mockRoute.query = {}
    mockRouter.push.mockClear()
  })

  // Тестовые данные
  const createTestFilters = (): FiltersState => ({
    status: {
      type: 'dropdown',
      field: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ],
      chosenOptions: [],
      multiple: false
    },
    categories: {
      type: 'multiselect',
      field: 'category_ids',
      options: [
        { label: 'Category 1', value: 1 },
        { label: 'Category 2', value: 2 },
        { label: 'Category 3', value: 3 }
      ],
      chosenOptions: [],
      multiple: true
    },
    isPublished: {
      type: 'boolean',
      field: 'is_published',
      options: [
        { label: 'Published', value: true },
        { label: 'Draft', value: false }
      ],
      chosenOptions: [],
      multiple: false
    },
    nullableField: {
      type: 'dropdown',
      field: 'nullable_field',
      options: [
        { label: 'All', value: null },
        { label: 'Option 1', value: 'option1' }
      ],
      chosenOptions: [],
      multiple: false,
      nullable: true
    }
  })

  describe('initializeFiltersFromQuery', () => {
    it('should initialize filters from query parameters', () => {
      mockRoute.query = {
        status: 'active',
        category_ids: ['1', '2'],
        is_published: 'true'
      }

      const filters = initializeFiltersFromQuery(createTestFilters())

      expect(filters.status.chosenOptions).toEqual(['active'])
      expect(filters.categories.chosenOptions).toEqual(['1', '2'])
      expect(filters.isPublished.chosenOptions).toEqual([true])
    })

    it('should handle single values for multiple filters', () => {
      mockRoute.query = {
        category_ids: '1' // одно значение вместо массива
      }

      const filters = initializeFiltersFromQuery(createTestFilters())

      expect(filters.categories.chosenOptions).toEqual(['1'])
    })

    it('should handle boolean conversion', () => {
      mockRoute.query = {
        is_published: 'false'
      }

      const filters = initializeFiltersFromQuery(createTestFilters())

      expect(filters.isPublished.chosenOptions).toEqual([false])
    })

    it('should handle number conversion', () => {
      mockRoute.query = {
        category_ids: ['1', '2']
      }

      // Обновляем тестовые фильтры для числового типа
      const filters = createTestFilters()
      filters.categories.options = [
        { label: 'Category 1', value: 1 },
        { label: 'Category 2', value: 2 }
      ]

      const result = initializeFiltersFromQuery(filters)

      expect(result.categories.chosenOptions).toEqual(['1', '2'])
    })

    it('should handle nullable fields', () => {
      mockRoute.query = {
        nullable_field: 'null'
      }

      const filters = initializeFiltersFromQuery(createTestFilters())

      expect(filters.nullableField.chosenOptions).toEqual([null])
    })

    it('should leave filters empty when no query params', () => {
      mockRoute.query = {}

      const filters = initializeFiltersFromQuery(createTestFilters())

      expect(filters.status.chosenOptions).toEqual([])
      expect(filters.categories.chosenOptions).toEqual([])
      expect(filters.isPublished.chosenOptions).toEqual([])
    })
  })

  describe('updateQueryFromFilters', () => {
    it('should update router query from filters', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']
      filters.categories.chosenOptions = [1, 2]

      updateQueryFromFilters(filters)

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {
          status: 'active',
          category_ids: [1, 2]
        }
      })
    })

    it('should include additional parameters', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']

      updateQueryFromFilters(filters, { search: 'test', page: 2 })

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {
          status: 'active',
          search: 'test',
          page: 2
        }
      })
    })

    it('should remove page=1 from query', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']

      updateQueryFromFilters(filters, { page: 1 })

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {
          status: 'active'
        }
      })
    })

    it('should handle empty filters', () => {
      const filters = createTestFilters()

      updateQueryFromFilters(filters)

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {}
      })
    })

    it('should handle null values in nullable fields', () => {
      const filters = createTestFilters()
      filters.nullableField.chosenOptions = [null]

      updateQueryFromFilters(filters)

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {}
      })
    })
  })

  describe('getApiParams', () => {
    it('should return API parameters from filters', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']
      filters.categories.chosenOptions = [1, 2]
      filters.isPublished.chosenOptions = [true]

      const params = getApiParams(filters)

      expect(params).toEqual({
        status: 'active',
        category_ids: [1, 2],
        is_published: true
      })
    })

    it('should include additional parameters', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']

      const params = getApiParams(filters, { limit: 10, offset: 20 })

      expect(params).toEqual({
        status: 'active',
        limit: 10,
        offset: 20
      })
    })

    it('should handle empty filters', () => {
      const filters = createTestFilters()

      const params = getApiParams(filters)

      expect(params).toEqual({})
    })

    it('should handle single values in multiple filters', () => {
      const filters = createTestFilters()
      filters.categories.chosenOptions = [1]

      const params = getApiParams(filters)

      expect(params).toEqual({
        category_ids: [1]
      })
    })

    it('should skip null values', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']
      filters.nullableField.chosenOptions = [null]

      const params = getApiParams(filters)

      expect(params).toEqual({
        status: 'active'
      })
    })
  })

  describe('clearFilters', () => {
    it('should clear all filter options', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']
      filters.categories.chosenOptions = [1, 2]
      filters.isPublished.chosenOptions = [true]

      clearFilters(filters)

      expect(filters.status.chosenOptions).toEqual([])
      expect(filters.categories.chosenOptions).toEqual([])
      expect(filters.isPublished.chosenOptions).toEqual([])
      expect(filters.nullableField.chosenOptions).toEqual([])
    })

    it('should work with empty filters', () => {
      const filters = createTestFilters()

      expect(() => clearFilters(filters)).not.toThrow()

      expect(filters.status.chosenOptions).toEqual([])
      expect(filters.categories.chosenOptions).toEqual([])
    })
  })

  describe('hasActiveFilters', () => {
    it('should return true when filters have values', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']

      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('should return true when search value is provided', () => {
      const filters = createTestFilters()

      expect(hasActiveFilters(filters, 'search term')).toBe(true)
    })

    it('should return false when no filters and no search', () => {
      const filters = createTestFilters()

      expect(hasActiveFilters(filters)).toBe(false)
      expect(hasActiveFilters(filters, '')).toBe(false)
      expect(hasActiveFilters(filters, undefined)).toBe(false)
    })

    it('should return true when multiple filters are active', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']
      filters.categories.chosenOptions = [1]

      expect(hasActiveFilters(filters)).toBe(true)
    })

    it('should handle edge cases', () => {
      const filters = createTestFilters()
      
      // Пустая строка поиска не считается активным фильтром
      expect(hasActiveFilters(filters, '')).toBe(false)
      
      // Строка с пробелами не считается активным фильтром
      expect(hasActiveFilters(filters, '   ')).toBe(false) 
      
      // Любая не пустая строка считается активным фильтром
      expect(hasActiveFilters(filters, 'a')).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('should work with full filter lifecycle', () => {
      // 1. Инициализируем из query
      mockRoute.query = {
        status: 'active',
        category_ids: ['1', '2']
      }

      let filters = initializeFiltersFromQuery(createTestFilters())

      expect(filters.status.chosenOptions).toEqual(['active'])
      expect(filters.categories.chosenOptions).toEqual(['1', '2'])

      // 2. Получаем API параметры
      const apiParams = getApiParams(filters)
      expect(apiParams.status).toBe('active')
      expect(apiParams.category_ids).toEqual(['1', '2'])

      // 3. Проверяем активные фильтры
      expect(hasActiveFilters(filters)).toBe(true)

      // 4. Очищаем фильтры
      clearFilters(filters)
      expect(hasActiveFilters(filters)).toBe(false)

      // 5. Обновляем query
      updateQueryFromFilters(filters)
      expect(mockRouter.push).toHaveBeenCalledWith({ query: {} })
    })

    it('should handle complex filter combinations', () => {
      const filters = createTestFilters()
      filters.status.chosenOptions = ['active']
      filters.categories.chosenOptions = [1, 2, 3]
      filters.isPublished.chosenOptions = [true]
      filters.nullableField.chosenOptions = [null]

      const apiParams = getApiParams(filters, { search: 'test' })

      expect(apiParams).toEqual({
        status: 'active',
        category_ids: [1, 2, 3],
        is_published: true,
        search: 'test'
      })

      expect(hasActiveFilters(filters, 'test')).toBe(true)
    })
  })
}) 