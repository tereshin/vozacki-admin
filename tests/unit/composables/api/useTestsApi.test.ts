import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTestsApi } from '~/composables/api/useTestsApi'

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

describe('useTestsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useCrudMixin', mockUseCrudMixin)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getTests: success with search filter', async () => {
    const { getTests } = useTestsApi()
    const params = { search: 'test' }
    await getTests(params)
    expect(mockCrudMixin.baseApi.buildSupabaseQuery).toHaveBeenCalledWith(params)
    expect(queryMock.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%')
  })

  it('getTests: success with language filter', async () => {
    const { getTests } = useTestsApi()
    const params = { filters: { language_id: 'en' } }
    await getTests(params)
    expect(queryMock.eq).toHaveBeenCalledWith('language_id', 'en')
  })

  it('getTests: success with topic filter', async () => {
    const { getTests } = useTestsApi()
    const params = { filters: { topic_uid: 'topic1' } }
    await getTests(params)
    expect(queryMock.eq).toHaveBeenCalledWith('topic_uid', 'topic1')
  })

  it('getTests: default sorting by title', async () => {
    const { getTests } = useTestsApi()
    await getTests()
    expect(queryMock.order).toHaveBeenCalledWith('title', { ascending: true })
  })

  it('getTests: error handling', async () => {
    Object.assign(queryMock, {
      then: (res: any) => res({ data: null, error: new Error('db error'), count: 0 })
    })
    const { getTests } = useTestsApi()
    await getTests()
    expect(mockCrudMixin.baseApi.handleError).toHaveBeenCalled()
  })

  it('getSingleTest: success', async () => {
    const { getSingleTest } = useTestsApi()
    expect(getSingleTest).toBe(mockCrudMixin.getSingleItem)
  })

  it('createTest: success', async () => {
    const { createTest } = useTestsApi()
    expect(createTest).toBe(mockCrudMixin.createItem)
  })

  it('updateTest: success', async () => {
    const { updateTest } = useTestsApi()
    expect(updateTest).toBe(mockCrudMixin.updateItem)
  })

  it('deleteTest: success', async () => {
    const { deleteTest } = useTestsApi()
    expect(deleteTest).toBe(mockCrudMixin.deleteItem)
  })
}) 