import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check permissions for content access
    await requirePermission(event, 'view_content')
    
    const query = getQuery(event)
    const {
      page = 1,
      per_page = 10,
      search,
      language_id,
      parent_category_uid
    } = query

    let supabaseQuery = serverSupabaseClient
      .from('categories')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search && typeof search === 'string') {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    // Apply language filter
    if (language_id && typeof language_id === 'string') {
      supabaseQuery = supabaseQuery.eq('language_id', language_id)
    }

    // Apply parent category filter
    if (parent_category_uid && typeof parent_category_uid === 'string') {
      supabaseQuery = supabaseQuery.eq('parent_category_uid', parent_category_uid)
    }

    // Apply pagination
    const pageNum = Number(page)
    const perPage = Number(per_page)
    const from = (pageNum - 1) * perPage
    const to = from + perPage - 1

    supabaseQuery = supabaseQuery
      .range(from, to)
      .order('name', { ascending: true })

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to fetch categories',
        data: error
      })
    }

    return {
      data: {
        collection: data || [],
        meta: {
          current_page: pageNum,
          from: from + 1,
          last_page: Math.ceil((count || 0) / perPage),
          per_page: perPage,
          to: Math.min(to + 1, count || 0),
          total: count || 0
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 