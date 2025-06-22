export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    const { data, error } = await serverSupabaseClient
      .from('administrators')
      .insert(body)
      .select(`
        *,
        role:roles(*)
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Administrator with this email already exists'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error creating administrator',
        data: error
      })
    }

    const administrator = {
      ...data,
      full_name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim()
    }

    return {
      data: administrator
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