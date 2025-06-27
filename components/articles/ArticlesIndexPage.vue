<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader :title="$t('articles.title')" :hideBreadcrumb="false" :items="breadcrumbItems">
            <template #header-actions>
                <Button @click="createArticle" :label="$t('articles.actions.create')" icon="pi pi-plus" 
                    size="small" />
            </template>
        </TheHeader>

        <!-- Main content -->
        <div class="pt-2 p-4">
            <!-- Filters -->
            <BaseFilter
                v-model="filters"
                :filter-fields="filterFields"
                :reset-button-label="$t('articles.filters.resetFilters')"
                :filter-button-label="$t('articles.filters.filter')"
                @change="onFilterChange"
                @reset="onFilterReset"
            />

            <!-- Articles table -->
            <BaseDataTable
                :data="articlesStore.items"
                :columns="tableColumns"
                :loading="articlesStore.loading"
                :totalRecords="articlesStore.meta.total"
                :rowsPerPage="filters.per_page"
                :currentPage="filters.page"
                :sortField="sortField"
                :sortOrder="sortOrder"
                :currentPageReportTemplate="$t('articles.pagination.showing') + ' {first} - {last} ' + $t('articles.pagination.of') + ' {totalRecords} ' + $t('articles.pagination.records')"
                :emptyStateIcon="'pi pi-file'"
                :emptyStateTitle="$t('articles.states.notFound')"
                :emptyStateDescription="$t('articles.states.notFoundDescription')"
                :loadingText="$t('articles.states.loading')"
                :actionsColumn="{ header: $t('articles.table.actions'), style: 'min-width: 80px;' }"
                :defaultActions="{
                    primaryLabel: $t('articles.table.edit'),
                    primaryAction: editArticle,
                    menuItems: getActionItems
                }"
                @page-change="onPageChange"
                @sort="onSort"
            >
                <!-- Custom column templates -->
                <template #column-title="{ data }">
                    <div class="text-900 cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted hover:decoration-solid"  @click="editArticle(data)">{{ data.title }}</div>
                </template>

                <template #column-language="{ data }">
                    <div class="text-900">{{ getLanguageName(data.language_id) }}</div>
                </template>

                <template #column-category="{ data }">
                    <div v-if="data.category_uid" 
                         class="text-900 cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted hover:decoration-solid" 
                         @click="editCategory(data.category_uid)"
                         :title="$t('articles.table.clickToEditCategory')">
                        {{ getCategoryName(data.category_uid) }}
                    </div>
                    <div v-else class="text-gray-400">
                        {{ getCategoryName(data.category_uid) }}
                    </div>
                </template>

                <template #column-status="{ data }">
                    <Tag 
                        :value="data.published_at ? $t('articles.table.published') : $t('articles.table.draft')"
                        :severity="data.published_at ? 'success' : 'secondary'" 
                    />
                </template>

                <template #column-publishedAt="{ data }">
                    <div class="text-900">
                        {{ data.published_at ? formatDateShort(data.published_at) : '-' }}
                    </div>
                </template>
            </BaseDataTable>

            <!-- Error Toast -->
            <Toast />
        </div>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />

        <!-- Category Edit Dialog -->
        <CategoriesFormDialog 
            v-model:visible="showCategoryDialog"
            :category="selectedCategory"
            :is-edit-mode="isEditMode"
            @saved="onCategorySaved"
        />
    </div>
</template>

<script setup lang="ts">
// ==================== IMPORTS ====================
import { useArticlesStore } from '~/store/articles'
import { useCategoriesStore } from '~/store/categories'
import type { LanguageResource } from '~/types/languages'
import type { CategoryResource } from '~/types/categories'
import type { FilterFieldConfig } from '~/types/filters'
import type { BaseDataTableColumn } from '~/types/base-data-table'
import { useAppSettings } from '~/composables/core/config/useAppSettings'
import { useFormatDate } from '~/composables/utils/format/useFormatDate'
import { useGetEntityName } from '~/composables/utils/get/useGetEntityName'
import { useCachedLanguages } from '~/composables/cache/useCachedLanguages'

// ==================== COMPOSABLES ====================
// I18n
const { t } = useI18n()

// PrimeVue composables
const confirm = useConfirm()
const toast = useToast()

// Router
const router = useRouter()

// Stores
const articlesStore = useArticlesStore()
const categoriesStore = useCategoriesStore()

// App settings
const { contentLanguageId, initSettings } = useAppSettings()

// Utils composables
const { formatDateShort } = useFormatDate()

