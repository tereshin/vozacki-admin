import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthenticatedFetch } from '~/composables/core/api/useAuthenticatedFetch'

// Мокаем глобальный $fetch
const fetchMock = vi.fn()

vi.stubGlobal('$fetch', fetchMock)

// Заглушки для реактивности
vi.stubGlobal('ref', (v:any)=>({value:v}))

// Хелпер для мока useCookie
const mockUseCookie = (token: string | null) => {
  vi.stubGlobal('useCookie', () => ({ value: token }))
}

describe('useAuthenticatedFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // Восстанавливаем базовые стабы
    vi.stubGlobal('$fetch', fetchMock)
    vi.stubGlobal('ref', (v:any)=>({value:v}))
  })

  it('добавляет Authorization заголовок при наличии токена', async () => {
    mockUseCookie('jwt-token')
    fetchMock.mockResolvedValue({ ok: true })

    const { authenticatedFetch } = useAuthenticatedFetch()
    await authenticatedFetch('/api/test', { method: 'GET' })

    expect(fetchMock).toHaveBeenCalled()
    const callArgs = fetchMock.mock.calls[0]
    expect(callArgs[1].headers.Authorization).toBe('Bearer jwt-token')
  })

  it('не добавляет Authorization заголовок при отсутствии токена', async () => {
    mockUseCookie(null)
    fetchMock.mockResolvedValue({ ok: true })

    const { authenticatedFetch } = useAuthenticatedFetch()
    await authenticatedFetch('/api/test', { method: 'POST', body: { a: 1 } })

    const callArgs = fetchMock.mock.calls[0]
    expect(callArgs[1].headers.Authorization).toBeUndefined()
  })
}) 