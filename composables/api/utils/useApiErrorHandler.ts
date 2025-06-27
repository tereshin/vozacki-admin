import type { ApiError } from '~/types/api'

export const useApiErrorHandler = () => {
  // Функция для безопасного получения toast
  const getToast = () => {
    try {
      return useToast()
    } catch (error) {
      // Toast недоступен (например, вызов вне PrimeVue контекста)
      return null
    }
  }

  const createError = (
    message: string, 
    code?: string, 
    details?: any,
    statusCode?: number
  ): ApiError => ({
    message,
    code,
    details,
    statusCode
  })

  const handleError = (error: any, context: string): never => {
    console.error(`[${context}] API Error:`, error)

    let apiError: ApiError

    if (error.response) {
      // HTTP ошибка
      apiError = createError(
        error.response._data?.message || 'Произошла ошибка API',
        error.response._data?.code,
        error.response._data,
        error.response.status
      )
    } else if (error.message) {
      // Обычная ошибка
      apiError = createError(error.message)
    } else {
      // Неизвестная ошибка
      apiError = createError('Произошла неизвестная ошибка')
    }

    // Показываем toast для пользователя если есть toast
    const toast = getToast()
    if (toast) {
      try {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: apiError.message,
          life: 5000
        })
      } catch (toastError) {
        console.warn('Failed to show toast notification:', toastError)
      }
    }

    throw apiError
  }

  const logError = (error: any, context: string, silent = false): void => {
    console.error(`[${context}] Error:`, error)
    
    if (!silent) {
      const toast = getToast()
      if (toast) {
        try {
          const message = error?.message || 'Произошла ошибка'
          toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: message,
            life: 5000
          })
        } catch (toastError) {
          console.warn('Failed to show toast notification:', toastError)
        }
      }
    }
  }

  return {
    createError,
    handleError,
    logError
  }
} 