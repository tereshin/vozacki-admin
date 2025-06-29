import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== TESTING GUEST PERMISSIONS ===')
    
    // Создаем тестовый JWT токен для пользователя с ролью guest
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    
    const testPayload = {
      id: 'adbe4e09-0dfe-4916-996b-e6e404960579',
      email: 'demo@vozacki.rs',
      supabase_id: 'adbe4e09-0dfe-4916-996b-e6e404960579',
      role: {
        id: '97012a96-b3a3-4fa4-b087-2f605ca3147d',
        name: 'Guest',
        code: 'guest'
      }
    }

    const testToken = jwt.sign(testPayload, jwtSecret, { 
      expiresIn: '1h',
      issuer: 'vozacki-admin'
    })

    console.log('Generated test token for:', testPayload.email)
    console.log('Role:', testPayload.role.code)

    // Устанавливаем токен в cookie для тестирования
    setCookie(event, 'access_token', testToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    return {
      success: true,
      test_user: {
        email: testPayload.email,
        role: testPayload.role
      },
      token_set: true,
      message: 'Guest token set. Now test API endpoints to verify restrictions.'
    }

  } catch (error: any) {
    console.error('Guest permission test error:', error)
    return {
      success: false,
      error: error.message || 'Internal server error',
      details: error
    }
  }
}) 