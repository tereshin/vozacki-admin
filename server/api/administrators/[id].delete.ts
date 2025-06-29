import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParams(event).id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Administrator ID is required'
      })
    }

    // Получаем email администратора по id
    const { data: admin, error: fetchError } = await serverSupabaseClient
      .from('administrators')
      .select('email')
      .eq('id', id)
      .single()

    if (fetchError || !admin) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Administrator not found',
        data: fetchError
      })
    }

    // Находим пользователя в Supabase Auth по email
    const { data: authUsers, error: listError } = await serverSupabaseClient.auth.admin.listUsers()
    if (listError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching users from Supabase Auth',
        data: listError
      })
    }
    const authUser = authUsers.users.find((user) => user.email === admin.email)
    if (!authUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Auth user not found for administrator email',
        data: { email: admin.email }
      })
    }

    // Удаляем пользователя из Supabase Auth
    const { error: deleteAuthError } = await serverSupabaseClient.auth.admin.deleteUser(authUser.id)
    if (deleteAuthError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting user from Supabase Auth',
        data: deleteAuthError
      })
    }

    // Удаляем запись администратора из таблицы
    const { error } = await serverSupabaseClient
      .from('administrators')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting administrator',
        data: error
      })
    }

    return {
      message: 'Administrator deleted successfully'
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