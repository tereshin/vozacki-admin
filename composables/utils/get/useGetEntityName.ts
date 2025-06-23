/**
 * Composable для получения названий сущностей по ID
 */
export const useGetEntityName = () => {
  /**
   * Получает название сущности из коллекции по ID
   * @param collection - Коллекция сущностей
   * @param id - ID сущности
   * @param nameField - Поле с названием (по умолчанию 'name')
   * @param idField - Поле с ID (по умолчанию 'id')
   * @param defaultValue - Значение по умолчанию
   * @returns Название сущности или значение по умолчанию
   */
  const getEntityName = <T extends Record<string, any>>(
    collection: T[],
    id: string | null | undefined,
    nameField: keyof T = 'name' as keyof T,
    idField: keyof T = 'id' as keyof T,
    defaultValue: string = 'Unknown'
  ): string => {
    if (!id || !collection?.length) return defaultValue
    
    const entity = collection.find(item => item[idField] === id)
    return entity?.[nameField] || defaultValue
  }

  /**
   * Получает название языка по ID
   * @param languages - Коллекция языков
   * @param languageId - ID языка
   * @param defaultValue - Значение по умолчанию
   * @returns Название языка
   */
  const getLanguageName = (
    languages: Array<{ id: string; name: string }>,
    languageId: string | null | undefined,
    defaultValue: string = 'Unknown'
  ): string => {
    return getEntityName(languages, languageId, 'name', 'id', defaultValue)
  }

  /**
   * Получает название категории по UID
   * @param categories - Коллекция категорий
   * @param categoryUid - UID категории
   * @param defaultValue - Значение по умолчанию
   * @returns Название категории
   */
  const getCategoryName = (
    categories: Array<{ uid: string; name: string }>,
    categoryUid: string | null | undefined,
    defaultValue: string = 'No Category'
  ): string => {
    if (!categoryUid) return defaultValue
    return getEntityName(categories, categoryUid, 'name', 'uid', defaultValue)
  }

  /**
   * Получает название пользователя по ID
   * @param users - Коллекция пользователей
   * @param userId - ID пользователя
   * @param nameFields - Поля для составления имени
   * @param defaultValue - Значение по умолчанию
   * @returns Полное имя пользователя
   */
  const getUserName = (
    users: Array<{ id: string; first_name?: string; last_name?: string; email?: string }>,
    userId: string | null | undefined,
    nameFields: string[] = ['first_name', 'last_name'],
    defaultValue: string = 'Unknown User'
  ): string => {
    if (!userId || !users?.length) return defaultValue
    
    const user = users.find(u => u.id === userId)
    if (!user) return defaultValue
    
    const nameParts = nameFields
      .map(field => user[field as keyof typeof user])
      .filter(Boolean)
    
    if (nameParts.length > 0) {
      return nameParts.join(' ')
    }
    
    return user.email || defaultValue
  }

  /**
   * Получает список опций для селекта из коллекции
   * @param collection - Коллекция сущностей
   * @param labelField - Поле для label
   * @param valueField - Поле для value
   * @returns Массив опций для селекта
   */
  const getSelectOptions = <T extends Record<string, any>>(
    collection: T[],
    labelField: keyof T = 'name' as keyof T,
    valueField: keyof T = 'id' as keyof T
  ): Array<{ label: string; value: any }> => {
    if (!collection?.length) return []
    
    return collection.map(item => ({
      label: String(item[labelField] || ''),
      value: item[valueField]
    }))
  }

  return {
    getEntityName,
    getLanguageName,
    getCategoryName,
    getUserName,
    getSelectOptions
  }
} 