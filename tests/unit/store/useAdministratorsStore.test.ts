import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock pinia defineStore
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Vue reactivity stubs
const createRef = (v: any) => ({
  value: v,
  __v_isRef: true
})
vi.stubGlobal('ref', createRef)

// Mock API responses
const mockAdministrator = {
  id: '1',
  email: 'admin@test.com',
  first_name: 'John',
  last_name: 'Doe',
  role: { id: '1', name: 'Admin', code: 'admin' }
}

const mockApiResponse = {
  data: {
    collection: [mockAdministrator],
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

// Mock API functions
const getAdministratorsSpy = vi.fn().mockResolvedValue(mockApiResponse)
const getSingleAdministratorSpy = vi.fn().mockResolvedValue({ data: mockAdministrator })
const createAdministratorSpy = vi.fn().mockResolvedValue({ data: mockAdministrator })
const updateAdministratorSpy = vi.fn().mockResolvedValue({ data: { ...mockAdministrator, first_name: 'Jane' } })
const deleteAdministratorSpy = vi.fn().mockResolvedValue({})

vi.stubGlobal('useAdministratorsApi', () => ({
  getAdministrators: getAdministratorsSpy,
  getSingleAdministrator: getSingleAdministratorSpy,
  createAdministrator: createAdministratorSpy,
  updateAdministrator: updateAdministratorSpy,
  deleteAdministrator: deleteAdministratorSpy
}))

import { useAdministratorsStore } from '~/store/administrators'

describe('useAdministratorsStore', () => {
  let store: ReturnType<typeof useAdministratorsStore>

  beforeEach(() => {
    store = useAdministratorsStore()
    vi.clearAllMocks()
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

  describe('getAdministrators', () => {
    it('fetches administrators successfully', async () => {
      await store.getAdministrators()
      
      expect(getAdministratorsSpy).toHaveBeenCalled()
      expect((store.items as any).value).toEqual([mockAdministrator])
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles errors', async () => {
      const error = new Error('Failed to fetch')
      getAdministratorsSpy.mockRejectedValueOnce(error)

      await expect(store.getAdministrators()).rejects.toThrow('Failed to fetch')
      expect((store.error as any).value).toBe('Failed to fetch')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getSingleAdministrator', () => {
    it('fetches single administrator successfully', async () => {
      const result = await store.getSingleAdministrator('1')
      
      expect(getSingleAdministratorSpy).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockAdministrator)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })
  })

  describe('createAdministrator', () => {
    it('creates administrator successfully', async () => {
      const newAdmin = { email: 'new@test.com', password: '123456', role_id: '1' }
      const result = await store.createAdministrator(newAdmin)
      
      expect(createAdministratorSpy).toHaveBeenCalledWith(newAdmin)
      expect(result).toEqual(mockAdministrator)
      expect((store.items as any).value[0]).toEqual(mockAdministrator)
      expect((store.meta as any).value.total).toBe(1)
    })
  })

  describe('updateAdministrator', () => {
    it('updates administrator successfully', async () => {
      // First add an administrator to update
      await store.getAdministrators()
      
      const updateData = { first_name: 'Jane' }
      const result = await store.updateAdministrator('1', updateData)
      
      expect(updateAdministratorSpy).toHaveBeenCalledWith('1', updateData)
      expect(result.first_name).toBe('Jane')
      expect((store.items as any).value[0].first_name).toBe('Jane')
    })
  })

  describe('deleteAdministrator', () => {
    it('deletes administrator successfully', async () => {
      // First add an administrator to delete
      await store.getAdministrators()
      
      await store.deleteAdministrator('1')
      
      expect(deleteAdministratorSpy).toHaveBeenCalledWith('1')
      expect((store.items as any).value).toHaveLength(0)
      expect((store.meta as any).value.total).toBe(0)
    })
  })
}) 