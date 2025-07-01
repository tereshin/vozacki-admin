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
const mockAnswer = {
  id: '1',
  text: 'Test Answer',
  is_correct: true,
  question_id: '1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockApiResponse = {
  data: {
    collection: [mockAnswer],
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
const getAnswersSpy = vi.fn().mockResolvedValue(mockApiResponse)
const getSingleAnswerSpy = vi.fn().mockResolvedValue({ data: mockAnswer })
const createAnswerSpy = vi.fn().mockResolvedValue({ data: mockAnswer })
const updateAnswerSpy = vi.fn().mockResolvedValue({ data: { ...mockAnswer, text: 'Updated Answer' } })
const deleteAnswerSpy = vi.fn().mockResolvedValue({})

vi.stubGlobal('useAnswersApi', () => ({
  getAnswers: getAnswersSpy,
  getSingleAnswer: getSingleAnswerSpy,
  createAnswer: createAnswerSpy,
  updateAnswer: updateAnswerSpy,
  deleteAnswer: deleteAnswerSpy
}))

import { useAnswersStore } from '~/store/answers'

describe('useAnswersStore', () => {
  let store: ReturnType<typeof useAnswersStore>

  beforeEach(() => {
    store = useAnswersStore()
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

  describe('getAnswers', () => {
    it('fetches answers successfully', async () => {
      const payload = { question_id: '1' }
      await store.getAnswers(payload)
      
      expect(getAnswersSpy).toHaveBeenCalledWith(payload)
      expect((store.items as any).value).toEqual([mockAnswer])
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles errors', async () => {
      const error = new Error('Failed to fetch')
      getAnswersSpy.mockRejectedValueOnce(error)

      await expect(store.getAnswers()).rejects.toThrow('Failed to fetch')
      expect((store.error as any).value).toBe('Failed to fetch')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getSingleAnswer', () => {
    it('fetches single answer successfully', async () => {
      const result = await store.getSingleAnswer('1')
      
      expect(getSingleAnswerSpy).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockAnswer)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })
  })

  describe('createAnswer', () => {
    it('creates answer successfully', async () => {
      const newAnswer = { text: 'New Answer', is_correct: true, question_id: '1' }
      const result = await store.createAnswer(newAnswer)
      
      expect(createAnswerSpy).toHaveBeenCalledWith(newAnswer)
      expect(result).toEqual(mockAnswer)
      expect((store.items as any).value[0]).toEqual(mockAnswer)
      expect((store.meta as any).value.total).toBe(1)
    })

    it('handles validation errors', async () => {
      const error = new Error('Validation failed')
      createAnswerSpy.mockRejectedValueOnce(error)
      const newAnswer = { text: '', is_correct: true, question_id: '1' }

      await expect(store.createAnswer(newAnswer)).rejects.toThrow('Validation failed')
      expect((store.error as any).value).toBe('Validation failed')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('updateAnswer', () => {
    it('updates answer successfully', async () => {
      // First add an answer to update
      await store.getAnswers()
      
      const updateData = { text: 'Updated Answer' }
      const result = await store.updateAnswer('1', updateData)
      
      expect(updateAnswerSpy).toHaveBeenCalledWith('1', updateData)
      expect(result.text).toBe('Updated Answer')
      expect((store.items as any).value[0].text).toBe('Updated Answer')
    })

    it('handles non-existent answer update', async () => {
      const updateData = { text: 'Updated Answer' }
      const result = await store.updateAnswer('999', updateData)
      
      expect(updateAnswerSpy).toHaveBeenCalledWith('999', updateData)
      expect(result.text).toBe('Updated Answer')
      // Should not modify items array since answer wasn't found
      expect((store.items as any).value.length).toBe(0)
    })
  })

  describe('deleteAnswer', () => {
    it('deletes answer successfully', async () => {
      // First add an answer to delete
      await store.getAnswers()
      
      await store.deleteAnswer('1')
      
      expect(deleteAnswerSpy).toHaveBeenCalledWith('1')
      expect((store.items as any).value).toHaveLength(0)
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles non-existent answer deletion', async () => {
      await store.deleteAnswer('999')
      
      expect(deleteAnswerSpy).toHaveBeenCalledWith('999')
      // Should not modify meta since answer wasn't in the list
      expect((store.meta as any).value.total).toBe(0)
    })
  })
}) 