import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const answerId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!answerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Answer ID is required'
      })
    }

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (body.text !== undefined && !body.text?.trim()) {
      errors.text = ['Answer text is required']
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
    
    if (body.is_correct !== undefined) {
      updateData.is_correct = body.is_correct
    }
    
    if (body.language_id !== undefined) {
      updateData.language_id = body.language_id
    }
    
    if (body.question_uid !== undefined) {
      updateData.question_uid = body.question_uid
    }
    
    if (body.external_id !== undefined) {
      updateData.external_id = body.external_id
    }

    // Update answer record
    const { data, error } = await supabase
      .from('answers')
      .update(updateData)
      .eq('id', answerId)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update answer',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error updating answer:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 