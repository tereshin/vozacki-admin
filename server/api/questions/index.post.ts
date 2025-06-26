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
      errors.text = ['Question text is required']
    }
    
    if (!body.language_id) {
      errors.language_id = ['Language is required']
    }

    if (!body.test_uid) {
      errors.test_uid = ['Test UID is required']
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
      content_type: 'question'
    })

    if (uidError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate UID',
        data: uidError
      })
    }

    // Create question record
    const { data, error } = await supabase
      .from('questions')
      .insert({
        text: body.text.trim(),
        points: body.points || 0,
        image_url: body.image_url || null,
        language_id: body.language_id,
        test_uid: body.test_uid,
        external_id: body.external_id || null,
        uid: uidData
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create question',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error creating question:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 