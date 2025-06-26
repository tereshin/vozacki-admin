import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content management
    await requirePermission(event, 'manage_content')
    
    const questionId = getRouterParam(event, 'id')

    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question ID is required'
      })
    }

    const supabase = serverSupabaseClient

    // First, get the question to retrieve its UID
    const { data: questionData, error: getError } = await supabase
      .from('questions')
      .select('uid')
      .eq('id', questionId)
      .single()

    if (getError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Question not found',
        data: getError
      })
    }

    // Step 1: Delete all answers related to this question
    if (questionData?.uid) {
      // Get all answers for this question to delete their content_uids
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('id, uid')
        .eq('question_uid', questionData.uid)

      if (answersError) {
        console.warn('Error fetching answers for deletion:', answersError)
      } else if (answersData && answersData.length > 0) {
        // Delete all answers
        const { error: deleteAnswersError } = await supabase
          .from('answers')
          .delete()
          .eq('question_uid', questionData.uid)

        if (deleteAnswersError) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete question answers',
            data: deleteAnswersError
          })
        }

        // Delete content_uids for all answers
        for (const answer of answersData) {
          if (answer.uid) {
            const { error: answerContentUidError } = await supabase
              .from('content_uids')
              .delete()
              .eq('uid', answer.uid)

            if (answerContentUidError) {
              console.warn('Error deleting answer content_uid:', answerContentUidError)
              // Don't throw here, continue with other deletions
            }
          }
        }
      }
    }

    // Step 2: Delete the question
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete question',
        data: deleteError
      })
    }

    // Step 3: Delete the question's content_uid entry
    if (questionData?.uid) {
      const { error: contentUidError } = await supabase
        .from('content_uids')
        .delete()
        .eq('uid', questionData.uid)

      if (contentUidError) {
        console.warn('Error deleting question content_uid:', contentUidError)
        // Don't throw here as the main record is already deleted
      }
    }

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting question:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 