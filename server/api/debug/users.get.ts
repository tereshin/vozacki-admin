export default defineEventHandler(async (event) => {
  try {
    // Получаем всех пользователей из Supabase Auth
    const { data: authUsers, error: authError } = await serverSupabaseClient.auth.admin.listUsers()
    
    if (authError) {
      throw createError({
        statusCode: 500,
        statusMessage: authError.message || 'Error fetching auth users'
      })
    }

    // Получаем всех администраторов из таблицы
    const { data: administrators, error: adminError } = await serverSupabaseClient
      .from('administrators')
      .select('*')

    if (adminError) {
      throw createError({
        statusCode: 500,
        statusMessage: adminError.message || 'Error fetching administrators'
      })
    }

    return {
      auth_users: authUsers.users.map(user => ({
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      })),
      administrators: administrators,
      sync_status: {
        total_auth_users: authUsers.users.length,
        total_administrators: administrators?.length || 0,
        mismatched: authUsers.users.filter(authUser => 
          !administrators?.find(admin => admin.id === authUser.id)
        ).length
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Debug users error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 