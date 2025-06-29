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
        statusMessage: 'Test ID is required'
      })
    }

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.title?.trim()) {
      errors.title = ['Title is required']
    }
    
    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
      })
    }

    // Check if test exists
    const { data: existingTest, error: fetchError } = await serverSupabaseClient
      .from('tests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: fetchError.message || 'Test not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: fetchError.message || 'Failed to fetch test',
        data: fetchError
      })
    }

    // Update test record
    const { data, error } = await serverSupabaseClient
      .from('tests')
      .update({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        language_id: body.language_id,
        topic_uid: body.topic_uid || null,
        external_id: body.external_id || null,
        total_questions: body.total_questions || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to update test',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error updating test:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
