import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAdministratorsApi } from '~/composables/api/useAdministratorsApi'

vi.mock('../../../../composables/api/utils/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({ handleError: vi.fn() })
}))
vi.mock('../../../../composables/core/api/useAuthenticatedFetch', () => ({
  useAuthenticatedFetch: () => ({ authenticatedFetch: vi.fn() })
}))

describe('useAdministratorsApi', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  const validRequest = { email: 'test@example.com' } // минимально валидный AdministratorRequest
  const validUpdate = { email: 'updated@example.com' } // минимально валидный AdministratorUpdateRequest
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

  it('getAdministrators: success', async () => {
    fetchMock.mockResolvedValue({ data: { collection: [{ id: '1', email: 'a', first_name: 'A', last_name: 'B', full_name: 'A B', created_at: '', updated_at: '', display_name: '', role_id: null, role: undefined }], meta } })
    const { getAdministrators } = useAdministratorsApi()
    const res = await getAdministrators()
    expect(fetchMock).toHaveBeenCalledWith('/api/administrators', { query: undefined })
    expect(res.data.collection[0].id).toBe('1')
    expect(res.data.meta).toEqual(meta)
  })

  it('getAdministrators: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { getAdministrators } = useAdministratorsApi()
    await expect(getAdministrators()).rejects.toThrow('fail')
  })

  it('getSingleAdministrator: success', async () => {
    fetchMock.mockResolvedValue({ data: { id: '2', email: 'b', first_name: 'B', last_name: 'C', full_name: 'B C', created_at: '', updated_at: '', display_name: '', role_id: null, role: undefined } })
    const { getSingleAdministrator } = useAdministratorsApi()
    const res = await getSingleAdministrator('2')
    expect(fetchMock).toHaveBeenCalledWith('/api/administrators/2')
    expect(res.data.id).toBe('2')
  })

  it('getSingleAdministrator: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { getSingleAdministrator } = useAdministratorsApi()
    await expect(getSingleAdministrator('2')).rejects.toThrow('fail')
  })

  it('createAdministrator: success', async () => {
    fetchMock.mockResolvedValue({ data: { id: '3', email: 'c', first_name: 'C', last_name: 'D', full_name: 'C D', created_at: '', updated_at: '', display_name: '', role_id: null, role: undefined } })
    const { createAdministrator } = useAdministratorsApi()
    const res = await createAdministrator(validRequest)
    expect(fetchMock).toHaveBeenCalledWith('/api/administrators', { method: 'POST', body: validRequest })
    expect(res.data.id).toBe('3')
  })

  it('createAdministrator: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { createAdministrator } = useAdministratorsApi()
    await expect(createAdministrator(validRequest)).rejects.toThrow('fail')
  })

  it('updateAdministrator: success', async () => {
    fetchMock.mockResolvedValue({ data: { id: '4', email: 'd', first_name: 'D', last_name: 'E', full_name: 'D E', created_at: '', updated_at: '', display_name: '', role_id: null, role: undefined } })
    const { updateAdministrator } = useAdministratorsApi()
    const res = await updateAdministrator('4', validUpdate)
    expect(fetchMock).toHaveBeenCalledWith('/api/administrators/4', { method: 'PUT', body: validUpdate })
    expect(res.data.id).toBe('4')
  })

  it('updateAdministrator: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { updateAdministrator } = useAdministratorsApi()
    await expect(updateAdministrator('4', validUpdate)).rejects.toThrow('fail')
  })

  it('deleteAdministrator: success', async () => {
    fetchMock.mockResolvedValue(undefined)
    const { deleteAdministrator } = useAdministratorsApi()
    await expect(deleteAdministrator('5')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/administrators/5', { method: 'DELETE' })
  })

  it('deleteAdministrator: error', async () => {
    fetchMock.mockRejectedValue(new Error('fail'))
    const { deleteAdministrator } = useAdministratorsApi()
    await expect(deleteAdministrator('5')).rejects.toThrow('fail')
  })

  it('getAdministrators: edge case empty', async () => {
    fetchMock.mockResolvedValue({ data: { collection: [], meta } })
    const { getAdministrators } = useAdministratorsApi()
    const res = await getAdministrators()
    expect(res.data.collection).toEqual([])
    expect(res.data.meta).toEqual(meta)
  })
}) 