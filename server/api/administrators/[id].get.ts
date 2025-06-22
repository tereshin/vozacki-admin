export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Administrator ID is required'
      })
    }

    const { data, error } = await serverSupabaseClient
      .from('administrators')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Administrator not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching administrator',
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