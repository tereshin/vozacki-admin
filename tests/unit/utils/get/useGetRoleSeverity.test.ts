import { describe, it, expect } from 'vitest'
import { useGetRoleSeverity } from '../../../../composables/utils/get/useGetRoleSeverity'

describe('useGetRoleSeverity', () => {
  const { 
    getRoleSeverity, 
    getRoleClass, 
    getRoleColor, 
    getRoleIcon, 
    isAdminRole 
  } = useGetRoleSeverity()

  describe('getRoleSeverity', () => {
    it('should return danger for admin roles', () => {
      expect(getRoleSeverity('admin')).toBe('danger')
      expect(getRoleSeverity('administrator')).toBe('danger')
      expect(getRoleSeverity('ADMIN')).toBe('danger')
      expect(getRoleSeverity('Administrator')).toBe('danger')
    })

    it('should return warning for moderator roles', () => {
      expect(getRoleSeverity('moderator')).toBe('warning')
      expect(getRoleSeverity('manager')).toBe('warning')
      expect(getRoleSeverity('MODERATOR')).toBe('warning')
      expect(getRoleSeverity('Manager')).toBe('warning')
    })

    it('should return info for user roles', () => {
      expect(getRoleSeverity('user')).toBe('info')
      expect(getRoleSeverity('member')).toBe('info')
      expect(getRoleSeverity('USER')).toBe('info')
      expect(getRoleSeverity('Member')).toBe('info')
    })

    it('should return success for guest role', () => {
      expect(getRoleSeverity('guest')).toBe('success')
      expect(getRoleSeverity('GUEST')).toBe('success')
      expect(getRoleSeverity('Guest')).toBe('success')
    })

    it('should return info for unknown roles', () => {
      expect(getRoleSeverity('unknown')).toBe('info')
      expect(getRoleSeverity('custom')).toBe('info')
      expect(getRoleSeverity('')).toBe('info')
      expect(getRoleSeverity(null as any)).toBe('info')
      expect(getRoleSeverity(undefined as any)).toBe('info')
    })
  })

  describe('getRoleClass', () => {
    it('should return correct CSS classes for each severity', () => {
      expect(getRoleClass('admin')).toBe('text-red-600 bg-red-50 border-red-200')
      expect(getRoleClass('moderator')).toBe('text-orange-600 bg-orange-50 border-orange-200')
      expect(getRoleClass('user')).toBe('text-blue-600 bg-blue-50 border-blue-200')
      expect(getRoleClass('guest')).toBe('text-green-600 bg-green-50 border-green-200')
    })

    it('should return default class for unknown roles', () => {
      expect(getRoleClass('unknown')).toBe('text-blue-600 bg-blue-50 border-blue-200')
      expect(getRoleClass('')).toBe('text-blue-600 bg-blue-50 border-blue-200')
    })
  })

  describe('getRoleColor', () => {
    it('should return correct hex colors for each severity', () => {
      expect(getRoleColor('admin')).toBe('#ef4444')
      expect(getRoleColor('moderator')).toBe('#f97316')
      expect(getRoleColor('user')).toBe('#3b82f6')
      expect(getRoleColor('guest')).toBe('#10b981')
    })

    it('should return default color for unknown roles', () => {
      expect(getRoleColor('unknown')).toBe('#3b82f6')
      expect(getRoleColor('')).toBe('#3b82f6')
    })
  })

  describe('getRoleIcon', () => {
    it('should return correct PrimeIcons for each role', () => {
      expect(getRoleIcon('admin')).toBe('pi pi-crown')
      expect(getRoleIcon('administrator')).toBe('pi pi-crown')
      expect(getRoleIcon('moderator')).toBe('pi pi-shield')
      expect(getRoleIcon('manager')).toBe('pi pi-shield')
      expect(getRoleIcon('user')).toBe('pi pi-user')
      expect(getRoleIcon('member')).toBe('pi pi-user')
      expect(getRoleIcon('guest')).toBe('pi pi-eye')
    })

    it('should return default icon for unknown roles', () => {
      expect(getRoleIcon('unknown')).toBe('pi pi-user')
      expect(getRoleIcon('')).toBe('pi pi-user')
      expect(getRoleIcon(null as any)).toBe('pi pi-user')
    })

    it('should handle case insensitive roles', () => {
      expect(getRoleIcon('ADMIN')).toBe('pi pi-crown')
      expect(getRoleIcon('Admin')).toBe('pi pi-crown')
      expect(getRoleIcon('MODERATOR')).toBe('pi pi-shield')
      expect(getRoleIcon('User')).toBe('pi pi-user')
    })
  })

  describe('isAdminRole', () => {
    it('should return true for administrative roles', () => {
      expect(isAdminRole('admin')).toBe(true)
      expect(isAdminRole('administrator')).toBe(true)
      expect(isAdminRole('moderator')).toBe(true)
      expect(isAdminRole('manager')).toBe(true)
    })

    it('should handle case insensitive roles', () => {
      expect(isAdminRole('ADMIN')).toBe(true)
      expect(isAdminRole('Administrator')).toBe(true)
      expect(isAdminRole('MODERATOR')).toBe(true)
      expect(isAdminRole('Manager')).toBe(true)
    })

    it('should return false for non-administrative roles', () => {
      expect(isAdminRole('user')).toBe(false)
      expect(isAdminRole('member')).toBe(false)
      expect(isAdminRole('guest')).toBe(false)
      expect(isAdminRole('unknown')).toBe(false)
      expect(isAdminRole('')).toBe(false)
      expect(isAdminRole(null as any)).toBe(false)
      expect(isAdminRole(undefined as any)).toBe(false)
    })
  })

  describe('integration tests', () => {
    it('should work consistently across all functions for same role', () => {
      const role = 'admin'
      
      expect(getRoleSeverity(role)).toBe('danger')
      expect(getRoleClass(role)).toContain('text-red-600')
      expect(getRoleColor(role)).toBe('#ef4444')
      expect(getRoleIcon(role)).toBe('pi pi-crown')
      expect(isAdminRole(role)).toBe(true)
    })

    it('should handle edge cases consistently', () => {
      const invalidRole = null as any
      
      expect(getRoleSeverity(invalidRole)).toBe('info')
      expect(getRoleClass(invalidRole)).toContain('text-blue-600')
      expect(getRoleColor(invalidRole)).toBe('#3b82f6')
      expect(getRoleIcon(invalidRole)).toBe('pi pi-user')
      expect(isAdminRole(invalidRole)).toBe(false)
    })
  })
}) 