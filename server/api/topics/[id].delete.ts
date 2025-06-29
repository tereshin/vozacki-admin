import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Topic ID is required'
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
          statusMessage: fetchError.message || 'Topic not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: fetchError.message || 'Failed to fetch topic',
        data: fetchError
      })
    }

    // Check if topic is used by tests
    const { count: testsCount, error: testsError } = await serverSupabaseClient
      .from('tests')
      .select('*', { count: 'exact', head: true })
      .eq('topic_uid', existingTopic.uid)

    if (testsError) {
      throw createError({
        statusCode: 500,
        statusMessage: testsError.message || 'Failed to check tests',
        data: testsError
      })
    }

    if (testsCount && testsCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete topic that is used by tests'
      })
    }

    // Delete topic
    const { error } = await serverSupabaseClient
      .from('topics')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to delete topic',
        data: error
      })
    }

    // Delete content_uid record
    if (existingTopic.uid) {
      const { error: contentUidError } = await serverSupabaseClient
        .from('content_uids')
        .delete()
        .eq('uid', existingTopic.uid)

      if (contentUidError) {
        console.warn('Failed to delete content_uid:', contentUidError)
      }
    }

    return {
      message: 'Topic deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting topic:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 