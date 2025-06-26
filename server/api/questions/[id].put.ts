import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const questionId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question ID is required'
      })
    }

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (body.text !== undefined && !body.text?.trim()) {
      errors.text = ['Question text is required']
    }
    
    if (body.language_id !== undefined && !body.language_id) {
      errors.language_id = ['Language is required']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
      })
    }

    const supabase = serverSupabaseClient

    // Prepare update data
    const updateData: any = {}
    
    if (body.text !== undefined) {
      updateData.text = body.text.trim()
    }
    
    if (body.points !== undefined) {
      updateData.points = body.points
    }
    
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || null
    }
    
    if (body.language_id !== undefined) {
      updateData.language_id = body.language_id
    }
    
    if (body.test_uid !== undefined) {
      updateData.test_uid = body.test_uid
    }
    
    if (body.external_id !== undefined) {
      updateData.external_id = body.external_id
    }

    // Update question record
    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update question',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error updating question:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 