import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParams(event).id
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Administrator ID is required'
      })
    }

    // Получаем текущие данные администратора для получения email
    const { data: currentAdmin, error: fetchError } = await serverSupabaseClient
      .from('administrators')
      .select('email')
      .eq('id', id)
      .single()

    if (fetchError || !currentAdmin) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Administrator not found'
      })
    }

    // Исключаем пароль из данных для обновления таблицы administrators
    const { password, ...administratorData } = body

    // Если передан пароль, обновляем его в Supabase Auth
    if (password) {
      // Находим пользователя по email
      const { data: authUsers, error: getUserError } = await serverSupabaseClient.auth.admin.listUsers()
      
      if (getUserError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Error fetching user authentication data'
        })
      }

      const authUser = authUsers.users.find((user: any) => user.email === currentAdmin.email)

      if (authUser) {
        const { error: updateAuthError } = await serverSupabaseClient.auth.admin.updateUserById(
          authUser.id,
          { password }
        )

        if (updateAuthError) {
          throw createError({
            statusCode: 400,
            statusMessage: updateAuthError.message || 'Error updating user password'
          })
        }
      }
    }

    const updateData = {
      ...administratorData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await serverSupabaseClient
      .from('administrators')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        role:roles(*)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Administrator not found'
        })
      }
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Administrator with this email already exists'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error updating administrator',
        data: error
      })
    }

    const administrator = {
      ...data,
      full_name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim()
    }

    return {
      data: administrator
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