// ==================== REACTIVE STATE ====================
// Filters
const filters = ref({
    search: '',
    language_id: '',
    category_uid: '',
    per_page: 10,
    page: 1
})

// Sorting
const sortField = ref<string>('published_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Data for filters
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()
const languages = ref<LanguageResource[]>([])
const categories = ref<CategoryResource[]>([])

// Category dialog state
const showCategoryDialog = ref(false)
const selectedCategory = ref<CategoryResource | null>(null)
const isEditMode = ref(true)

// ==================== COMPUTED PROPERTIES ====================
// Breadcrumb items
const breadcrumbItems = computed(() => [
    {
        label: t('articles.title'),
        to: "/articles"
    }
])

// Table columns configuration
const tableColumns = computed<BaseDataTableColumn[]>(() => [
    {
        key: 'title',
        field: 'title',
        header: t('articles.table.title'),
        sortable: true,
        style: 'min-width: 280px;',
        type: 'custom'
    },
    {
        key: 'language',
        field: 'language_id',
        header: t('articles.table.language'),
        style: 'min-width: 80px;',
        type: 'custom'
    },
    {
        key: 'category',
        field: 'category_uid',
        header: t('articles.table.category'),
        style: 'min-width: 150px;',
        type: 'custom'
    },
    {
        key: 'status',
        field: 'published_at',
        header: t('articles.table.status'),
        style: 'min-width: 120px;',
        type: 'custom'
    },
    {
        key: 'publishedAt',
        field: 'published_at',
        header: t('articles.table.publishedAt'),
        sortable: true,
        style: 'min-width: 120px;',
        type: 'custom'
    }
])

// Filter fields configuration
const filterFields = computed<FilterFieldConfig[]>(() => {
    return [
        {
            key: 'search',
            type: 'text',
            label: 'articles.filters.search',
            placeholder: 'articles.filters.searchPlaceholder',
            width: 'lg:w-1/2',
            icon: 'pi pi-search'
        },
        {
            key: 'category_uid',
            type: 'select',
            label: 'articles.filters.category',
            placeholder: 'articles.filters.allCategories',
            width: 'lg:w-1/3',
            optionLabel: 'name',
            optionValue: 'uid',
            filter: true,
            options: categories.value
        },
        {
            key: 'language_id',
            type: 'select',
            label: 'articles.filters.language',
            placeholder: 'articles.filters.allLanguages',
            width: 'lg:w-1/8',
            optionLabel: 'name',
            optionValue: 'id',
            options: languages.value
        }
    ]
})

// ==================== METHODS ====================
// Filter handlers
const onFilterChange = async (field: string, value: any) => {
    if (field === 'search') {
        // Debounce for search is already built into BaseFilter
        filters.value.page = 1
    }
    
    // When language changes, reload categories for the selected language
    if (field === 'language_id') {
        // Reset category filter since categories may be different for the new language
        filters.value.category_uid = ''
        
        try {
            // Load categories for the selected language
            const categoriesResponse = await categoriesStore.getCategories({ 
                per_page: 100,
                language_id: value || undefined
            })
            categories.value = categoriesResponse.data.collection
        } catch (error) {
            console.error('Error loading categories for language:', error)
            toast.add({
                severity: 'error',
                summary: t('articles.states.error'),
                detail: 'Failed to load categories for selected language',
                life: 5000
            })
        }
    }
    
    applyFilters()
}

const onFilterReset = async () => {
    sortField.value = 'published_at'
    sortOrder.value = 'desc'
    
    // Reload all categories when filters are reset
    try {
        const categoriesResponse = await categoriesStore.getCategories({ per_page: 100 })
        categories.value = categoriesResponse.data.collection
    } catch (error) {
        console.error('Error loading categories on reset:', error)
        toast.add({
            severity: 'error',
            summary: t('articles.states.error'),
            detail: 'Failed to load categories',
            life: 5000
        })
    }
    
    applyFilters()
}

// DataTable handlers
const onPageChange = (event: any) => {
    filters.value.page = Math.floor(event.first / event.rows) + 1
    filters.value.per_page = event.rows
    applyFilters()
}

const onSort = (event: any) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
    filters.value.page = 1
    applyFilters()
}

// Apply filters
const applyFilters = async () => {
    try {
        await articlesStore.getArticles({
            search: filters.value.search || undefined,
            language_id: filters.value.language_id || undefined,
            category_uid: filters.value.category_uid || undefined,
            per_page: filters.value.per_page,
            page: filters.value.page,
            sort_field: sortField.value,
            sort_order: sortOrder.value
        })
    } catch (error) {
        console.error('Error applying filters:', error)
        toast.add({
            severity: 'error',
            summary: t('articles.states.error'),
            detail: error instanceof Error ? error.message : 'Unknown error',
            life: 5000
        })
    }
}

