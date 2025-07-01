import { describe, it, expect } from 'vitest'
import { useGetIcon } from '../../../../../composables/utils/get/useGetIcon'

describe('useGetIcon', () => {
  it('should return correct icon component for valid icon names', () => {
    // Проверяем, что функция возвращает что-то (компонент)
    expect(useGetIcon('menu')).toBeDefined()
    expect(useGetIcon('home')).toBeDefined()
    expect(useGetIcon('sidebar-open')).toBeDefined()
    expect(useGetIcon('sidebar-close')).toBeDefined()
    expect(useGetIcon('flag')).toBeDefined()
    expect(useGetIcon('folder')).toBeDefined()
    expect(useGetIcon('folder-plus')).toBeDefined()
    expect(useGetIcon('user-square')).toBeDefined()
    expect(useGetIcon('book-1')).toBeDefined()
    expect(useGetIcon('book-2')).toBeDefined()
    expect(useGetIcon('users-1')).toBeDefined()
  })

  it('should return undefined for invalid icon names', () => {
    expect(useGetIcon('invalid-icon' as any)).toBeUndefined()
    expect(useGetIcon('non-existent' as any)).toBeUndefined()
    expect(useGetIcon('' as any)).toBeUndefined()
  })

  it('should handle case sensitive icon names', () => {
    // Функция должна быть case sensitive
    expect(useGetIcon('MENU' as any)).toBeUndefined()
    expect(useGetIcon('Menu' as any)).toBeUndefined()
    expect(useGetIcon('HOME' as any)).toBeUndefined()
  })

  it('should return different components for different icons', () => {
    const menuIcon = useGetIcon('menu')
    const homeIcon = useGetIcon('home')
    const flagIcon = useGetIcon('flag')
    
    // Каждая иконка должна быть уникальной
    expect(menuIcon).not.toBe(homeIcon)
    expect(homeIcon).not.toBe(flagIcon)
    expect(menuIcon).not.toBe(flagIcon)
  })

  it('should handle all available icon types', () => {
    const availableIcons = [
      'menu',
      'sidebar-open', 
      'sidebar-close',
      'flag',
      'folder',
      'folder-plus',
      'user-square',
      'home',
      'book-1',
      'book-2',
      'users-1'
    ]

    availableIcons.forEach(iconName => {
      const icon = useGetIcon(iconName as any)
      expect(icon).toBeDefined()
      expect(icon).not.toBeUndefined()
    })
  })

  it('should be consistent on multiple calls', () => {
    const icon1 = useGetIcon('menu')
    const icon2 = useGetIcon('menu')
    
    // Должна возвращать тот же компонент при повторных вызовах
    expect(icon1).toBe(icon2)
  })

  describe('specific icon mappings', () => {
    it('should map sidebar icons correctly', () => {
      const openIcon = useGetIcon('sidebar-open')
      const closeIcon = useGetIcon('sidebar-close')
      
      expect(openIcon).toBeDefined()
      expect(closeIcon).toBeDefined()
      expect(openIcon).not.toBe(closeIcon)
    })

    it('should map folder icons correctly', () => {
      const folderIcon = useGetIcon('folder')
      const folderPlusIcon = useGetIcon('folder-plus')
      
      expect(folderIcon).toBeDefined()
      expect(folderPlusIcon).toBeDefined()
      expect(folderIcon).not.toBe(folderPlusIcon)
    })

    it('should map book icons correctly', () => {
      const book1Icon = useGetIcon('book-1')
      const book2Icon = useGetIcon('book-2')
      
      expect(book1Icon).toBeDefined()
      expect(book2Icon).toBeDefined()
      expect(book1Icon).not.toBe(book2Icon)
    })
  })
}) 