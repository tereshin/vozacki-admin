import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Topic ID is required'
      })
    }

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.name?.trim()) {
      errors.name = ['Name is required']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
      })
    }

    // Check if topic exists
    const { data: existingTopic, error: fetchError } = await serverSupabaseClient
      .from('topics')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Topic not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch topic',
        data: fetchError
      })
    }

    // Update topic record
    const { data, error } = await serverSupabaseClient
      .from('topics')
      .update({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        external_id: body.external_id || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update topic',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error updating topic:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 