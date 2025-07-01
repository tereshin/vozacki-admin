import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useArticlesApi } from '~/composables/api/useArticlesApi'

const meta = { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 }
const articleData = { id: '1', title: 'Test', content: { blocks: [] }, language_id: 'en', slug: 'test', uid: 'uid1' }

const mockCrudMixin = {
  getItems: vi.fn(),
  getSingleItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}
const mockUseCrudMixin = vi.fn(() => mockCrudMixin)

describe('useArticlesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useCrudMixin', mockUseCrudMixin)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getArticles: success with content transformation', async () => {
    mockCrudMixin.getItems.mockResolvedValue({ data: { collection: [articleData], meta } })
    const { getArticles } = useArticlesApi()
    const res = await getArticles()
    expect(mockCrudMixin.getItems).toHaveBeenCalled()
    expect(res.data.collection[0].content).toEqual({ blocks: [] })
    expect(res.data.meta).toEqual(meta)
  })

  it('getArticles: error', async () => {
    mockCrudMixin.getItems.mockRejectedValue(new Error('fail'))
    const { getArticles } = useArticlesApi()
    await expect(getArticles()).rejects.toThrow('fail')
  })

  it('getSingleArticle: success', async () => {
    const { getSingleArticle } = useArticlesApi()
    expect(getSingleArticle).toBe(mockCrudMixin.getSingleItem)
  })

  it('createArticle: success', async () => {
    const { createArticle } = useArticlesApi()
    expect(createArticle).toBe(mockCrudMixin.createItem)
  })

  it('updateArticle: success', async () => {
    const { updateArticle } = useArticlesApi()
    expect(updateArticle).toBe(mockCrudMixin.updateItem)
  })

  it('deleteArticle: success', async () => {
    const { deleteArticle } = useArticlesApi()
    expect(deleteArticle).toBe(mockCrudMixin.deleteItem)
  })

  it('getArticles: empty collection', async () => {
    mockCrudMixin.getItems.mockResolvedValue({ data: { collection: [], meta } })
    const { getArticles } = useArticlesApi()
    const res = await getArticles()
    expect(res.data.collection).toEqual([])
  })
}) 