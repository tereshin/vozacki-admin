import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const body = await readBody(event)

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.title?.trim()) {
      errors.title = ['Title is required']
    }
    
    if (!body.language_id) {
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

    // Generate UID using database function
    const { data: uidData, error: uidError } = await supabase.rpc('generate_content_uid', {
      content_type: 'test'
    })

    if (uidError) {
      throw createError({
        statusCode: 500,
        statusMessage: uidError.message || 'Failed to generate UID',
        data: uidError
      })
    }

    // Create content_uid record first
    const { error: contentUidError } = await supabase
      .from('content_uids')
      .insert({
        uid: uidData,
        content_type: 'test'
      })

    if (contentUidError) {
      // If uid already exists, it's okay for update operations
      if (contentUidError.code !== '23505') { // 23505 is duplicate key error
        throw createError({
          statusCode: 500,
          statusMessage: contentUidError.message || 'Failed to create content uid',
          data: contentUidError
        })
      }
    }

    // Create test record
    const { data, error } = await supabase
      .from('tests')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        language_id: body.language_id,
        topic_uid: body.topic_uid || null,
        external_id: body.external_id || null,
        uid: uidData
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to create test',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error creating test:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 