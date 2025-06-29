import { requireAuth } from '~/server/utils/auth'
import { serverSupabaseClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Проверяем JWT токен и получаем данные пользователя
    const payload = requireAuth(event)
    
    const supabase = serverSupabaseClient

    // Получаем актуальные данные администратора с ролью
    const { data: administrator, error: adminError } = await supabase
      .from('administrators')
      .select(`
        id,
        email,
        first_name,
        last_name,
        display_name,
        created_at,
        updated_at,
        role:roles(
          id,
          name,
          code
        )
      `)
      .eq('id', payload.id)
      .single()

    if (adminError) {
      if (adminError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: adminError.message || 'Administrator not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: adminError.message || 'Error fetching administrator data',
        data: adminError
      })
    }

    // Формируем ответ в формате AdministratorUser
    const administratorUser = {
      id: administrator.id,
      email: administrator.email,
      created_at: administrator.created_at,
      updated_at: administrator.updated_at,
      role: administrator.role
    }

    return {
      data: administratorUser
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Server error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 