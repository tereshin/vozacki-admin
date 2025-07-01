import { describe, it, expect } from 'vitest'
import { useFormatDate } from '../../../../../composables/utils/format/useFormatDate'

describe('useFormatDate', () => {
  const { 
    formatDate, 
    formatDateShort, 
    formatDateLong, 
    formatDateOnly, 
    formatTimeOnly 
  } = useFormatDate()

  // Тестовая дата для консистентности
  const testDate = new Date('2024-01-15T14:30:00')
  const testDateString = '2024-01-15T14:30:00'

  describe('formatDate', () => {
    it('should format Date object with default options', () => {
      const result = formatDate(testDate)
      
      // Проверяем, что результат содержит основные элементы даты
      expect(result).toContain('2024')
      expect(result).toContain('15')
      expect(result).toContain('14')
      expect(result).toContain('30')
    })

    it('should format date string with default options', () => {
      const result = formatDate(testDateString)
      
      expect(result).toContain('2024')
      expect(result).toContain('15')
    })

    it('should return empty string for empty input', () => {
      expect(formatDate('')).toBe('')
      expect(formatDate(null as any)).toBe('')
      expect(formatDate(undefined as any)).toBe('')
    })

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('')
      expect(formatDate('not-a-date')).toBe('')
      expect(formatDate('2024-13-45')).toBe('') // неверная дата
    })

    it('should handle different locales', () => {
      const resultRu = formatDate(testDate, undefined, 'ru-RU')
      const resultEn = formatDate(testDate, undefined, 'en-US')
      const resultSr = formatDate(testDate, undefined, 'sr-RS')
      
      // Результаты должны отличаться для разных локалей
      expect(resultRu).not.toBe(resultEn)
      expect(resultEn).not.toBe(resultSr)
      
      // Все должны содержать год
      expect(resultRu).toContain('2024')
      expect(resultEn).toContain('2024')
      expect(resultSr).toContain('2024')
    })

    it('should handle custom format options', () => {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
      
      const result = formatDate(testDate, options, 'en-US')
      
      expect(result).toContain('2024')
      expect(result).toContain('15')
      expect(result).toMatch(/Jan|January/) // короткий месяц
    })
  })

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const result = formatDateShort(testDate)
      
      // Короткий формат должен содержать дату и время
      expect(result).toContain('2024')
      expect(result).toContain('15')
      expect(result).toContain('01')
      expect(result).toContain('14')
      expect(result).toContain('30')
    })

    it('should work with different locales', () => {
      const resultRu = formatDateShort(testDate, 'ru-RU')
      const resultEn = formatDateShort(testDate, 'en-US')
      
      expect(resultRu).not.toBe(resultEn)
      expect(resultRu).toContain('2024')
      expect(resultEn).toContain('2024')
    })

    it('should handle string dates', () => {
      const result = formatDateShort(testDateString)
      expect(result).toContain('2024')
    })
  })

  describe('formatDateLong', () => {
    it('should format date in long format', () => {
      const result = formatDateLong(testDate)
      
      // Длинный формат должен содержать полное название месяца
      expect(result).toContain('2024')
      expect(result).toContain('15')
      expect(result).toContain('14')
      expect(result).toContain('30')
    })

    it('should work with different locales', () => {
      const resultRu = formatDateLong(testDate, 'ru-RU')
      const resultEn = formatDateLong(testDate, 'en-US')
      
      expect(resultRu).not.toBe(resultEn)
    })
  })

  describe('formatDateOnly', () => {
    it('should format only date without time', () => {
      const result = formatDateOnly(testDate)
      
      // Должно содержать дату, но не время
      expect(result).toContain('2024')
      expect(result).toContain('15')
      
      // Не должно содержать время
      expect(result).not.toContain('14:30')
      expect(result).not.toContain('14')
    })

    it('should work with different locales', () => {
      const resultRu = formatDateOnly(testDate, 'ru-RU')
      const resultEn = formatDateOnly(testDate, 'en-US')
      
      expect(resultRu).not.toBe(resultEn)
      expect(resultRu).toContain('2024')
      expect(resultEn).toContain('2024')
    })
  })

  describe('formatTimeOnly', () => {
    it('should format only time without date', () => {
      const result = formatTimeOnly(testDate)
      
      // Должно содержать время
      expect(result).toContain('14')
      expect(result).toContain('30')
      
      // Не должно содержать дату
      expect(result).not.toContain('2024')
      expect(result).not.toContain('15')
      expect(result).not.toContain('январ') // не должно быть месяца
    })

    it('should work with different locales', () => {
      const resultRu = formatTimeOnly(testDate, 'ru-RU')
      const resultEn = formatTimeOnly(testDate, 'en-US')
      
      // Время может форматироваться по-разному (12/24 час)
      expect(resultRu).toContain('14')
      expect(resultEn).toMatch(/14|2/) // 14:30 или 2:30 PM
    })
  })

  describe('edge cases', () => {
    it('should handle dates at year boundaries', () => {
      const newYear = new Date('2024-01-01T00:00:00')
      const yearEnd = new Date('2023-12-31T23:59:59')
      
      expect(formatDate(newYear)).toContain('2024')
      expect(formatDate(yearEnd)).toContain('2023')
    })

    it('should handle leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00')
      const result = formatDate(leapDay)
      
      expect(result).toContain('2024')
      expect(result).toContain('29')
    })

    it('should handle different timezones consistently', () => {
      // Тест для консистентности обработки часовых поясов
      const date1 = new Date('2024-01-15T14:30:00Z')
      const date2 = new Date('2024-01-15T14:30:00+03:00')
      
      const result1 = formatDateOnly(date1)
      const result2 = formatDateOnly(date2)
      
      // Оба должны содержать год и день
      expect(result1).toContain('2024')
      expect(result2).toContain('2024')
    })

    it('should handle very old and future dates', () => {
      const oldDate = new Date('1900-01-01')
      const futureDate = new Date('2100-12-31')
      
      expect(formatDate(oldDate)).toContain('1900')
      expect(formatDate(futureDate)).toContain('2100')
    })
  })

  describe('consistency tests', () => {
    it('should be consistent across multiple calls', () => {
      const result1 = formatDate(testDate)
      const result2 = formatDate(testDate)
      
      expect(result1).toBe(result2)
    })

    it('should handle same date in different formats consistently', () => {
      const dateObj = new Date('2024-01-15T14:30:00')
      const dateString = '2024-01-15T14:30:00'
      
      const result1 = formatDateOnly(dateObj)
      const result2 = formatDateOnly(dateString)
      
      // Результаты должны быть одинаковыми
      expect(result1).toBe(result2)
    })
  })
}) 