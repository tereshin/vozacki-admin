import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const body = await readBody(event)

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.text?.trim()) {
      errors.text = ['Answer text is required']
    }
    
    if (!body.language_id) {
      errors.language_id = ['Language is required']
    }

    if (!body.question_uid) {
      errors.question_uid = ['Question UID is required']
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { details: errors }
      })
    }

    const supabase = serverSupabaseClient

    // Generate UID using database function
    const { data: uidData, error: uidError } = await supabase.rpc('generate_content_uid', {
      content_type: 'answer'
    })

    if (uidError) {
      throw createError({
        statusCode: 500,
        statusMessage: uidError.message || 'Failed to generate UID',
        data: uidError
      })
    }

    // Create answer record
    const { data, error } = await supabase
      .from('answers')
      .insert({
        text: body.text.trim(),
        is_correct: body.is_correct || false,
        language_id: body.language_id,
        question_uid: body.question_uid,
        external_id: body.external_id || null,
        uid: uidData
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to create answer',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error creating answer:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 