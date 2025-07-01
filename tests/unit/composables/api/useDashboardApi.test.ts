import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDashboardApi } from '~/composables/api/useDashboardApi'

describe('useDashboardApi', () => {
  let supabaseMock: any
  let handleErrorMock: any

  beforeEach(() => {
    supabaseMock = {
      from: vi.fn(() => supabaseMock),
      select: vi.fn(() => supabaseMock),
      eq: vi.fn(() => supabaseMock),
      single: vi.fn(() => ({ data: { count: 1 }, error: null })),
      count: vi.fn(() => supabaseMock)
    }
    handleErrorMock = vi.fn()
    vi.stubGlobal('useSupabase', () => supabaseMock)
    vi.stubGlobal('useApiErrorHandler', () => ({ handleError: handleErrorMock, logError: vi.fn() }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('getDashboardStats: throws error when supabase not initialized', async () => {
    vi.stubGlobal('useSupabase', () => null)
    const { getDashboardStats } = useDashboardApi()
    await expect(getDashboardStats('en')).rejects.toThrow('Supabase client is not initialized')
  })

  it('getDashboardStats: success with all counts', async () => {
    // Мокаем Promise.all для параллельных запросов
    vi.spyOn(Promise, 'all').mockResolvedValue([
      { data: null, error: null, count: 5 },  // articles
      { data: null, error: null, count: 3 },  // topics
      { data: null, error: null, count: 10 }, // tests
      { data: null, error: null, count: 2 }   // administrators
    ])

    const { getDashboardStats } = useDashboardApi()
    const result = await getDashboardStats('en')
    
    expect(result).toEqual({
      articles_count: 5,
      topics_count: 3,
      tests_count: 10,
      administrators_count: 2
    })
    expect(Promise.all).toHaveBeenCalled()
  })

  it('getDashboardStats: success with zero counts', async () => {
    vi.spyOn(Promise, 'all').mockResolvedValue([
      { data: null, error: null, count: 0 },
      { data: null, error: null, count: 0 },
      { data: null, error: null, count: 0 },
      { data: null, error: null, count: 0 }
    ])

    const { getDashboardStats } = useDashboardApi()
    const result = await getDashboardStats('en')
    
    expect(result).toEqual({
      articles_count: 0,
      topics_count: 0,
      tests_count: 0,
      administrators_count: 0
    })
  })

  it('getDashboardStats: success with null counts (fallback to 0)', async () => {
    vi.spyOn(Promise, 'all').mockResolvedValue([
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
      { data: null, error: null, count: null },
      { data: null, error: null, count: null }
    ])

    const { getDashboardStats } = useDashboardApi()
    const result = await getDashboardStats('en')
    
    expect(result).toEqual({
      articles_count: 0,
      topics_count: 0,
      tests_count: 0,
      administrators_count: 0
    })
  })

  it('getDashboardStats: handles database errors', async () => {
    const dbError = new Error('Database connection failed')
    vi.spyOn(Promise, 'all').mockResolvedValue([
      { data: null, error: dbError, count: 0 },
      { data: null, error: null, count: 3 },
      { data: null, error: null, count: 10 },
      { data: null, error: null, count: 2 }
    ])

    const { getDashboardStats } = useDashboardApi()
    
    await expect(getDashboardStats('en')).rejects.toThrow('Database query errors: articles')
  })

  it('getDashboardStats: handles multiple database errors', async () => {
    const error1 = new Error('Articles error')
    const error2 = new Error('Tests error')
    vi.spyOn(Promise, 'all').mockResolvedValue([
      { data: null, error: error1, count: 0 },
      { data: null, error: null, count: 3 },
      { data: null, error: error2, count: 0 },
      { data: null, error: null, count: 2 }
    ])

    const { getDashboardStats } = useDashboardApi()
    
    await expect(getDashboardStats('en')).rejects.toThrow('Database query errors: articles, tests')
  })

  it('getDashboardStats: handles general errors', async () => {
    const generalError = new Error('Network error')
    vi.spyOn(Promise, 'all').mockRejectedValue(generalError)

    const { getDashboardStats } = useDashboardApi()
    
    await expect(getDashboardStats('en')).rejects.toThrow('Network error')
  })

  it('getDashboardStats: calls supabase with correct language filter', async () => {
    const selectMock = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis()
    }
    supabaseMock.from.mockReturnValue(selectMock)
    
    vi.spyOn(Promise, 'all').mockResolvedValue([
      { data: null, error: null, count: 1 },
      { data: null, error: null, count: 1 },
      { data: null, error: null, count: 1 },
      { data: null, error: null, count: 1 }
    ])

    const { getDashboardStats } = useDashboardApi()
    await getDashboardStats('sr')
    
    expect(supabaseMock.from).toHaveBeenCalledWith('articles')
    expect(supabaseMock.from).toHaveBeenCalledWith('topics')
    expect(supabaseMock.from).toHaveBeenCalledWith('tests')
    expect(supabaseMock.from).toHaveBeenCalledWith('administrators')
    expect(selectMock.eq).toHaveBeenCalledWith('language_id', 'sr')
  })
}) 