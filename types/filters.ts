import type { Database } from './database'

// Базовые типы таблиц
export type TableNames = keyof Database['public']['Tables']
export type TableRow<T extends TableNames> = Database['public']['Tables'][T]['Row']

// Типы полей фильтра для каждой таблицы
export type FilterableFields<T extends TableNames> = {
  [K in keyof TableRow<T>]?: TableRow<T>[K] extends string | null 
    ? 'text' | 'select'
    : TableRow<T>[K] extends number | null
      ? 'number'
      : TableRow<T>[K] extends boolean | null
        ? 'boolean'
        : TableRow<T>[K] extends string
          ? 'date' | 'text'
          : never
}

// Конфигурация поля фильтра
export interface FilterFieldConfig {
    key: string
    type: 'text' | 'select' | 'date' | 'number' | 'boolean'
    label: string
    placeholder?: string
    width?: string
    icon?: string
    // Для select
    options?: any[]
    optionLabel?: string
    optionValue?: string
    filter?: boolean
    showClear?: boolean
    // Для number
    min?: number
    max?: number
    step?: number
    // Для date
    dateFormat?: string
    // Для boolean
    checkboxLabel?: string
}

// Значения фильтра для таблицы
export type FilterValues<T extends TableNames> = Partial<{
  [K in keyof TableRow<T>]: TableRow<T>[K] extends string | null
    ? string
    : TableRow<T>[K] extends number | null
      ? number
      : TableRow<T>[K] extends boolean | null
        ? boolean | null
        : any
}> & {
  // Общие поля для пагинации и поиска
  search?: string
  page?: number
  per_page?: number
  sort_field?: string
  sort_order?: 'asc' | 'desc'
}

// Предустановленные конфигурации фильтров для основных таблиц
export const FILTER_CONFIGS = {
  articles: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'articles.filters.search',
      placeholder: 'articles.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'category_uid',
      type: 'select' as const,
      label: 'articles.filters.category',
      placeholder: 'articles.filters.allCategories',
      width: 'lg:w-1/3',
      optionLabel: 'name',
      optionValue: 'uid',
      filter: true
    },
    {
      key: 'language_id',
      type: 'select' as const,
      label: 'articles.filters.language',
      placeholder: 'articles.filters.allLanguages',
      width: 'lg:w-1/8',
      optionLabel: 'name',
      optionValue: 'id'
    }
  ],
  categories: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'categories.filters.search',
      placeholder: 'categories.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'language_id',
      type: 'select' as const,
      label: 'categories.filters.language',
      placeholder: 'categories.filters.allLanguages',
      width: 'lg:w-1/3',
      optionLabel: 'name',
      optionValue: 'id'
    }
  ],
  questions: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'questions.filters.search',
      placeholder: 'questions.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'test_uid',
      type: 'select' as const,
      label: 'questions.filters.test',
      placeholder: 'questions.filters.allTests',
      width: 'lg:w-1/3',
      optionLabel: 'title',
      optionValue: 'uid',
      filter: true
    },
    {
      key: 'language_id',
      type: 'select' as const,
      label: 'questions.filters.language',
      placeholder: 'questions.filters.allLanguages',
      width: 'lg:w-1/8',
      optionLabel: 'name',
      optionValue: 'id'
    }
  ],
  tests: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'tests.filters.search',
      placeholder: 'tests.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'topic_uid',
      type: 'select' as const,
      label: 'tests.filters.topic',
      placeholder: 'tests.filters.allTopics',
      width: 'lg:w-1/3',
      optionLabel: 'name',
      optionValue: 'uid',
      filter: true
    },
    {
      key: 'language_id',
      type: 'select' as const,  
      label: 'tests.filters.language',
      placeholder: 'tests.filters.allLanguages',
      width: 'lg:w-1/8',
      optionLabel: 'name',
      optionValue: 'id'
    }
  ],
  topics: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'topics.filters.search',
      placeholder: 'topics.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'language_id',
      type: 'select' as const,
      label: 'topics.filters.language',
      placeholder: 'topics.filters.allLanguages',
      width: 'lg:w-1/3',
      optionLabel: 'name',
      optionValue: 'id'
    }
  ],
  administrators: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'administrators.filters.search',
      placeholder: 'administrators.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'role',
      type: 'select' as const,
      label: 'administrators.filters.role',
      placeholder: 'administrators.filters.allRoles',
      width: 'lg:w-1/3',
      optionLabel: 'label',
      optionValue: 'value'
    }
  ],
  languages: [
    {
      key: 'search',
      type: 'text' as const,
      label: 'languages.filters.search',
      placeholder: 'languages.filters.searchPlaceholder',
      width: 'lg:w-1/2',
      icon: 'pi pi-search'
    },
    {
      key: 'is_active',
      type: 'boolean' as const,
      label: 'languages.filters.isActive',
      width: 'lg:w-1/4',
      checkboxLabel: 'languages.filters.activeOnly'
    }
  ]
} as const

export type FilterConfigKey = keyof typeof FILTER_CONFIGS 