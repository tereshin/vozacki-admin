import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global ref before any imports
const mockRef = vi.fn((value: any) => ({
  value,
  __v_isRef: true
}))
vi.stubGlobal('ref', mockRef)

// Mock pinia
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Mock API functions - these need to be declared at the top level
const getCategoriesSpy = vi.fn()
const getSingleCategorySpy = vi.fn()
const createCategorySpy = vi.fn()
const updateCategorySpy = vi.fn()
const deleteCategorySpy = vi.fn()

// Mock useCategoriesApi as a global function
const mockUseCategoriesApi = () => ({
  getCategories: getCategoriesSpy,
  getSingleCategory: getSingleCategorySpy,
  createCategory: createCategorySpy,
  updateCategory: updateCategorySpy,
  deleteCategory: deleteCategorySpy
})
vi.stubGlobal('useCategoriesApi', mockUseCategoriesApi)

import { useCategoriesStore } from '~/store/categories'

// Mock API responses
const mockCategory = {
  id: '1',
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test Description',
  language_id: '1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockApiResponse = {
  data: {
    collection: [mockCategory],
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 10,
      to: 1,
      total: 1
    }
  }
}

describe('useCategoriesStore', () => {
  let store: ReturnType<typeof useCategoriesStore>

  beforeEach(() => {
    store = useCategoriesStore()
    vi.clearAllMocks()
    
    // Reset mock implementations in beforeEach
    getCategoriesSpy.mockResolvedValue(mockApiResponse)
    getSingleCategorySpy.mockResolvedValue({ data: mockCategory })
    createCategorySpy.mockResolvedValue({ data: mockCategory })
    updateCategorySpy.mockResolvedValue({ data: { ...mockCategory, name: 'Updated Category' } })
    deleteCategorySpy.mockResolvedValue({})
  })

  it('initializes with default values', () => {
    expect((store.items as any).value).toEqual([])
    expect((store.loading as any).value).toBe(false)
    expect((store.error as any).value).toBeNull()
    expect((store.meta as any).value).toEqual({
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 10,
      to: 10,
      total: 0
    })
  })

  describe('getCategories', () => {
    it('fetches categories successfully', async () => {
      const payload = { language_id: '1' }
      await store.getCategories(payload)
      
      expect(getCategoriesSpy).toHaveBeenCalledWith(payload)
      expect((store.items as any).value).toEqual([mockCategory])
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles errors', async () => {
      const error = new Error('Failed to fetch')
      getCategoriesSpy.mockRejectedValueOnce(error)

      await expect(store.getCategories()).rejects.toThrow('Failed to fetch')
      expect((store.error as any).value).toBe('Failed to fetch')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getSingleCategory', () => {
    it('fetches single category successfully', async () => {
      const result = await store.getSingleCategory('1')
      
      expect(getSingleCategorySpy).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockCategory)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles error when category not found', async () => {
      const error = new Error('Category not found')
      getSingleCategorySpy.mockRejectedValueOnce(error)

      await expect(store.getSingleCategory('999')).rejects.toThrow('Category not found')
      expect((store.error as any).value).toBe('Category not found')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('createCategory', () => {
    it('creates category successfully', async () => {
      const newCategory = {
        name: 'New Category',
        slug: 'new-category',
        uid: 'new-category-uid',
        description: 'New Description',
        language_id: '1'
      }
      const result = await store.createCategory(newCategory)
      
      expect(createCategorySpy).toHaveBeenCalledWith(newCategory)
      expect(result).toEqual(mockCategory)
      expect((store.items as any).value[0]).toEqual(mockCategory)
      expect((store.meta as any).value.total).toBe(1)
    })

    it('handles validation errors', async () => {
      const error = new Error('Validation failed')
      createCategorySpy.mockRejectedValueOnce(error)
      const invalidCategory = {
        name: '', // Invalid empty name
        slug: '',
        uid: '',
        description: '',
        language_id: '1'
      }

      await expect(store.createCategory(invalidCategory)).rejects.toThrow('Validation failed')
      expect((store.error as any).value).toBe('Validation failed')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('updateCategory', () => {
    it('updates category successfully', async () => {
      // First add a category to update
      await store.getCategories()
      
      const updateData = { name: 'Updated Category' }
      const result = await store.updateCategory('1', updateData)
      
      expect(updateCategorySpy).toHaveBeenCalledWith('1', updateData)
      expect(result.name).toBe('Updated Category')
      expect((store.items as any).value[0].name).toBe('Updated Category')
    })

    it('handles non-existent category update', async () => {
      const updateData = { name: 'Updated Category' }
      const result = await store.updateCategory('999', updateData)
      
      expect(updateCategorySpy).toHaveBeenCalledWith('999', updateData)
      expect(result.name).toBe('Updated Category')
      // Should not modify items array since category wasn't found
      expect((store.items as any).value.length).toBe(0)
    })
  })

  describe('deleteCategory', () => {
    it('deletes category successfully', async () => {
      // First add a category to delete
      await store.getCategories()
      
      await store.deleteCategory('1')
      
      expect(deleteCategorySpy).toHaveBeenCalledWith('1')
      expect((store.items as any).value).toHaveLength(0)
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles non-existent category deletion', async () => {
      await store.deleteCategory('999')
      
      expect(deleteCategorySpy).toHaveBeenCalledWith('999')
      // Should not modify meta since category wasn't in the list
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles deletion error', async () => {
      const error = new Error('Cannot delete category with articles')
      deleteCategorySpy.mockRejectedValueOnce(error)

      await expect(store.deleteCategory('1')).rejects.toThrow('Cannot delete category with articles')
      expect((store.error as any).value).toBe('Cannot delete category with articles')
      expect((store.loading as any).value).toBe(false)
    })
  })
}) 