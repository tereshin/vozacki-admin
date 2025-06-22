/**
 * Composable для работы с инициалами пользователей
 */
export const useGetInitials = () => {
  /**
   * Получает инициалы из имени и фамилии
   * @param firstName - Имя пользователя
   * @param lastName - Фамилия пользователя
   * @param defaultValue - Значение по умолчанию, если нет имени
   * @returns Строка с инициалами
   */
  const getInitials = (
    firstName?: string | null, 
    lastName?: string | null,
    defaultValue: string = 'A'
  ): string => {
    const first = firstName?.trim()?.charAt(0).toUpperCase() || ''
    const last = lastName?.trim()?.charAt(0).toUpperCase() || ''
    
    const initials = `${first}${last}`
    return initials || defaultValue
  }

  /**
   * Получает инициалы из полного имени (Имя Фамилия)
   * @param fullName - Полное имя пользователя
   * @param defaultValue - Значение по умолчанию
   * @returns Строка с инициалами
   */
  const getInitialsFromFullName = (
    fullName?: string | null,
    defaultValue: string = 'A'
  ): string => {
    if (!fullName?.trim()) return defaultValue
    
    const nameParts = fullName.trim().split(/\s+/)
    const first = nameParts[0]?.charAt(0).toUpperCase() || ''
    const last = nameParts[1]?.charAt(0).toUpperCase() || ''
    
    const initials = `${first}${last}`
    return initials || defaultValue
  }

  /**
   * Получает инициалы из email адреса
   * @param email - Email адрес
   * @param defaultValue - Значение по умолчанию
   * @returns Строка с инициалами
   */
  const getInitialsFromEmail = (
    email?: string | null,
    defaultValue: string = 'A'
  ): string => {
    if (!email?.trim()) return defaultValue
    
    const emailPart = email.split('@')[0]
    const initials = emailPart?.charAt(0).toUpperCase() || defaultValue
    
    return initials
  }

  return {
    getInitials,
    getInitialsFromFullName,
    getInitialsFromEmail
  }
} 