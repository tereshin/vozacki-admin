export interface FilterConfig {
  type: string;
  field: string;
  options: Array<{ label: string; value: any }>;
  chosenOptions: any[];
  multiple?: boolean;
  nullable?: boolean;
}

export interface FiltersState {
  [key: string]: FilterConfig;
}

export function useFilters() {
  const route = useRoute();
  const router = useRouter();

  /**
   * Инициализация фильтров из query параметров
   */
  function initializeFiltersFromQuery<T extends FiltersState>(initialFilters: T): T {
    const query = route.query;
    const filters = { ...initialFilters };

    Object.keys(filters).forEach((key) => {
      const filter = filters[key];
      const queryValue = query[filter.field];

      if (queryValue) {
        if (filter.multiple) {
          // Для мультиселектов
          filter.chosenOptions = Array.isArray(queryValue) ? queryValue : [queryValue];
        } else {
          // Для одиночных селектов
          if (filter.nullable && (queryValue === 'null' || queryValue === '')) {
            filter.chosenOptions = [null];
          } else {
            // Преобразуем тип в зависимости от первой опции
            if (filter.options.length > 0) {
              const firstOptionType = typeof filter.options[0].value;
              if (firstOptionType === 'boolean') {
                filter.chosenOptions = [queryValue === 'true'];
              } else if (firstOptionType === 'number') {
                filter.chosenOptions = [Number(queryValue)];
              } else {
                filter.chosenOptions = [queryValue];
              }
            } else {
              filter.chosenOptions = [queryValue];
            }
          }
        }
      }
    });

    return filters;
  }

  /**
   * Обновление query параметров на основе текущих фильтров
   */
  function updateQueryFromFilters(filters: FiltersState, additionalParams: Record<string, any> = {}) {
    const query: Record<string, any> = { ...additionalParams };

    Object.keys(filters).forEach((key) => {
      const filter = filters[key];
      
      if (filter.chosenOptions.length > 0) {
        if (filter.multiple) {
          // Для мультиселектов - передаем массив
          query[filter.field] = filter.chosenOptions;
        } else {
          // Для одиночных селектов - передаем первое значение
          const value = filter.chosenOptions[0];
          if (value !== null && value !== undefined) {
            query[filter.field] = value;
          }
        }
      }
    });

    // Убираем page из query если он равен 1
    if (query.page === 1) {
      delete query.page;
    }

    router.push({ query });
  }

  /**
   * Получение параметров для API запроса
   */
  function getApiParams(filters: FiltersState, additionalParams: Record<string, any> = {}): Record<string, any> {
    const params: Record<string, any> = { ...additionalParams };

    Object.keys(filters).forEach((key) => {
      const filter = filters[key];
      
      if (filter.chosenOptions.length > 0) {
        if (filter.multiple) {
          params[filter.field] = filter.chosenOptions;
        } else {
          const value = filter.chosenOptions[0];
          if (value !== null && value !== undefined) {
            params[filter.field] = value;
          }
        }
      }
    });

    return params;
  }

  /**
   * Очистка всех фильтров
   */
  function clearFilters(filters: FiltersState) {
    Object.keys(filters).forEach((key) => {
      filters[key].chosenOptions = [];
    });
  }

  /**
   * Проверка наличия активных фильтров
   */
  function hasActiveFilters(filters: FiltersState, searchValue?: string): boolean {
    const hasFilterValues = Object.values(filters).some(filter => filter.chosenOptions.length > 0);
    const hasSearch = searchValue && searchValue.length > 0;
    return hasFilterValues || !!hasSearch;
  }

  return {
    initializeFiltersFromQuery,
    updateQueryFromFilters,
    getApiParams,
    clearFilters,
    hasActiveFilters,
  };
} 