import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTopicsApi } from '~/composables/api/useTopicsApi'

const meta = { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 }
const queryMock = {
  or: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis()
}
const mockCrudMixin = {
  baseApi: {
    buildSupabaseQuery: vi.fn(() => queryMock),
    formatResponse: vi.fn(() => ({ data: { collection: [], meta } })),
    handleError: vi.fn()
  },
  getSingleItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}
const mockUseCrudMixin = vi.fn(() => mockCrudMixin)

Object.assign(queryMock, Promise.resolve({ data: [], error: null, count: 0 }))

describe('useTopicsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useCrudMixin', mockUseCrudMixin)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getTopics: success with search filter', async () => {
    const { getTopics } = useTopicsApi()
    const params = { search: 'topic' }
    await getTopics(params)
    expect(mockCrudMixin.baseApi.buildSupabaseQuery).toHaveBeenCalledWith(params)
    expect(queryMock.or).toHaveBeenCalledWith('name.ilike.%topic%,description.ilike.%topic%')
  })

  it('getTopics: success with language filter', async () => {
    const { getTopics } = useTopicsApi()
    const params = { filters: { language_id: 'en' } }
    await getTopics(params)
    expect(queryMock.eq).toHaveBeenCalledWith('language_id', 'en')
  })

  it('getTopics: default sorting by name', async () => {
    const { getTopics } = useTopicsApi()
    await getTopics()
    expect(queryMock.order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('getTopics: error handling', async () => {
    Object.assign(queryMock, {
      then: (res: any) => res({ data: null, error: new Error('db error'), count: 0 })
    })
    const { getTopics } = useTopicsApi()
    await getTopics()
    expect(mockCrudMixin.baseApi.handleError).toHaveBeenCalled()
  })

  it('getSingleTopic: success', async () => {
    const { getSingleTopic } = useTopicsApi()
    expect(getSingleTopic).toBe(mockCrudMixin.getSingleItem)
  })

  it('createTopic: success', async () => {
    const { createTopic } = useTopicsApi()
    expect(createTopic).toBe(mockCrudMixin.createItem)
  })

  it('updateTopic: success', async () => {
    const { updateTopic } = useTopicsApi()
    expect(updateTopic).toBe(mockCrudMixin.updateItem)
  })

  it('deleteTopic: success', async () => {
    const { deleteTopic } = useTopicsApi()
    expect(deleteTopic).toBe(mockCrudMixin.deleteItem)
  })

  it('getTopics: empty result', async () => {
    const { getTopics } = useTopicsApi()
    const res = await getTopics()
    expect(res.data.collection).toEqual([])
    expect(res.data.meta).toEqual(meta)
  })
}) 