// Data refresh
const refreshData = () => {
    applyFilters()
}

// Utility methods
const { getLanguageName: getLanguageNameUtil, getCategoryName: getCategoryNameUtil } = useGetEntityName()

const getLanguageName = (languageId: string): string => {
    return getLanguageNameUtil(languages.value, languageId, t('articles.table.unknown'))
}

const getCategoryName = (categoryUid: string | null): string => {
    return getCategoryNameUtil(categories.value, categoryUid, t('articles.table.noCategory'))
}

// Action methods
const createArticle = () => {
    router.push('/articles/create')
}

const getActionItems = (data: any) => {
    return [
        {
            label: t('articles.table.view'),
            icon: 'pi pi-eye',
            command: () => editArticle(data)
        },
        {
            separator: true
        },
        {
            label: t('articles.table.delete'),
            icon: 'pi pi-trash',
            command: () => deleteArticle(data),
            class: 'text-red-500'
        }
    ]
}

const editArticle = (data: any) => {
    const id = data.id
    navigateTo({
        name: 'articles-id',
        params: {
            id: id
        }
    })
}


const deleteArticle = (data: any) => {
    const id = data.id
    confirm.require({
        message: t('articles.actions.deleteConfirm'),
        header: t('articles.table.delete'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger'
        },
        accept: async () => {
            try {
                await articlesStore.deleteArticle(id)
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Article deleted successfully',
                    life: 3000
                })
                await applyFilters()
            } catch (error) {
                console.error('Error deleting article:', error)
                toast.add({
                    severity: 'error',
                    summary: t('articles.actions.deleteError'),
                    detail: error instanceof Error ? error.message : 'Unknown error',
                    life: 5000
                })
            }
        }
    })
}

// Category editing methods
const editCategory = async (categoryUid: string | null) => {
    if (!categoryUid) {
        toast.add({
            severity: 'warn',
            summary: t('articles.states.error'),
            detail: 'This article has no category',
            life: 3000
        })
        return
    }

    try {
        // Find category in current categories list first
        let category = categories.value.find(cat => cat.uid === categoryUid)
        
        // If not found in current list, try to fetch it from the store
        if (!category) {
            // Load all categories to find the one we need
            const allCategoriesResponse = await categoriesStore.getCategories({ per_page: 1000 })
            category = allCategoriesResponse.data.collection.find(cat => cat.uid === categoryUid)
        }

        if (!category) {
            toast.add({
                severity: 'error',
                summary: t('articles.states.error'),
                detail: 'Category not found',
                life: 3000
            })
            return
        }

        selectedCategory.value = category
        isEditMode.value = true
        showCategoryDialog.value = true
    } catch (error) {
        console.error('Error loading category for editing:', error)
        toast.add({
            severity: 'error',
            summary: t('articles.states.error'),
            detail: 'Failed to load category details',
            life: 5000
        })
    }
}

const onCategorySaved = async () => {
    showCategoryDialog.value = false
    selectedCategory.value = null
    
    // Refresh categories list to reflect the changes
    try {
        const categoriesResponse = await categoriesStore.getCategories({ 
            per_page: 100,
            language_id: filters.value.language_id || undefined
        })
        categories.value = categoriesResponse.data.collection
        
        // Also refresh articles to show updated category names
        await applyFilters()
        
        toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: 'Category updated successfully',
            life: 3000
        })
    } catch (error) {
        console.error('Error refreshing data after category update:', error)
    }
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
    try {
        // Initialize app settings
        initSettings()
        
        // Load languages first
        const languagesData = await loadCachedLanguages()
        languages.value = languagesData

        // Auto-select language from settings if not selected
        if (!filters.value.language_id && contentLanguageId.value) {
            // Check if selected language exists in available languages
            const languageExists = languages.value.find(l => l.id === contentLanguageId.value)
            if (languageExists) {
                filters.value.language_id = contentLanguageId.value
            }
        }

        // Load categories for the selected language (or all if no language selected)
        const categoriesResponse = await categoriesStore.getCategories({ 
            per_page: 100,
            language_id: filters.value.language_id || undefined
        })
        categories.value = categoriesResponse.data.collection

        // Load articles
        await applyFilters()
    } catch (error) {
        console.error('Error loading initial data:', error)
        toast.add({
            severity: 'error',
            summary: t('articles.states.error'),
            detail: 'Failed to load initial data',
            life: 5000
        })
    }
})
</script>