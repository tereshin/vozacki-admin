import { serverSupabaseClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseClient
    
    // Получаем токен для выхода из Supabase
    const token = getCookie(event, 'access_token')
    
    if (token) {
      // Выходим из Supabase
      await supabase.auth.signOut()
    }

    // Очищаем cookie
    deleteCookie(event, 'access_token')

    return {
      success: true,
      message: 'Successfully logged out'
    }

  } catch (error: any) {
    console.error('Logout error:', error)
    
    // Даже если произошла ошибка, очищаем cookie
    deleteCookie(event, 'access_token')
    
    return {
      success: true,
      message: error.message || 'Successfully logged out'
    }
  }
}) 