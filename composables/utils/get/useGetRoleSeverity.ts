/**
 * Composable для работы с цветовой схемой ролей
 */
export const useGetRoleSeverity = () => {
  /**
   * Получает цветовую схему (severity) для роли пользователя
   * @param role - Роль пользователя
   * @returns Цветовая схема для PrimeVue компонентов
   */
  const getRoleSeverity = (role: string): 'success' | 'info' | 'warning' | 'danger' => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'danger'
      case 'moderator':
      case 'manager':
        return 'warning'
      case 'user':
      case 'member':
        return 'info'
      case 'guest':
        return 'success'
      default:
        return 'info'
    }
  }

  /**
   * Получает CSS класс для роли пользователя
   * @param role - Роль пользователя
   * @returns CSS класс
   */
  const getRoleClass = (role: string): string => {
    const severity = getRoleSeverity(role)
    const classMap = {
      'danger': 'text-red-600 bg-red-50 border-red-200',
      'warning': 'text-orange-600 bg-orange-50 border-orange-200',
      'info': 'text-blue-600 bg-blue-50 border-blue-200',
      'success': 'text-green-600 bg-green-50 border-green-200'
    }
    
    return classMap[severity] || classMap.info
  }

  /**
   * Получает цвет фона для роли пользователя
   * @param role - Роль пользователя
   * @returns HEX код цвета
   */
  const getRoleColor = (role: string): string => {
    const severity = getRoleSeverity(role)
    const colorMap = {
      'danger': '#ef4444',
      'warning': '#f97316',
      'info': '#3b82f6',
      'success': '#10b981'
    }
    
    return colorMap[severity] || colorMap.info
  }

  /**
   * Получает иконку для роли пользователя
   * @param role - Роль пользователя
   * @returns Класс иконки PrimeIcons
   */
  const getRoleIcon = (role: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'pi pi-crown'
      case 'moderator':
      case 'manager':
        return 'pi pi-shield'
      case 'user':
      case 'member':
        return 'pi pi-user'
      case 'guest':
        return 'pi pi-eye'
      default:
        return 'pi pi-user'
    }
  }

  /**
   * Проверяет, является ли роль административной
   * @param role - Роль пользователя
   * @returns True, если роль административная
   */
  const isAdminRole = (role: string): boolean => {
    const adminRoles = ['admin', 'administrator', 'moderator', 'manager']
    return adminRoles.includes(role?.toLowerCase())
  }

  return {
    getRoleSeverity,
    getRoleClass,
    getRoleColor,
    getRoleIcon,
    isAdminRole
  }
} 