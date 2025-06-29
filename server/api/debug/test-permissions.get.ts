import jwt from 'jsonwebtoken'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== TESTING PERMISSIONS ===')
    
    // Создаем тестовый JWT токен для пользователя с ролью администратора
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    
    const testPayload = {
      id: 'c55044ff-7c9e-4df8-b38c-790b54dcfba6',
      email: 'a@tereshin.co',
      supabase_id: 'c55044ff-7c9e-4df8-b38c-790b54dcfba6',
      role: {
        id: '915a572f-1cf3-4d9a-be4a-80a73baf14c5',
        name: 'Administrator',
        code: 'administrator'
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

    // Тестируем различные разрешения
    const results: Record<string, string> = {}

    try {
      await requirePermission(event, 'manage_content')
      results.manage_content = 'ALLOWED'
    } catch (error: any) {
      results.manage_content = `DENIED: ${error.statusMessage}`
    }

    try {
      await requirePermission(event, 'view_content')
      results.view_content = 'ALLOWED'
    } catch (error: any) {
      results.view_content = `DENIED: ${error.statusMessage}`
    }

    try {
      await requirePermission(event, 'manage_administrators')
      results.manage_administrators = 'ALLOWED'
    } catch (error: any) {
      results.manage_administrators = `DENIED: ${error.statusMessage}`
    }

    try {
      await requirePermission(event, 'manage_roles')
      results.manage_roles = 'ALLOWED'
    } catch (error: any) {
      results.manage_roles = `DENIED: ${error.statusMessage}`
    }

    return {
      success: true,
      test_user: {
        email: testPayload.email,
        role: testPayload.role
      },
      permission_tests: results,
      token_set: true
    }

  } catch (error: any) {
    console.error('Permission test error:', error)
    return {
      success: false,
      error: error.message || 'Internal server error',
      details: error
    }
  }
}) 