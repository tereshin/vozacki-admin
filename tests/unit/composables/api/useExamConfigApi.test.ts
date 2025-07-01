import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useExamConfigApi } from '~/composables/api/useExamConfigApi'

const mockCrudMixin = {
  getItemsWithSupabase: vi.fn(),
  getSingleItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}
const mockUseCrudMixin = vi.fn(() => mockCrudMixin)

describe('useExamConfigApi', () => {
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

  it('getExamConfigs: should call crud mixin getItemsWithSupabase', async () => {
    const { getExamConfigs } = useExamConfigApi()
    await getExamConfigs()
    expect(mockCrudMixin.getItemsWithSupabase).toHaveBeenCalled()
  })

  it('getSingleExamConfig: should call crud mixin getSingleItem', async () => {
    const { getSingleExamConfig } = useExamConfigApi()
    await getSingleExamConfig('id')
    expect(mockCrudMixin.getSingleItem).toHaveBeenCalledWith('id')
  })

  it('createExamConfig: should call crud mixin createItem', async () => {
    const { createExamConfig } = useExamConfigApi()
    await createExamConfig({})
    expect(mockCrudMixin.createItem).toHaveBeenCalled()
  })

  it('updateExamConfig: should call crud mixin updateItem', async () => {
    const { updateExamConfig } = useExamConfigApi()
    await updateExamConfig('id', {})
    expect(mockCrudMixin.updateItem).toHaveBeenCalledWith('id', {})
  })

  it('deleteExamConfig: should call crud mixin deleteItem', async () => {
    const { deleteExamConfig } = useExamConfigApi()
    await deleteExamConfig('id')
    expect(mockCrudMixin.deleteItem).toHaveBeenCalledWith('id')
  })

  it('useCrudMixin: should be called with correct parameters', () => {
    useExamConfigApi()
    expect(mockUseCrudMixin).toHaveBeenCalledWith(
      'exam_config'
    )
  })
}) 