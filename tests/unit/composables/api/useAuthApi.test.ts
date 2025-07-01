import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthApi } from '../../../../composables/api/useAuthApi'

vi.mock('../../../../composables/api/utils/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({ handleError: vi.fn() })
}))

describe('useAuthApi', () => {
  let $fetchMock: ReturnType<typeof vi.fn>
  let useCookieMock: (name: string) => { value: string | null }

  beforeEach(() => {
    $fetchMock = vi.fn()
    useCookieMock = vi.fn(() => ({ value: 'token' })) as any
    global.$fetch = $fetchMock as any
    vi.stubGlobal('useCookie', useCookieMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('login: success', async () => {
    $fetchMock.mockResolvedValue({ success: true, data: { user: { id: 1 }, access_token: 'token', expires_in: 1000 } })
    const { login } = useAuthApi()
    const res = await login({ email: 'a', password: 'b' })
    expect(res.user).toEqual({ id: 1 })
    expect(res.session && res.session.access_token).toBe('token')
  })

  it('login: fail', async () => {
    $fetchMock.mockResolvedValue({ success: false })
    const { login } = useAuthApi()
    const res = await login({ email: 'a', password: 'b' })
    expect(res.user).toBeNull()
    expect(res.error).toBeDefined()
  })

  it('logout: success', async () => {
    $fetchMock.mockResolvedValue({})
    const { logout } = useAuthApi()
    const res = await logout()
    expect(res.error).toBeUndefined()
  })

  it('logout: error', async () => {
    $fetchMock.mockRejectedValue(new Error('fail'))
    const { logout } = useAuthApi()
    const res = await logout()
    expect(res.error).toBe('fail')
  })

  it('getCurrentUser: with token', async () => {
    $fetchMock.mockResolvedValue({ data: { id: 1 } })
    const { getCurrentUser } = useAuthApi()
    const res = await getCurrentUser()
    expect(res.user).toEqual({ id: 1 })
  })

  it('getCurrentUser: no token', async () => {
    (useCookieMock as any).mockReturnValueOnce({ value: null })
    const { getCurrentUser } = useAuthApi()
    const res = await getCurrentUser()
    expect(res.user).toBeNull()
    expect(res.error).toBeDefined()
  })

  it('getCurrentSession: with token', async () => {
    const { getCurrentSession } = useAuthApi()
    const res = await getCurrentSession()
    expect(res.session && res.session.access_token).toBe('token')
  })

  it('getCurrentSession: no token', async () => {
    (useCookieMock as any).mockReturnValueOnce({ value: null })
    const { getCurrentSession } = useAuthApi()
    const res = await getCurrentSession()
    expect(res.session).toBeNull()
    expect(res.error).toBeDefined()
  })

  it('getCurrentAdministrator: success', async () => {
    $fetchMock.mockResolvedValue({ data: { id: 2 } })
    const { getCurrentAdministrator } = useAuthApi()
    const res = await getCurrentAdministrator()
    expect(res.user).toEqual({ id: 2 })
  })

  it('getCurrentAdministrator: error', async () => {
    $fetchMock.mockRejectedValue(new Error('fail'))
    const { getCurrentAdministrator } = useAuthApi()
    const res = await getCurrentAdministrator()
    expect(res.user).toBeNull()
    expect(res.error).toBeDefined()
  })
}) 