export interface DashboardStats {
  articles_count: number;
  topics_count: number;
  tests_count: number;
  administrators_count: number;
}

export const useDashboardApi = () => {
  const supabase = useSupabase()

  const getDashboardStats = async (languageId: string): Promise<DashboardStats> => {
    try {
      // Параллельное выполнение всех запросов для получения статистики
      const [articlesResult, topicsResult, testsResult, administratorsResult] = await Promise.all([
        // Количество статей для выбранного языка
        supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('language_id', languageId),
        
        // Количество тем для выбранного языка
        supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('language_id', languageId),
        
        // Количество тестов для выбранного языка
        supabase
          .from('tests')
          .select('*', { count: 'exact', head: true })
          .eq('language_id', languageId),
        
        // Общее количество администраторов (не зависит от языка)
        supabase
          .from('administrators')
          .select('*', { count: 'exact', head: true })
      ])

      // Проверяем на ошибки
      if (articlesResult.error) throw articlesResult.error
      if (topicsResult.error) throw topicsResult.error
      if (testsResult.error) throw testsResult.error
      if (administratorsResult.error) throw administratorsResult.error

      return {
        articles_count: articlesResult.count || 0,
        topics_count: topicsResult.count || 0,
        tests_count: testsResult.count || 0,
        administrators_count: administratorsResult.count || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  return {
    getDashboardStats
  }
} 