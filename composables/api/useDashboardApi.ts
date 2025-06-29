export interface DashboardStats {
  articles_count: number;
  topics_count: number;
  tests_count: number;
  administrators_count: number;
}

export const useDashboardApi = () => {
  const supabase = useSupabase()
  const { handleError, logError } = useApiErrorHandler()

  const getDashboardStats = async (languageId: string): Promise<DashboardStats> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized')
      }
      
      // Параллельное выполнение всех запросов для получения статистики
      const [articlesResult, topicsResult, testsResult, administratorsResult] = await Promise.all([
        // Количество статей для выбранного языка
        supabase
          .from('articles' as any)
          .select('id', { count: 'exact', head: true })
          .eq('language_id', languageId),
        
        // Количество тем для выбранного языка
        supabase
          .from('topics' as any)
          .select('id', { count: 'exact', head: true })
          .eq('language_id', languageId),
        
        // Количество тестов для выбранного языка
        supabase
          .from('tests' as any)
          .select('id', { count: 'exact', head: true })
          .eq('language_id', languageId),
        
        // Общее количество администраторов (не зависит от языка)
        supabase
          .from('administrators' as any)
          .select('id', { count: 'exact', head: true })
      ])

      // Проверяем на ошибки и логируем результаты
      const errors = [
        { result: articlesResult, name: 'articles' },
        { result: topicsResult, name: 'topics' },
        { result: testsResult, name: 'tests' },
        { result: administratorsResult, name: 'administrators' }
      ].filter(item => item.result.error)

      if (errors.length > 0) {
        errors.forEach(({ result, name }) => {
          logError(result.error, `${name} query`, true)
        })
        throw new Error(`Database query errors: ${errors.map(e => e.name).join(', ')}`)
      }

      const stats = {
        articles_count: articlesResult.count || 0,
        topics_count: topicsResult.count || 0,
        tests_count: testsResult.count || 0,
        administrators_count: administratorsResult.count || 0
      }
      
      return stats
      
    } catch (error) {
      handleError(error, 'fetching dashboard stats')
      throw error
    }
  }

  return {
    getDashboardStats
  }
} 