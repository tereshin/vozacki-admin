export default defineEventHandler(async (event) => {
  try {
    const { data, error } = await serverSupabaseClient
      .from('roles')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Error fetching all roles',
        data: error
      })
    }

    return {
      data: data || []
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Server error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 