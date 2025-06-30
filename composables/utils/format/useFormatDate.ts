/**
 * Composable для форматирования дат
 */
export const useFormatDate = () => {
  /**
   * Форматирует дату в локализованный формат
   * @param date - Строка с датой или объект Date
   * @param options - Опции форматирования
   * @param locale - Локаль (по умолчанию 'ru-RU')
   * @returns Отформатированная строка с датой
   */
  const formatDate = (
    date: string | Date,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    locale: string = 'ru-RU'
  ): string => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    return dateObj.toLocaleDateString(locale, options)
  }

  /**
   * Форматирует дату в короткий формат (дд.мм.гггг чч:мм)
   */
  const formatDateShort = (date: string | Date, locale: string = 'ru-RU'): string => {
    return formatDate(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }, locale)
  }

  /**
   * Форматирует дату в длинный формат (1 января 2024 г., 12:30)
   */
  const formatDateLong = (date: string | Date, locale: string = 'ru-RU'): string => {
    return formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }, locale)
  }

  /**
   * Форматирует только дату без времени
   */
  const formatDateOnly = (date: string | Date, locale: string = 'ru-RU'): string => {
    return formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }, locale)
  }

  /**
   * Форматирует только время
   */
  const formatTimeOnly = (date: string | Date, locale: string = 'ru-RU'): string => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    formatDate,
    formatDateShort,
    formatDateLong,
    formatDateOnly,
    formatTimeOnly
  }
} 