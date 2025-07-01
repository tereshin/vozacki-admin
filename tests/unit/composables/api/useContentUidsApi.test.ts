import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Создаём мок для useCrudMixin до импорта тестируемого модуля
const mockCrudMixin = {
  getItemsWithSupabase: vi.fn(),
  getSingleItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}
const mockUseCrudMixin = vi.fn(() => mockCrudMixin)

import { useContentUidsApi } from '~/composables/api/useContentUidsApi'

describe('useContentUidsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useSupabase', () => ({}))
    vi.stubGlobal('useApiErrorHandler', () => ({ handleError: vi.fn() }))
    vi.stubGlobal('useBaseApi', () => ({
      authenticatedFetch: vi.fn(),
      buildApiUrl: vi.fn(),
      handleError: vi.fn(),
      buildSupabaseQuery: vi.fn(),
      applySearchFilter: vi.fn(),
      formatResponse: vi.fn()
    }))
    vi.stubGlobal('useCrudMixin', mockUseCrudMixin)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('getContentUids: should use crud mixin getItemsWithSupabase', async () => {
    const { getContentUids } = useContentUidsApi()
    expect(getContentUids).toBe(mockCrudMixin.getItemsWithSupabase)
  })

  it('getSingleContentUid: should use crud mixin getSingleItem', async () => {
    const { getSingleContentUid } = useContentUidsApi()
    expect(getSingleContentUid).toBe(mockCrudMixin.getSingleItem)
  })

  it('createContentUid: should use crud mixin createItem', async () => {
    const { createContentUid } = useContentUidsApi()
    expect(createContentUid).toBe(mockCrudMixin.createItem)
  })

  it('updateContentUid: should use crud mixin updateItem', async () => {
    const { updateContentUid } = useContentUidsApi()
    expect(updateContentUid).toBe(mockCrudMixin.updateItem)
  })

  it('deleteContentUid: should use crud mixin deleteItem', async () => {
    const { deleteContentUid } = useContentUidsApi()
    expect(deleteContentUid).toBe(mockCrudMixin.deleteItem)
  })

  it('useCrudMixin: should be called with correct parameters', () => {
    useContentUidsApi()
    expect(mockUseCrudMixin).toHaveBeenCalledWith(
      'content_uids',
      ['uid', 'content_type']
    )
  })
}) 