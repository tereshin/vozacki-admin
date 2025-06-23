import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParams(event).id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Administrator ID is required'
      })
    }

    const { error } = await serverSupabaseClient
      .from('administrators')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting administrator',
        data: error
      })
    }

    return {
      message: 'Administrator deleted successfully'
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