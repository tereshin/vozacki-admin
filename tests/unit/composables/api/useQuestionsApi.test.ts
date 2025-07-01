import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useQuestionsApi } from '~/composables/api/useQuestionsApi'

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

let handleErrorMock: ReturnType<typeof vi.fn>

Object.assign(queryMock, Promise.resolve({ data: [], error: null, count: 0 }))

describe('useQuestionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useSupabase', () => ({}))
    handleErrorMock = vi.fn()
    vi.stubGlobal('useApiErrorHandler', () => ({ handleError: handleErrorMock }))
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

  it('getQuestions: success with search filter', async () => {
    const { getQuestions } = useQuestionsApi()
    const params = { search: 'question' }
    await getQuestions(params)
    expect(mockCrudMixin.baseApi.buildSupabaseQuery).toHaveBeenCalledWith(params)
    expect(queryMock.ilike).toHaveBeenCalledWith('text', '%question%')
  })

  it('getQuestions: success with language filter', async () => {
    const { getQuestions } = useQuestionsApi()
    const params = { filters: { language_id: 'en' } }
    await getQuestions(params)
    expect(queryMock.eq).toHaveBeenCalledWith('language_id', 'en')
  })

  it('getQuestions: success with test filter', async () => {
    const { getQuestions } = useQuestionsApi()
    const params = { filters: { test_uid: 'test1' } }
    await getQuestions(params)
    expect(queryMock.eq).toHaveBeenCalledWith('test_uid', 'test1')
  })

  it('getQuestions: success with points filter', async () => {
    const { getQuestions } = useQuestionsApi()
    const params = { filters: { points: 5 } }
    await getQuestions(params)
    expect(queryMock.eq).toHaveBeenCalledWith('points', 5)
  })

  it('getQuestions: default sorting by external_id', async () => {
    const { getQuestions } = useQuestionsApi()
    await getQuestions()
    expect(queryMock.order).toHaveBeenCalledWith('external_id', { ascending: true })
  })

  it('getQuestions: error handling', async () => {
    Object.assign(queryMock, {
      then: (res: any) => res({ data: null, error: new Error('db error'), count: 0 })
    })
    const { getQuestions } = useQuestionsApi()
    await getQuestions()
    expect(handleErrorMock).toHaveBeenCalled()
  })

  it('getSingleQuestion: success', async () => {
    const { getSingleQuestion } = useQuestionsApi()
    expect(getSingleQuestion).toBe(mockCrudMixin.getSingleItem)
  })

  it('createQuestion: success', async () => {
    const { createQuestion } = useQuestionsApi()
    expect(createQuestion).toBe(mockCrudMixin.createItem)
  })

  it('updateQuestion: success', async () => {
    const { updateQuestion } = useQuestionsApi()
    expect(updateQuestion).toBe(mockCrudMixin.updateItem)
  })

  it('deleteQuestion: success', async () => {
    const { deleteQuestion } = useQuestionsApi()
    expect(deleteQuestion).toBe(mockCrudMixin.deleteItem)
  })
}) 