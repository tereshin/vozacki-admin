import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global ref before any imports
const mockRef = vi.fn((value: any) => ({
  value,
  __v_isRef: true
}))
vi.stubGlobal('ref', mockRef)

// Mock pinia
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Mock API functions - these need to be declared at the top level
const getContentUidsSpy = vi.fn()
const getSingleContentUidSpy = vi.fn()
const createContentUidSpy = vi.fn()
const updateContentUidSpy = vi.fn()
const deleteContentUidSpy = vi.fn()

// Mock useContentUidsApi as a global function
const mockUseContentUidsApi = () => ({
  getContentUids: getContentUidsSpy,
  getSingleContentUid: getSingleContentUidSpy,
  createContentUid: createContentUidSpy,
  updateContentUid: updateContentUidSpy,
  deleteContentUid: deleteContentUidSpy
})
vi.stubGlobal('useContentUidsApi', mockUseContentUidsApi)

import { useContentUidsStore } from '~/store/content-uids'

// Mock API responses
const mockContentUid = {
  uid: 'test-content-uid',
  content_type: 'article',
  language_id: '1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockApiResponse = {
  data: {
    collection: [mockContentUid],
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 10,
      to: 1,
      total: 1
    }
  }
}

describe('useContentUidsStore', () => {
  let store: ReturnType<typeof useContentUidsStore>

  beforeEach(() => {
    store = useContentUidsStore()
    vi.clearAllMocks()
    
    // Reset mock implementations in beforeEach
    getContentUidsSpy.mockResolvedValue(mockApiResponse)
    getSingleContentUidSpy.mockResolvedValue({ data: mockContentUid })
    createContentUidSpy.mockResolvedValue({ data: mockContentUid })
    updateContentUidSpy.mockResolvedValue({ data: { ...mockContentUid, content_type: 'category' } })
    deleteContentUidSpy.mockResolvedValue({})
  })

  it('initializes with default values', () => {
    expect((store.items as any).value).toEqual([])
    expect((store.loading as any).value).toBe(false)
    expect((store.error as any).value).toBeNull()
    expect((store.meta as any).value).toEqual({
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 10,
      to: 10,
      total: 0
    })
  })

  describe('getContentUids', () => {
    it('fetches content uids successfully', async () => {
      const payload = { content_type: 'article', language_id: '1' }
      await store.getContentUids(payload)
      
      expect(getContentUidsSpy).toHaveBeenCalledWith(payload)
      expect((store.items as any).value).toEqual([mockContentUid])
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles errors', async () => {
      const error = new Error('Failed to fetch')
      getContentUidsSpy.mockRejectedValueOnce(error)

      await expect(store.getContentUids()).rejects.toThrow('Failed to fetch')
      expect((store.error as any).value).toBe('Failed to fetch')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getSingleContentUid', () => {
    it('fetches single content uid successfully', async () => {
      const result = await store.getSingleContentUid('test-content-uid')
      
      expect(getSingleContentUidSpy).toHaveBeenCalledWith('test-content-uid')
      expect(result).toEqual(mockContentUid)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles error when content uid not found', async () => {
      const error = new Error('Content UID not found')
      getSingleContentUidSpy.mockRejectedValueOnce(error)

      await expect(store.getSingleContentUid('non-existent')).rejects.toThrow('Content UID not found')
      expect((store.error as any).value).toBe('Content UID not found')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('createContentUid', () => {
    it('creates content uid successfully', async () => {
      const newContentUid = {
        uid: 'new-content-uid',
        content_type: 'article',
        language_id: '1'
      }
      const result = await store.createContentUid(newContentUid)
      
      expect(createContentUidSpy).toHaveBeenCalledWith(newContentUid)
      expect(result).toEqual(mockContentUid)
      expect((store.items as any).value[0]).toEqual(mockContentUid)
      expect((store.meta as any).value.total).toBe(1)
    })

    it('handles validation errors', async () => {
      const error = new Error('Validation failed')
      createContentUidSpy.mockRejectedValueOnce(error)
      const invalidContentUid = {
        uid: '', // Invalid empty uid
        content_type: '',
        language_id: '1'
      }

      await expect(store.createContentUid(invalidContentUid)).rejects.toThrow('Validation failed')
      expect((store.error as any).value).toBe('Validation failed')
      expect((store.loading as any).value).toBe(false)
    })

    it('handles duplicate uid error', async () => {
      const error = new Error('Content UID already exists')
      createContentUidSpy.mockRejectedValueOnce(error)
      const duplicateContentUid = {
        uid: 'test-content-uid', // Already exists
        content_type: 'article',
        language_id: '1'
      }

      await expect(store.createContentUid(duplicateContentUid)).rejects.toThrow('Content UID already exists')
      expect((store.error as any).value).toBe('Content UID already exists')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('updateContentUid', () => {
    it('updates content uid successfully', async () => {
      // First add a content uid to update
      await store.getContentUids()
      
      const updateData = { content_type: 'category' }
      const result = await store.updateContentUid('test-content-uid', updateData)
      
      expect(updateContentUidSpy).toHaveBeenCalledWith('test-content-uid', updateData)
      expect(result.content_type).toBe('category')
      expect((store.items as any).value[0].content_type).toBe('category')
    })

    it('handles non-existent content uid update', async () => {
      const updateData = { content_type: 'category' }
      const result = await store.updateContentUid('non-existent', updateData)
      
      expect(updateContentUidSpy).toHaveBeenCalledWith('non-existent', updateData)
      expect(result.content_type).toBe('category')
      // Should not modify items array since content uid wasn't found
      expect((store.items as any).value.length).toBe(0)
    })
  })

  describe('deleteContentUid', () => {
    it('deletes content uid successfully', async () => {
      // First add a content uid to delete
      await store.getContentUids()
      
      await store.deleteContentUid('test-content-uid')
      
      expect(deleteContentUidSpy).toHaveBeenCalledWith('test-content-uid')
      expect((store.items as any).value).toHaveLength(0)
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles non-existent content uid deletion', async () => {
      await store.deleteContentUid('non-existent')
      
      expect(deleteContentUidSpy).toHaveBeenCalledWith('non-existent')
      // Should not modify meta since content uid wasn't in the list
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles deletion error', async () => {
      const error = new Error('Cannot delete content uid in use')
      deleteContentUidSpy.mockRejectedValueOnce(error)

      await expect(store.deleteContentUid('test-content-uid')).rejects.toThrow('Cannot delete content uid in use')
      expect((store.error as any).value).toBe('Cannot delete content uid in use')
      expect((store.loading as any).value).toBe(false)
    })
  })
}) 