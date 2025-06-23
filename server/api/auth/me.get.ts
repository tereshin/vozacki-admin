import { serverSupabaseClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseClient
    
    // Получаем токен из заголовков
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing or invalid authorization header'
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Получаем текущего пользователя из токена
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user || !user.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Получаем информацию об администраторе с ролью
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
      .eq('email', user.email)
      .single()

    if (adminError) {
      if (adminError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Administrator not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching administrator data',
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
      statusMessage: 'Internal server error'
    })
  }
}) 