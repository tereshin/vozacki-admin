import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const body = await readBody(event)

    // Validate required fields
    const errors: Record<string, string[]> = {}
    
    if (!body.name?.trim()) {
      errors.name = ['Name is required']
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
      content_type: 'topic'
    })

    if (uidError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate UID',
        data: uidError
      })
    }

    // Create topic record
    const { data, error } = await supabase
      .from('topics')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        language_id: body.language_id,
        external_id: body.external_id || null,
        uid: uidData
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create topic',
        data: error
      })
    }

    return {
      data
    }
  } catch (error: any) {
    console.error('Error creating topic:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 