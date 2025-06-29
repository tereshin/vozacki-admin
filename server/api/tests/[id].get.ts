import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content access
    await requirePermission(event, 'view_content')
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Test ID is required'
      })
    }

    const { data, error } = await serverSupabaseClient
      .from('tests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: error.message || 'Test not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to fetch test',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error fetching test:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
