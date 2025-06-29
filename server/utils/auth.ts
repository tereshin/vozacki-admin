import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: string
  email: string
  supabase_id: string
  role: {
    id: string
    name: string
    code: string
  }
  iat?: number
  exp?: number
  iss?: string
}

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload
    
    if (decoded.iss !== 'vozacki-admin') {
      return null
    }
    
    return decoded
  } catch (error) {
    return null
  }
}

export const extractTokenFromEvent = (event: any): string | null => {
  // Пытаемся получить токен из headers
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }
  
  // Пытаемся получить токен из cookies
  const cookieToken = getCookie(event, 'access_token')
  if (cookieToken) {
    return cookieToken
  }
  
  return null
}

export const requireAuth = (event: any): JwtPayload => {
  const token = extractTokenFromEvent(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing authentication token'
    })
  }
  
  const payload = verifyAccessToken(token)
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
  
  return payload
}

export const requireRole = (event: any, allowedRoles: string[]): JwtPayload => {
  const payload = requireAuth(event)
  
  if (!allowedRoles.includes(payload.role.code)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions'
    })
  }
  
  return payload
}

export async function requirePermission(event: any, permission: 'manage_content' | 'view_content' | 'manage_administrators' | 'manage_roles') {
  const payload = requireAuth(event)
  
  const roleCode = payload.role?.code
  
  // Проверяем, что роль существует
  if (!roleCode) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No role assigned to user. Please contact administrator.'
    })
  }
  
  switch (permission) {
    case 'manage_content':
      if (roleCode !== 'administrator' && roleCode !== 'moderator') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Insufficient permissions. Content management requires administrator or moderator role.'
        })
      }
      break
    
    case 'view_content':
      if (roleCode !== 'administrator' && roleCode !== 'moderator' && roleCode !== 'user' && roleCode !== 'guest') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Insufficient permissions. Content access requires valid role.'
        })
      }
      break
    
    case 'manage_administrators':
    case 'manage_roles':
      if (roleCode !== 'administrator') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Insufficient permissions. Administrator role required.'
        })
      }
      break
    
    default:
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid permission specified'
      })
  }
  
  return payload
} 