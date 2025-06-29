import { extractTokenFromEvent, verifyAccessToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Получаем токен
    const token = extractTokenFromEvent(event)
    
    if (!token) {
      return {
        status: 'unauthorized',
        message: 'No token found',
        token: null,
        payload: null,
        cookies: {
          access_token: getCookie(event, 'access_token') || null
        }
      }
    }

    // Проверяем токен
    const payload = verifyAccessToken(token)
    
    if (!payload) {
      return {
        status: 'invalid_token',
        message: 'Token is invalid or expired',
        token: token.substring(0, 20) + '...',
        payload: null,
        cookies: {
          access_token: getCookie(event, 'access_token') || null
        }
      }
    }

    return {
      status: 'authenticated',
      message: 'Token is valid',
      token: token.substring(0, 20) + '...',
      payload: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat
      },
      cookies: {
        access_token: getCookie(event, 'access_token') ? 'present' : null
      }
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message,
      token: null,
      payload: null,
      error: error
    }
  }
}) 