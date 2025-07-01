import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAnswersApi } from '~/composables/api/useAnswersApi'

const meta = { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 }
const queryMock = {
  ilike: vi.fn().mockReturnThis(),
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

describe('useAnswersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useSupabase', () => ({}))
    vi.stubGlobal('useApiErrorHandler', () => ({ handleError: vi.fn() }))
    vi.stubGlobal('useBaseApi', () => ({
      authenticatedFetch: vi.fn(),
      buildApiUrl: vi.fn(),
      handleError: vi.fn(),
      buildSupabaseQuery: vi.fn(() => queryMock),
      applySearchFilter: vi.fn(),
      formatResponse: vi.fn(() => ({ data: { collection: [], meta } }))
    }))
    vi.stubGlobal('useCrudMixin', mockUseCrudMixin)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getAnswers: success with search filter', async () => {
    const { getAnswers } = useAnswersApi()
    const params = { search: 'test' }
    await getAnswers(params)
    expect(mockCrudMixin.baseApi.buildSupabaseQuery).toHaveBeenCalledWith(params)
    expect(queryMock.ilike).toHaveBeenCalledWith('text', '%test%')
  })

  it('getAnswers: success with language filter', async () => {
    const { getAnswers } = useAnswersApi()
    const params = { filters: { language_id: 'en' } }
    await getAnswers(params)
    expect(queryMock.eq).toHaveBeenCalledWith('language_id', 'en')
  })

  it('getAnswers: success with question filter', async () => {
    const { getAnswers } = useAnswersApi()
    const params = { filters: { question_uid: 'q1' } }
    await getAnswers(params)
    expect(queryMock.eq).toHaveBeenCalledWith('question_uid', 'q1')
  })

  it('getAnswers: default sorting', async () => {
    const { getAnswers } = useAnswersApi()
    await getAnswers()
    expect(queryMock.order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('getSingleAnswer: success', async () => {
    const { getSingleAnswer } = useAnswersApi()
    expect(getSingleAnswer).toBe(mockCrudMixin.getSingleItem)
  })

  it('createAnswer: success', async () => {
    const { createAnswer } = useAnswersApi()
    expect(createAnswer).toBe(mockCrudMixin.createItem)
  })

  it('updateAnswer: success', async () => {
    const { updateAnswer } = useAnswersApi()
    expect(updateAnswer).toBe(mockCrudMixin.updateItem)
  })

  it('deleteAnswer: success', async () => {
    const { deleteAnswer } = useAnswersApi()
    expect(deleteAnswer).toBe(mockCrudMixin.deleteItem)
  })
}) 