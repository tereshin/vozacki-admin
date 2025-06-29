import { serverSupabaseClient } from '~/server/utils/supabase'
import { requirePermission } from '~/server/utils/auth'
import type { Database } from '~/types/database'

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
      category_uid,
      sort_field = 'published_at',
      sort_order = 'desc'
    } = query

    let supabaseQuery = serverSupabaseClient
      .from('articles')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search && typeof search === 'string') {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    // Apply language filter
    if (language_id && typeof language_id === 'string') {
      supabaseQuery = supabaseQuery.eq('language_id', language_id)
    }

    // Apply category filter
    if (category_uid && typeof category_uid === 'string') {
      supabaseQuery = supabaseQuery.eq('category_uid', category_uid)
    }

    // Apply pagination
    const pageNum = Number(page)
    const perPage = Number(per_page)
    const from = (pageNum - 1) * perPage
    const to = from + perPage - 1

    // Apply sorting
    const sortField = typeof sort_field === 'string' ? sort_field : 'published_at'
    const sortOrderValue = sort_order === 'asc' ? 'asc' : 'desc'
    const ascending = sortOrderValue === 'asc'
    
    supabaseQuery = supabaseQuery
      .range(from, to)
      .order(sortField, { 
        ascending, 
        nullsFirst: sortField === 'published_at' ? false : true 
      })

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to fetch articles'
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
    console.error('Error fetching articles:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 