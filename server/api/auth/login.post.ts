import jwt from 'jsonwebtoken'
import { serverSupabaseClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)
    
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    const supabase = serverSupabaseClient

    // Авторизуемся через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    })

    if (authError || !authData.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Получаем данные администратора с ролью
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
      .eq('email', authData.user.email!)
      .single()

    if (adminError || !administrator) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Administrator not found'
      })
    }

    // Проверяем, что у администратора есть роль
    if (!administrator.role) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No role assigned to administrator. Please contact system administrator.'
      })
    }

    // Генерируем JWT токен с данными администратора
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    
    const userPayload = {
      id: administrator.id,
      email: administrator.email,
      supabase_id: authData.user.id,
      role: administrator.role
    }

    const accessToken = jwt.sign(userPayload, jwtSecret, { 
      expiresIn: '24h',
      issuer: 'vozacki-admin'
    })

    // Устанавливаем cookie с токеном
    setCookie(event, 'access_token', accessToken, {
      httpOnly: false, // Разрешаем доступ к cookie с клиента
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    const userData = {
      id: administrator.id,
      email: administrator.email,
      first_name: administrator.first_name,
      last_name: administrator.last_name,
      display_name: administrator.display_name,
      created_at: administrator.created_at,
      updated_at: administrator.updated_at,
      role: administrator.role
    }

    return {
      success: true,
      data: {
        user: userData,
        access_token: accessToken,
        expires_in: 86400 // 24 hours
      }
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 