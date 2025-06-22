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
  
  // Check if user is an administrator
  const { data: admin, error } = await serverSupabaseClient
    .from('administrators')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Administrator privileges required.'
    })
  }
  
  return { user, admin }
} 