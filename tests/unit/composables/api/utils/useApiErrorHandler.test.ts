import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApiErrorHandler } from '~/composables/api/utils/useApiErrorHandler'

describe('useApiErrorHandler', () => {
  let toastAddMock: ReturnType<typeof vi.fn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    toastAddMock = vi.fn()
    // Stub global PrimeVue toast
    vi.stubGlobal('useToast', () => ({ add: toastAddMock }))
    // Silence console.error type mismatch workaround
    // @ts-expect-error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    consoleErrorSpy.mockRestore()
  })

  it('createError returns expected object', () => {
    const { createError } = useApiErrorHandler()
    const err = createError('msg', 'C1', { foo: 'bar' }, 404)
    expect(err).toEqual({ message: 'msg', code: 'C1', details: { foo: 'bar' }, statusCode: 404 })
  })

  it('handleError transforms HTTP error response and shows toast', () => {
    const { handleError } = useApiErrorHandler()
    const httpErr = {
      response: {
        _data: { message: 'Not found', code: 'NF' },
        status: 404
      }
    }
    try {
      handleError(httpErr, 'fetching stuff')
    } catch (e: any) {
      expect(e).toEqual({ message: 'Not found', code: 'NF', details: { message: 'Not found', code: 'NF' }, statusCode: 404 })
    }
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ detail: 'Not found' }))
  })

  it('handleError transforms generic error and shows toast', () => {
    const { handleError } = useApiErrorHandler()
    const err = new Error('Boom')
    try {
      handleError(err, 'context')
    } catch (e: any) {
      expect(e.message).toBe('Boom')
    }
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ detail: 'Boom' }))
  })

  it('logError shows toast when silent is false', () => {
    const { logError } = useApiErrorHandler()
    logError(new Error('fail'), 'context')
    expect(toastAddMock).toHaveBeenCalled()
  })

  it('logError does not show toast when silent is true', () => {
    const { logError } = useApiErrorHandler()
    logError(new Error('fail'), 'context', true)
    expect(toastAddMock).not.toHaveBeenCalled()
  })
}) 