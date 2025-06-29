export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)
    
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    console.log('=== DEBUG LOGIN TEST ===')
    console.log('Email:', email)
    console.log('Attempting login...')

    // Проверяем, существует ли пользователь в Auth
    const { data: authUsers, error: listError } = await serverSupabaseClient.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
    } else {
      const user = authUsers.users.find(u => u.email === email)
      console.log('User found in Auth:', !!user)
      if (user) {
        console.log('User details:', {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at
        })
      }
    }

    // Пытаемся авторизоваться
    const { data, error } = await serverSupabaseClient.auth.signInWithPassword({
      email,
      password
    })

    console.log('Login attempt result:')
    console.log('- Error:', error)
    console.log('- User ID:', data?.user?.id)
    console.log('- Session exists:', !!data?.session)

    if (error) {
      return {
        success: false,
        error: error.message,
        details: {
          code: error.status,
          message: error.message
        }
      }
    }

    console.log('=== LOGIN SUCCESS ===')
    
    return {
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        email_confirmed_at: data.user?.email_confirmed_at
      },
      session_exists: !!data.session
    }

  } catch (error: any) {
    console.error('Test login error:', error)
    return {
      success: false,
      error: error.message || 'Internal server error',
      details: error
    }
  }
}) 