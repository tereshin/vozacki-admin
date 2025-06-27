import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const answerId = getRouterParam(event, 'id')

    if (!answerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Answer ID is required'
      })
    }

    const supabase = serverSupabaseClient

    // First, get the answer to retrieve its UID
    const { data: answerData, error: getError } = await supabase
      .from('answers')
      .select('uid')
      .eq('id', answerId)
      .single()

    if (getError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Answer not found',
        data: getError
      })
    }

    // Delete the answer
    const { error: deleteError } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete answer',
        data: deleteError
      })
    }

    // Delete the content_uid entry
    if (answerData?.uid) {
      const { error: contentUidError } = await supabase
        .from('content_uids')
        .delete()
        .eq('uid', answerData.uid)

      if (contentUidError) {
        console.warn('Error deleting content_uid:', contentUidError)
        // Don't throw here as the main record is already deleted
      }
    }

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting answer:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 