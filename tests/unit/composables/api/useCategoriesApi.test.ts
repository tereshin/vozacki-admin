import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCategoriesApi } from '~/composables/api/useCategoriesApi'

// Мокаем зависимости через алиасы
vi.mock('~/composables/api/utils/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({ handleError: vi.fn() })
}))

vi.mock('~/composables/api/base/useBaseApi', () => ({
  useBaseApi: () => ({
    authenticatedFetch: vi.fn(),
    buildApiUrl: vi.fn(),
    handleError: vi.fn()
  })
}))

// Мокаем useCrudMixin как глобальную функцию
const mockCrudMixin = {
  getItems: vi.fn(),
  getSingleItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}

const mockUseCrudMixin = vi.fn(() => mockCrudMixin)

describe('useCategoriesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Добавляем useCrudMixin в глобальную область видимости через vi.stubGlobal
    vi.stubGlobal('useCrudMixin', mockUseCrudMixin)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getCategories: should use crud mixin getItems', async () => {
    const { getCategories } = useCategoriesApi()
    expect(getCategories).toBe(mockCrudMixin.getItems)
  })

  it('getSingleCategory: should use crud mixin getSingleItem', async () => {
    const { getSingleCategory } = useCategoriesApi()
    expect(getSingleCategory).toBe(mockCrudMixin.getSingleItem)
  })

  it('createCategory: should use crud mixin createItem', async () => {
    const { createCategory } = useCategoriesApi()
    expect(createCategory).toBe(mockCrudMixin.createItem)
  })

  it('updateCategory: should use crud mixin updateItem', async () => {
    const { updateCategory } = useCategoriesApi()
    expect(updateCategory).toBe(mockCrudMixin.updateItem)
  })

  it('deleteCategory: should use crud mixin deleteItem', async () => {
    const { deleteCategory } = useCategoriesApi()
    expect(deleteCategory).toBe(mockCrudMixin.deleteItem)
  })

  it('useCrudMixin: should be called with correct parameters', () => {
    useCategoriesApi()
    expect(mockUseCrudMixin).toHaveBeenCalledWith(
      'categories',
      ['name', 'description']
    )
  })
}) 