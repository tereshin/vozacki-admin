import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCrudMixin } from '~/composables/api/mixins/useCrudMixin'

// Helper to create a chainable promise-like Supabase query mock
const createQueryMock = (resolveValue: any = { data: [], error: null, count: 0 }) => {
  const promise = Promise.resolve(resolveValue) as any
  promise.or = vi.fn(() => promise)
  return promise
}

describe('useCrudMixin', () => {
  let authenticatedFetchMock: ReturnType<typeof vi.fn>
  let handleErrorMock: ReturnType<typeof vi.fn>
  let buildSupabaseQueryMock: ReturnType<typeof vi.fn>
  let applySearchFilterMock: ReturnType<typeof vi.fn>
  let formatResponseMock: ReturnType<typeof vi.fn>

  const buildBaseApiStub = () => {
    authenticatedFetchMock = vi.fn()
    handleErrorMock = vi.fn()
    buildSupabaseQueryMock = vi.fn()
    applySearchFilterMock = vi.fn((q) => q)
    formatResponseMock = vi.fn<[], any>(() => ({ formatted: true }))

    return {
      authenticatedFetch: authenticatedFetchMock,
      buildApiUrl: (endpoint?: string) => endpoint ? `/api/entities/${endpoint}` : '/api/entities',
      handleError: handleErrorMock,
      buildSupabaseQuery: buildSupabaseQueryMock,
      applySearchFilter: applySearchFilterMock,
      formatResponse: formatResponseMock,
    }
  }

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getItems: successfully fetches collection', async () => {
    const response = { data: 'ok' }
    const baseApi = buildBaseApiStub()
    baseApi.authenticatedFetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('useBaseApi', () => baseApi)

    const { getItems } = useCrudMixin<any, any, any, any, any>('entities')
    const params = { page: 1 }
    const res = await getItems(params as any)

    expect(baseApi.authenticatedFetch).toHaveBeenCalledWith('/api/entities', { query: params })
    expect(res).toBe(response)
  })

  it('getItems: handles errors via handleError', async () => {
    const error = new Error('fail')
    const baseApi = buildBaseApiStub()
    baseApi.authenticatedFetch = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('useBaseApi', () => baseApi)

    const { getItems } = useCrudMixin<any, any, any, any, any>('entities')
    await expect(getItems()).rejects.toThrow('fail')
    expect(handleErrorMock).toHaveBeenCalledWith(error, 'fetching entities')
  })

  it('getItemsWithSupabase: applies search filter and formats response', async () => {
    const queryMock = createQueryMock()
    const baseApi = buildBaseApiStub()
    baseApi.buildSupabaseQuery = vi.fn(() => queryMock)
    baseApi.applySearchFilter = vi.fn(() => queryMock)
    vi.stubGlobal('useBaseApi', () => baseApi)

    const { getItemsWithSupabase } = useCrudMixin<any, any, any, any, any>('entities', ['name'])
    const params = { search: 'foo' }
    const res = await getItemsWithSupabase(params as any)

    expect(baseApi.buildSupabaseQuery).toHaveBeenCalledWith(params)
    expect(baseApi.applySearchFilter).toHaveBeenCalledWith(queryMock, ['name'], 'foo')
    expect(baseApi.formatResponse).toHaveBeenCalled()
    expect(res).toEqual({ formatted: true })
  })

  it('getItemsWithSupabase: handles query error', async () => {
    const queryMock = createQueryMock({ data: null, error: new Error('db'), count: 0 })
    const baseApi = buildBaseApiStub()
    baseApi.buildSupabaseQuery = vi.fn(() => queryMock)
    vi.stubGlobal('useBaseApi', () => baseApi)

    const { getItemsWithSupabase } = useCrudMixin<any, any, any, any, any>('entities')
    await getItemsWithSupabase()
    expect(handleErrorMock).toHaveBeenCalledWith(new Error('db'), 'fetching entities with Supabase')
  })

  it('getSingleItem: fetches by id', async () => {
    const response = { id: '1' }
    const baseApi = buildBaseApiStub()
    baseApi.authenticatedFetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('useBaseApi', () => baseApi)

    const { getSingleItem } = useCrudMixin<any, any, any, any, any>('entities')
    const res = await getSingleItem('1')
    expect(baseApi.authenticatedFetch).toHaveBeenCalledWith('/api/entities/1')
    expect(res).toBe(response)
  })

  it('createItem / updateItem / deleteItem call correct endpoints & methods', async () => {
    const baseApi = buildBaseApiStub()
    baseApi.authenticatedFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('useBaseApi', () => baseApi)

    const { createItem, updateItem, deleteItem } = useCrudMixin<any, any, any, any, any>('entities')

    await createItem({} as any)
    expect(baseApi.authenticatedFetch).toHaveBeenCalledWith('/api/entities', { method: 'POST', body: {} })

    await updateItem('2', { foo: 'bar' } as any)
    expect(baseApi.authenticatedFetch).toHaveBeenCalledWith('/api/entities/2', { method: 'PUT', body: { foo: 'bar' } })

    await deleteItem('3')
    expect(baseApi.authenticatedFetch).toHaveBeenCalledWith('/api/entities/3', { method: 'DELETE' })
  })
}) 