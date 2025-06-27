export async function verifyAuthToken(event: any) {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header missing'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authorization header'
    })
  }

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await serverSupabaseClient.auth.getUser(token)
    
    if (error || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }
    
    return user
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    })
  }
}

export async function requireAuth(event: any) {
  const user = await verifyAuthToken(event)
  
  // Check if user is an administrator with role information
  const { data: admin, error } = await serverSupabaseClient
    .from('administrators')
    .select(`
      *,
      role:roles(
        id,
        name,
        code
      )
    `)
    .eq('email', user.email || '')
    .single()
  
  if (error || !admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Administrator privileges required.'
    })
  }
  
  return { user, admin }
}

export async function requirePermission(event: any, permission: 'manage_content' | 'view_content' | 'manage_administrators' | 'manage_roles') {
  const { user, admin } = await requireAuth(event)
  
  const roleCode = admin.role?.code
  
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
  
  return { user, admin }
} 