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
    // Use provided uid or generate new one
    const questionUid = body.uid || crypto.randomUUID()

    // Create content_uid record first
    const { error: contentUidError } = await supabase
      .from('content_uids')
      .insert({
        uid: questionUid,
        content_type: 'question'
      })

    if (contentUidError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate UID',
        data: contentUidError
      })
    }


    // Create question record
    const { data, error } = await supabase
      .from('questions')
      .insert({
        id: body.id || crypto.randomUUID(),
        text: body.text.trim(),
        points: body.points || 0,
        image_url: body.image_url || null,
        language_id: body.language_id,
        test_uid: body.test_uid,
        external_id: body.external_id || null,
        uid: questionUid
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