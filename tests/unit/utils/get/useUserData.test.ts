import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AdministratorUser } from '../../../../types/auth'

// Моки должны быть объявлены до импорта
vi.mock('pinia', () => ({
  storeToRefs: vi.fn()
}))

vi.mock('~/store/auth', () => ({
  useAuthStore: vi.fn()
}))

const { useUserData } = await import('../../../../composables/utils/get/useUserData')

describe('useUserData', () => {
  let mockAuthStore: any
  let mockStoreToRefs: any
  let mockUseAuthStore: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Создаем мок store
    mockAuthStore = {
      user: null
    }

    // Получаем моки
    const { storeToRefs } = await import('pinia')
    const { useAuthStore } = await import('~/store/auth')
    
    mockStoreToRefs = vi.mocked(storeToRefs)
    mockUseAuthStore = vi.mocked(useAuthStore)
    
    mockUseAuthStore.mockReturnValue(mockAuthStore)
    mockStoreToRefs.mockReturnValue({
      user: { value: mockAuthStore.user }
    })
  })

  it('should return userData ref when user is null', () => {
    // Arrange
    mockAuthStore.user = null
    mockStoreToRefs.mockReturnValue({
      user: { value: null }
    })
    
    // Act
    const { userData } = useUserData()
    
    // Assert
    expect(userData).toBeDefined()
    expect(userData.value).toBeNull()
  })

  it('should return userData ref when user exists', () => {
    // Arrange
    const testUser: AdministratorUser = {
      id: '1',
      email: 'admin@test.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      full_name: 'Test Admin',
      first_name: 'Test',
      last_name: 'Admin',
      role: {
        id: '1',
        code: 'admin',
        name: 'Administrator'
      }
    }

    mockAuthStore.user = testUser
    mockStoreToRefs.mockReturnValue({
      user: { value: testUser }
    })

    // Act
    const { userData } = useUserData()
    
    // Assert
    expect(userData).toBeDefined()
    expect(userData.value).toEqual(testUser)
  })

  it('should use storeToRefs correctly', () => {
    // Act
    useUserData()
    
    // Assert
    expect(mockStoreToRefs).toHaveBeenCalledTimes(1)
    expect(mockStoreToRefs).toHaveBeenCalledWith(mockAuthStore)
  })

  it('should handle user with minimal data', () => {
    // Arrange
    const minimalUser: AdministratorUser = {
      id: '3',
      email: 'minimal@test.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockAuthStore.user = minimalUser
    mockStoreToRefs.mockReturnValue({
      user: { value: minimalUser }
    })
    
    // Act
    const { userData } = useUserData()
    
    // Assert
    expect(userData.value).toEqual(minimalUser)
    expect(userData.value?.full_name).toBeUndefined()
    expect(userData.value?.role).toBeUndefined()
  })

  it('should handle user with complete role data', () => {
    // Arrange
    const userWithRole: AdministratorUser = {
      id: '4',
      email: 'roleuser@test.com',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      full_name: 'Role User',
      first_name: 'Role',
      last_name: 'User',
      role: {
        id: '3',
        code: 'moderator',
        name: 'Moderator'
      }
    }

    mockAuthStore.user = userWithRole
    mockStoreToRefs.mockReturnValue({
      user: { value: userWithRole }
    })
    
    // Act
    const { userData } = useUserData()
    
    // Assert
    expect(userData.value).toEqual(userWithRole)
    expect(userData.value?.role?.code).toBe('moderator')
    expect(userData.value?.role?.name).toBe('Moderator')
  })

  describe('type safety', () => {
    it('should maintain correct typing for userData', () => {
      // Act
      const { userData } = useUserData()
      
      // Assert
      // TypeScript должен понимать, что это может быть null или AdministratorUser
      expect(typeof userData.value === 'object' || userData.value === null).toBe(true)
      
      if (userData.value) {
        // Если не null, должен иметь требуемые поля
        expect(typeof userData.value.id).toBe('string')
        expect(typeof userData.value.email).toBe('string')
      }
    })

    it('should handle edge cases gracefully', () => {
      // Arrange & Act & Assert
      // Проверяем, что функция не падает при различных состояниях
      mockAuthStore.user = null
      expect(() => useUserData()).not.toThrow()
      
      mockAuthStore.user = {} as AdministratorUser
      expect(() => useUserData()).not.toThrow()
    })
  })
}) 