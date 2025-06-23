// Импорты stores для TypeScript
import { useProjectsStore } from '../../store/projects';
import { usePendingProjectsStore } from '../../store/pending-projects';
import { useGeneralStore } from '../../store/general';

/**
 * Composable для работы с фильтрами на страницах проектов
 */
export function useProjectsPageFilters() {
  const projectsStore = useProjectsStore();
  const generalStore = useGeneralStore();
  const { 
    initializeFiltersFromQuery,
    updateQueryFromFilters,
    getApiParams,
    clearFilters: clearAllFilters,
    hasActiveFilters: hasFilters 
  } = useFilters();

  // Реактивные данные
  const searchValue = ref('');
  const currentPage = ref(1);
  const sortBy = ref<string>();
  const direction = ref<'asc' | 'desc'>();

  // Инициализация из query параметров
  function initializeFromQuery() {
    const route = useRoute();
    
    // Инициализируем фильтры из URL
    projectsStore.filters = initializeFiltersFromQuery(projectsStore.filters);
    
    // Инициализируем другие параметры из query
    searchValue.value = (route.query.search as string) || '';
    currentPage.value = Number(route.query.page) || 1;
    sortBy.value = route.query.sort_by as string;
    direction.value = route.query.direction as 'asc' | 'desc';
  }

  // Computed свойства
  const hasActiveFilters = computed(() => {
    return hasFilters(projectsStore.filters, searchValue.value);
  });

  // Применение фильтров
  async function applyFilters() {
    try {
      generalStore.setLoading(true);

      // Подготавливаем параметры для API
      const apiParams = getApiParams(projectsStore.filters, {
        page: currentPage.value,
        per_page: 15
      });

      if (searchValue.value) {
        apiParams.search = searchValue.value;
      }

      if (sortBy.value) {
        apiParams.sort_by = sortBy.value;
        apiParams.direction = direction.value;
      }

      // Обновляем URL query параметры
      const queryParams: Record<string, any> = {
        page: currentPage.value > 1 ? currentPage.value : undefined,
      };

      if (searchValue.value) {
        queryParams.search = searchValue.value;
      }

      if (sortBy.value) {
        queryParams.sort_by = sortBy.value;
        queryParams.direction = direction.value;
      }

      updateQueryFromFilters(projectsStore.filters, queryParams);

      // Загружаем данные
      await projectsStore.getProjects(apiParams);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    } finally {
      generalStore.setLoading(false);
    }
  }

  // Обработчики событий
  function handleSearch() {
    currentPage.value = 1;
    applyFilters();
  }

  function handleFilterChange(filterKey: string, value: any) {
    projectsStore.setChosenOptions(filterKey, Array.isArray(value) ? value : [value]);
    currentPage.value = 1;
    applyFilters();
  }

  function handlePageChange(page: number) {
    currentPage.value = page;
    applyFilters();
  }

  function handleSort(field: string, order: 'asc' | 'desc') {
    sortBy.value = field;
    direction.value = order;
    currentPage.value = 1;
    applyFilters();
  }

  function clearFilters() {
    clearAllFilters(projectsStore.filters);
    searchValue.value = '';
    currentPage.value = 1;
    sortBy.value = undefined;
    direction.value = undefined;
    applyFilters();
  }

  return {
    // Data
    searchValue,
    currentPage,
    sortBy,
    direction,
    
    // Computed
    hasActiveFilters,
    
    // Methods
    initializeFromQuery,
    applyFilters,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleSort,
    clearFilters,
    
    // Store references
    projectsStore,
    generalStore,
  };
}

/**
 * Composable для работы с фильтрами на страницах pending projects
 */
export function usePendingProjectsPageFilters() {
  const pendingProjectsStore = usePendingProjectsStore();
  const generalStore = useGeneralStore();
  const { 
    initializeFiltersFromQuery,
    updateQueryFromFilters,
    getApiParams,
    clearFilters: clearAllFilters,
    hasActiveFilters: hasFilters 
  } = useFilters();

  // Реактивные данные
  const searchValue = ref('');
  const currentPage = ref(1);
  const sortBy = ref<string>();
  const direction = ref<'asc' | 'desc'>();

  // Инициализация из query параметров
  function initializeFromQuery() {
    const route = useRoute();
    
    // Инициализируем фильтры из URL
    pendingProjectsStore.filters = initializeFiltersFromQuery(pendingProjectsStore.filters);
    
    // Инициализируем другие параметры из query
    searchValue.value = (route.query.search as string) || '';
    currentPage.value = Number(route.query.page) || 1;
    sortBy.value = route.query.sort_by as string;
    direction.value = route.query.direction as 'asc' | 'desc';
  }

  // Computed свойства
  const hasActiveFilters = computed(() => {
    return hasFilters(pendingProjectsStore.filters, searchValue.value);
  });

  // Применение фильтров
  async function applyFilters() {
    try {
      generalStore.setLoading(true);
      
      // Подготавливаем параметры для API
      const apiParams = getApiParams(pendingProjectsStore.filters, {
        page: currentPage.value,
        per_page: 15
      });

      if (searchValue.value) {
        apiParams.search = searchValue.value;
      }

      if (sortBy.value) {
        apiParams.sort_by = sortBy.value;
        apiParams.direction = direction.value;
      }

      // Обновляем URL query параметры
      const queryParams: Record<string, any> = {
        page: currentPage.value > 1 ? currentPage.value : undefined,
      };

      if (searchValue.value) {
        queryParams.search = searchValue.value;
      }

      if (sortBy.value) {
        queryParams.sort_by = sortBy.value;
        queryParams.direction = direction.value;
      }

      updateQueryFromFilters(pendingProjectsStore.filters, queryParams);
      
      // Загружаем данные
      await pendingProjectsStore.getPendingProjects(apiParams);
    } catch (error: any) {
      console.error('Error fetching pending projects:', error);
    } finally {
      generalStore.setLoading(false);
    }
  }

  // Обработчики событий
  function handleSearch() {
    currentPage.value = 1;
    applyFilters();
  }

  function handleFilterChange(filterKey: string, value: any) {
    pendingProjectsStore.setChosenOptions(filterKey, Array.isArray(value) ? value : [value]);
    currentPage.value = 1;
    applyFilters();
  }

  function handlePageChange(page: number) {
    currentPage.value = page;
    applyFilters();
  }

  function handleSort(field: string, order: 'asc' | 'desc') {
    sortBy.value = field;
    direction.value = order;
    currentPage.value = 1;
    applyFilters();
  }

  function clearFilters() {
    clearAllFilters(pendingProjectsStore.filters);
    searchValue.value = '';
    currentPage.value = 1;
    sortBy.value = undefined;
    direction.value = undefined;
    applyFilters();
  }

  return {
    // Data
    searchValue,
    currentPage,
    sortBy,
    direction,
    
    // Computed
    hasActiveFilters,
    
    // Methods
    initializeFromQuery,
    applyFilters,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleSort,
    clearFilters,
    
    // Store references
    pendingProjectsStore,
    generalStore,
  };
} 