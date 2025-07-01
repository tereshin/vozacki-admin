import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock pinia defineStore
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Mock ArticlesApi
vi.mock('~/composables/api/useArticlesApi', () => ({
  useArticlesApi: () => ({
    getArticles: getArticlesSpy,
    getSingleArticle: getSingleArticleSpy,
    createArticle: createArticleSpy,
    updateArticle: updateArticleSpy,
    deleteArticle: deleteArticleSpy
  })
}))

// Vue reactivity stubs
const createRef = (v: any) => ({
  value: v,
  __v_isRef: true
})
vi.stubGlobal('ref', createRef)

// Mock API responses
const mockArticle = {
  id: '1',
  title: 'Test Article',
  slug: 'test-article',
  content: { blocks: [] },
  description: 'Test Description',
  category_id: '1',
  topic_id: '1',
  language_id: '1',
  is_published: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockApiResponse = {
  data: {
    collection: [mockArticle],
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

// Mock API functions
const getArticlesSpy = vi.fn().mockResolvedValue(mockApiResponse)
const getSingleArticleSpy = vi.fn().mockResolvedValue({ data: mockArticle })
const createArticleSpy = vi.fn().mockResolvedValue({ data: mockArticle })
const updateArticleSpy = vi.fn().mockResolvedValue({ data: { ...mockArticle, title: 'Updated Article' } })
const deleteArticleSpy = vi.fn().mockResolvedValue({})

import { useArticlesStore } from '~/store/articles'

describe('useArticlesStore', () => {
  let store: ReturnType<typeof useArticlesStore>

  beforeEach(() => {
    store = useArticlesStore()
    vi.clearAllMocks()
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

  describe('getArticles', () => {
    it('fetches articles successfully', async () => {
      const payload = { category_id: '1', language_id: '1' }
      await store.getArticles(payload)
      
      expect(getArticlesSpy).toHaveBeenCalledWith(payload)
      expect((store.items as any).value).toEqual([mockArticle])
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles errors', async () => {
      const error = new Error('Failed to fetch')
      getArticlesSpy.mockRejectedValueOnce(error)

      await expect(store.getArticles()).rejects.toThrow('Failed to fetch')
      expect((store.error as any).value).toBe('Failed to fetch')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getSingleArticle', () => {
    it('fetches single article successfully', async () => {
      const result = await store.getSingleArticle('1')
      
      expect(getSingleArticleSpy).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockArticle)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })
  })

  describe('createArticle', () => {
    it('creates article successfully', async () => {
      const newArticle = {
        title: 'New Article',
        slug: 'new-article',
        uid: 'new-article-uid',
        content: { blocks: [] },
        description: 'New Description',
        category_id: '1',
        topic_id: '1',
        language_id: '1',
        is_published: true
      }
      const result = await store.createArticle(newArticle)
      
      expect(createArticleSpy).toHaveBeenCalledWith(newArticle)
      expect(result).toEqual(mockArticle)
      expect((store.items as any).value[0]).toEqual(mockArticle)
      expect((store.meta as any).value.total).toBe(1)
    })

    it('handles validation errors', async () => {
      const error = new Error('Validation failed')
      createArticleSpy.mockRejectedValueOnce(error)
      const invalidArticle = {
        title: '', // Invalid empty title
        slug: '',
        uid: '',
        content: { blocks: [] },
        description: '',
        category_id: '1',
        topic_id: '1',
        language_id: '1',
        is_published: true
      }

      await expect(store.createArticle(invalidArticle)).rejects.toThrow('Validation failed')
      expect((store.error as any).value).toBe('Validation failed')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('updateArticle', () => {
    it('updates article successfully', async () => {
      // First add an article to update
      await store.getArticles()
      
      const updateData = { title: 'Updated Article' }
      const result = await store.updateArticle('1', updateData)
      
      expect(updateArticleSpy).toHaveBeenCalledWith('1', updateData)
      expect(result.title).toBe('Updated Article')
      expect((store.items as any).value[0].title).toBe('Updated Article')
    })

    it('handles non-existent article update', async () => {
      const updateData = { title: 'Updated Article' }
      const result = await store.updateArticle('999', updateData)
      
      expect(updateArticleSpy).toHaveBeenCalledWith('999', updateData)
      expect(result.title).toBe('Updated Article')
      // Should not modify items array since article wasn't found
      expect((store.items as any).value.length).toBe(0)
    })
  })

  describe('deleteArticle', () => {
    it('deletes article successfully', async () => {
      // First add an article to delete
      await store.getArticles()
      
      await store.deleteArticle('1')
      
      expect(deleteArticleSpy).toHaveBeenCalledWith('1')
      expect((store.items as any).value).toHaveLength(0)
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles non-existent article deletion', async () => {
      await store.deleteArticle('999')
      
      expect(deleteArticleSpy).toHaveBeenCalledWith('999')
      // Should not modify meta since article wasn't in the list
      expect((store.meta as any).value.total).toBe(0)
    })
  })
}) 