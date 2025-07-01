import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLanguagesApi } from '~/composables/api/useLanguagesApi'

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

let handleErrorMock: ReturnType<typeof vi.fn>

Object.assign(queryMock, Promise.resolve({ data: [], error: null, count: 0 }))

describe('useLanguagesApi', () => {
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

  it('getLanguages: throws error when supabase not initialized', async () => {
    vi.stubGlobal('useSupabase', () => null)
    const { getLanguages } = useLanguagesApi()
    await expect(getLanguages()).rejects.toThrow('Supabase client is not initialized')
    vi.unstubAllGlobals()
  })

  it('getLanguages: success with search filter', async () => {
    const { getLanguages } = useLanguagesApi()
    const params = { search: 'en' }
    await getLanguages(params)
    expect(mockCrudMixin.baseApi.buildSupabaseQuery).toHaveBeenCalledWith(params)
    expect(queryMock.or).toHaveBeenCalledWith('name.ilike.%en%,code.ilike.%en%')
  })

  it('getLanguages: success with is_active filter', async () => {
    const { getLanguages } = useLanguagesApi()
    const params = { filters: { is_active: true } }
    await getLanguages(params)
    expect(queryMock.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('getLanguages: success with is_active false filter', async () => {
    const { getLanguages } = useLanguagesApi()
    const params = { filters: { is_active: false } }
    await getLanguages(params)
    expect(queryMock.eq).toHaveBeenCalledWith('is_active', false)
  })

  it('getLanguages: default sorting by name', async () => {
    const { getLanguages } = useLanguagesApi()
    await getLanguages()
    expect(queryMock.order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('getLanguages: error handling', async () => {
    Object.assign(queryMock, {
      then: (res: any) => res({ data: null, error: new Error('db error'), count: 0 })
    })
    const { getLanguages } = useLanguagesApi()
    await getLanguages()
    expect(handleErrorMock).toHaveBeenCalled()
  })

  it('getSingleLanguage: success', async () => {
    const { getSingleLanguage } = useLanguagesApi()
    expect(getSingleLanguage).toBe(mockCrudMixin.getSingleItem)
  })

  it('createLanguage: success', async () => {
    const { createLanguage } = useLanguagesApi()
    expect(createLanguage).toBe(mockCrudMixin.createItem)
  })

  it('updateLanguage: success', async () => {
    const { updateLanguage } = useLanguagesApi()
    expect(updateLanguage).toBe(mockCrudMixin.updateItem)
  })

  it('deleteLanguage: success', async () => {
    const { deleteLanguage } = useLanguagesApi()
    expect(deleteLanguage).toBe(mockCrudMixin.deleteItem)
  })
}) 