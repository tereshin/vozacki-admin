import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRolesApi } from '~/composables/api/useRolesApi'

vi.mock('~/composables/api/utils/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({ handleError: vi.fn() })
}))

// We'll use global stub for useAuthenticatedFetch to match auto-import behaviour

describe('useRolesApi', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  const meta = { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 }

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('useAuthenticatedFetch', () => ({ authenticatedFetch: fetchMock }))
    vi.stubGlobal('useApiErrorHandler', () => ({ handleError: vi.fn() }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getRoles: success', async () => {
    fetchMock.mockResolvedValue({ data: { collection: [{ id: '1', name: 'Admin', code: 'admin', created_at: '' }], meta } })
    const { getRoles } = useRolesApi()
    const res = await getRoles()
    expect(fetchMock).toHaveBeenCalledWith('/api/roles', { query: undefined })
    expect(res.data.collection[0].id).toBe('1')
    expect(res.data.meta).toEqual(meta)
  })

  it('getRoles: with params', async () => {
    fetchMock.mockResolvedValue({ data: { collection: [], meta } })
    const { getRoles } = useRolesApi()
    const params = { page: 1, per_page: 5 }
    await getRoles(params)
    expect(fetchMock).toHaveBeenCalledWith('/api/roles', { query: params })
  })

  it('getRoles: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { getRoles } = useRolesApi()
    await expect(getRoles()).rejects.toThrow('fail')
  })

  it('getAllRoles: success', async () => {
    fetchMock.mockResolvedValue({ data: [{ id: '1', name: 'Admin', code: 'admin', created_at: '' }] })
    const { getAllRoles } = useRolesApi()
    const res = await getAllRoles()
    expect(fetchMock).toHaveBeenCalledWith('/api/roles/all')
    expect(res[0].id).toBe('1')
    expect(Array.isArray(res)).toBe(true)
  })

  it('getAllRoles: empty array', async () => {
    fetchMock.mockResolvedValue({ data: [] })
    const { getAllRoles } = useRolesApi()
    const res = await getAllRoles()
    expect(res).toEqual([])
  })

  it('getAllRoles: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { getAllRoles } = useRolesApi()
    await expect(getAllRoles()).rejects.toThrow('fail')
  })
}) 