import { describe, it, expect } from 'vitest'
import { useIsEmpty } from '../../../../../composables/utils/is/useIsEmpty'

describe('useIsEmpty', () => {
  describe('null and undefined values', () => {
    it('should return true for null', () => {
      expect(useIsEmpty(null)).toBe(true)
    })

    it('should return true for undefined', () => {
      expect(useIsEmpty(undefined)).toBe(true)
    })
  })

  describe('arrays', () => {
    it('should return true for empty array', () => {
      expect(useIsEmpty([])).toBe(true)
    })

    it('should return false for non-empty array', () => {
      expect(useIsEmpty([1, 2, 3])).toBe(false)
      expect(useIsEmpty(['test'])).toBe(false)
      expect(useIsEmpty([null])).toBe(false) // содержит элемент, даже если null
    })
  })

  describe('objects', () => {
    it('should return true for empty object', () => {
      expect(useIsEmpty({})).toBe(true)
    })

    it('should return false for non-empty object', () => {
      expect(useIsEmpty({ key: 'value' })).toBe(false)
      expect(useIsEmpty({ a: 1, b: 2 })).toBe(false)
      expect(useIsEmpty({ key: null })).toBe(false) // содержит ключ
    })
  })

  describe('primitive values', () => {
    it('should return false for non-empty strings', () => {
      expect(useIsEmpty('test')).toBe(false)
      expect(useIsEmpty('0')).toBe(false)
      expect(useIsEmpty(' ')).toBe(false) // пробел - не пустая строка
    })

    it('should return false for empty string', () => {
      expect(useIsEmpty('')).toBe(false) // функция не считает пустую строку пустой
    })

    it('should return false for numbers', () => {
      expect(useIsEmpty(0)).toBe(false)
      expect(useIsEmpty(42)).toBe(false)
      expect(useIsEmpty(-1)).toBe(false)
      expect(useIsEmpty(NaN)).toBe(false)
    })

    it('should return false for booleans', () => {
      expect(useIsEmpty(true)).toBe(false)
      expect(useIsEmpty(false)).toBe(false)
    })
  })

  describe('special cases', () => {
    it('should handle Date objects', () => {
      expect(useIsEmpty(new Date())).toBe(false) // Date объект имеет свойства
    })

    it('should handle functions', () => {
      expect(useIsEmpty(() => {})).toBe(false)
      expect(useIsEmpty(function() {})).toBe(false)
    })

    it('should handle Map and Set', () => {
      expect(useIsEmpty(new Map())).toBe(true) // пустая Map
      expect(useIsEmpty(new Set())).toBe(true) // пустая Set
      
      const map = new Map()
      map.set('key', 'value')
      expect(useIsEmpty(map)).toBe(false)
      
      const set = new Set()
      set.add('value')
      expect(useIsEmpty(set)).toBe(false)
    })
  })
}) 