export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { 
      page = 1, 
      per_page = 10, 
      search, 
      role_id,
      sort_field = 'created_at',
      sort_order = 'desc'
    } = query

    let supabaseQuery = serverSupabaseClient
      .from('administrators')
      .select(`
        *,
        role:roles(*)
      `, { count: 'exact' })

    if (search) {
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`
      )
    }

    if (role_id) {
      supabaseQuery = supabaseQuery.eq('role_id', role_id as string)
    }

    const pageNum = Number(page)
    const perPage = Number(per_page)
    const from = (pageNum - 1) * perPage
    const to = from + perPage - 1

    const ascending = sort_order === 'asc'
    const sortField = String(sort_field)
    supabaseQuery = supabaseQuery
      .range(from, to)
      .order(sortField, { ascending })

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching administrators',
        data: error
      })
    }

    const collection = (data || []).map((item: any) => ({
      ...item,
      full_name: item.display_name || `${item.first_name || ''} ${item.last_name || ''}`.trim()
    }))

    return {
      data: {
        collection,
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
  } catch (error) {
    console.error('Server error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 