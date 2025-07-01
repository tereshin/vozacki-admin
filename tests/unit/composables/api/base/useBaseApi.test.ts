import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBaseApi } from '~/composables/api/base/useBaseApi'

const createSupabaseQueryMock = () => {
  const query: any = {}
  query.select = vi.fn().mockReturnValue(query)
  query.range = vi.fn().mockReturnValue(query)
  query.order = vi.fn().mockReturnValue(query)
  query.or = vi.fn().mockReturnValue(query)
  query.eq = vi.fn().mockReturnValue(query)
  return query
}

describe('useBaseApi', () => {
  let supabaseQueryMock: any
  let supabaseMock: any
  let handleErrorMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    supabaseQueryMock = createSupabaseQueryMock()
    supabaseMock = {
      from: vi.fn(() => supabaseQueryMock)
    }

    handleErrorMock = vi.fn()

    vi.stubGlobal('useSupabase', () => supabaseMock)
    vi.stubGlobal('useApiErrorHandler', () => ({ handleError: handleErrorMock }))
    vi.stubGlobal('useAuthenticatedFetch', () => ({ authenticatedFetch: vi.fn() }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('buildApiUrl: constructs correct URLs', () => {
    const { buildApiUrl } = useBaseApi('resources')
    expect(buildApiUrl()).toBe('/api/resources')
    expect(buildApiUrl('1')).toBe('/api/resources/1')
  })

  it('buildSupabaseQuery: applies pagination and sorting', () => {
    const { buildSupabaseQuery } = useBaseApi('articles')

    const params = { page: 2, per_page: 10, sort_field: 'name', sort_order: 'asc' } as any
    buildSupabaseQuery(params)

    expect(supabaseMock.from).toHaveBeenCalledWith('articles')
    expect(supabaseQueryMock.range).toHaveBeenCalledWith(10, 19)
    expect(supabaseQueryMock.order).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('buildSupabaseQuery: throws when supabase is not initialized', () => {
    vi.stubGlobal('useSupabase', () => null)
    const { buildSupabaseQuery } = useBaseApi('topics')
    expect(() => buildSupabaseQuery()).toThrow('Supabase client is not initialized')
  })

  it('formatResponse: returns correct meta information', () => {
    const { formatResponse } = useBaseApi('tests')
    const data = [{ id: '1' }, { id: '2' }]
    const response = formatResponse(data, 25, { page: 2, per_page: 10 } as any)

    expect(response.data.collection).toEqual(data)
    expect(response.data.meta).toEqual({
      current_page: 2,
      from: 11,
      last_page: 3,
      per_page: 10,
      to: 20,
      total: 25
    })
  })

  it('applySearchFilter: adds OR conditions when search term is provided', () => {
    const { applySearchFilter } = useBaseApi('languages')
    const result = applySearchFilter(supabaseQueryMock, ['name', 'code'], 'en')
    expect(supabaseQueryMock.or).toHaveBeenCalledWith('name.ilike.%en%,code.ilike.%en%')
    expect(result).toBe(supabaseQueryMock)
  })

  it('applySearchFilter: returns original query when search term missing', () => {
    const { applySearchFilter } = useBaseApi('languages')
    const result = applySearchFilter(supabaseQueryMock, ['name', 'code'])
    expect(supabaseQueryMock.or).not.toHaveBeenCalled()
    expect(result).toBe(supabaseQueryMock)
  })

  it('safeSupabaseCall: propagates errors via handleError', async () => {
    const { safeSupabaseCall } = useBaseApi('roles')
    const dbError = new Error('db-error')
    const operation = vi.fn().mockResolvedValue({ data: null, error: dbError })

    await safeSupabaseCall(operation, 'testing')

    expect(operation).toHaveBeenCalled()
    expect(handleErrorMock).toHaveBeenCalledWith(dbError, 'testing')
  })

  it('safeSupabaseCall: catches thrown exceptions', async () => {
    const { safeSupabaseCall } = useBaseApi('roles')
    const runtimeError = new Error('boom')
    const operation = vi.fn().mockRejectedValue(runtimeError)

    await safeSupabaseCall(operation, 'context')
    expect(handleErrorMock).toHaveBeenCalledWith(runtimeError, 'context')
  })
}) 