import { describe, it, expect } from 'vitest'
import { useGetInitials } from '../../../../composables/utils/get/useGetInitials'

describe('useGetInitials', () => {
  const { getInitials, getInitialsFromFullName, getInitialsFromEmail } = useGetInitials()

  describe('getInitials', () => {
    it('should return initials from first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD')
      expect(getInitials('Анна', 'Петрова')).toBe('АП')
      expect(getInitials('Марко', 'Петровић')).toBe('МП')
    })

    it('should handle single name', () => {
      expect(getInitials('John', null)).toBe('J')
      expect(getInitials(null, 'Doe')).toBe('D')
      expect(getInitials('John', '')).toBe('J')
      expect(getInitials('', 'Doe')).toBe('D')
    })

    it('should return default value when no names provided', () => {
      expect(getInitials(null, null)).toBe('A')
      expect(getInitials('', '')).toBe('A')
      expect(getInitials(undefined, undefined)).toBe('A')
    })

    it('should use custom default value', () => {
      expect(getInitials(null, null, 'X')).toBe('X')
      expect(getInitials('', '', 'UN')).toBe('UN')
    })

    it('should handle names with extra spaces', () => {
      expect(getInitials('  John  ', '  Doe  ')).toBe('JD')
      expect(getInitials(' J ', ' D ')).toBe('JD')
    })

    it('should handle special characters', () => {
      expect(getInitials('Jean-Luc', 'O\'Brien')).toBe('JO')
      expect(getInitials('María', 'José')).toBe('MJ')
    })

    it('should convert to uppercase', () => {
      expect(getInitials('john', 'doe')).toBe('JD')
      expect(getInitials('JOHN', 'DOE')).toBe('JD')
      expect(getInitials('jOhN', 'dOe')).toBe('JD')
    })
  })

  describe('getInitialsFromFullName', () => {
    it('should return initials from full name', () => {
      expect(getInitialsFromFullName('John Doe')).toBe('JD')
      expect(getInitialsFromFullName('Анна Петрова')).toBe('АП')
      expect(getInitialsFromFullName('Марко Петровић')).toBe('МП')
    })

    it('should handle single name', () => {
      expect(getInitialsFromFullName('John')).toBe('J')
      expect(getInitialsFromFullName('Анна')).toBe('А')
    })

    it('should handle multiple names (use first two)', () => {
      expect(getInitialsFromFullName('John Michael Doe')).toBe('JM')
      expect(getInitialsFromFullName('María José García López')).toBe('MJ')
    })

    it('should return default value for empty input', () => {
      expect(getInitialsFromFullName('')).toBe('A')
      expect(getInitialsFromFullName(null)).toBe('A')
      expect(getInitialsFromFullName(undefined)).toBe('A')
      expect(getInitialsFromFullName('   ')).toBe('A')
    })

    it('should use custom default value', () => {
      expect(getInitialsFromFullName('', 'X')).toBe('X')
      expect(getInitialsFromFullName(null, 'UN')).toBe('UN')
    })

    it('should handle extra spaces and multiple spaces', () => {
      expect(getInitialsFromFullName('  John   Doe  ')).toBe('JD')
      expect(getInitialsFromFullName('John     Doe')).toBe('JD')
    })

    it('should handle special characters', () => {
      expect(getInitialsFromFullName('Jean-Luc Picard')).toBe('JP')
      expect(getInitialsFromFullName('María José')).toBe('MJ')
    })
  })

  describe('getInitialsFromEmail', () => {
    it('should return first letter of email username', () => {
      expect(getInitialsFromEmail('john.doe@example.com')).toBe('J')
      expect(getInitialsFromEmail('anna@test.rs')).toBe('A')
      expect(getInitialsFromEmail('m.petrovic@domain.com')).toBe('M')
    })

    it('should handle different email formats', () => {
      expect(getInitialsFromEmail('user123@gmail.com')).toBe('U')
      expect(getInitialsFromEmail('test_user@company.rs')).toBe('T')
      expect(getInitialsFromEmail('admin@localhost')).toBe('A')
    })

    it('should return default value for invalid emails', () => {
      expect(getInitialsFromEmail('')).toBe('A')
      expect(getInitialsFromEmail(null)).toBe('A')
      expect(getInitialsFromEmail(undefined)).toBe('A')
      expect(getInitialsFromEmail('   ')).toBe('A')
      expect(getInitialsFromEmail('invalid-email')).toBe('I') // нет @, берет первую букву
    })

    it('should use custom default value', () => {
      expect(getInitialsFromEmail('', 'X')).toBe('X')
      expect(getInitialsFromEmail(null, 'UN')).toBe('UN')
    })

    it('should handle emails with spaces', () => {
      expect(getInitialsFromEmail('  user@test.com  ')).toBe('U')
    })

    it('should convert to uppercase', () => {
      expect(getInitialsFromEmail('john@test.com')).toBe('J')
      expect(getInitialsFromEmail('JOHN@TEST.COM')).toBe('J')
    })

    it('should handle edge cases', () => {
      expect(getInitialsFromEmail('@domain.com')).toBe('A') // пустой username
      expect(getInitialsFromEmail('user@')).toBe('U') // нет домена
      expect(getInitialsFromEmail('a@b')).toBe('A') // минимальный email
    })
  })
}) 