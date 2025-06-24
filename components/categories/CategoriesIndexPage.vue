<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader :title="$t('categories.title')" :hideBreadcrumb="false" :items="breadcrumbItems">
            <template #header-actions>
                <Button @click="openCategoryDialog()" :label="$t('categories.actions.create')" icon="pi pi-plus" 
                    size="small" />
            </template>
        </TheHeader>

        <!-- Main content -->
        <div class="pt-2 p-4">
            <!-- Filters -->
            <BaseFilter
                v-model="filters"
                :filter-fields="filterFields"
                :reset-button-label="$t('categories.filters.resetFilters')"
                :filter-button-label="$t('categories.filters.filter')"
                @change="onFilterChange"
                @reset="onFilterReset"
            />

            <!-- Categories table -->
            <BaseDataTable
                :data="categoriesStore.items"
                :columns="tableColumns"
                :loading="categoriesStore.loading"
                :totalRecords="categoriesStore.meta.total"
                :rowsPerPage="filters.per_page"
                :currentPage="filters.page"
                :sortField="sortField"
                :sortOrder="sortOrder"
                :currentPageReportTemplate="$t('categories.pagination.showing') + ' {first} - {last} ' + $t('categories.pagination.of') + ' {totalRecords} ' + $t('categories.pagination.records')"
                :emptyStateIcon="'pi pi-folder'"
                :emptyStateTitle="$t('categories.states.notFound')"
                :emptyStateDescription="$t('categories.states.notFoundDescription')"
                :loadingText="$t('categories.states.loading')"
                :actionsColumn="{ header: $t('categories.table.actions'), style: 'min-width: 80px;' }"
                :defaultActions="{
                    primaryLabel: $t('categories.table.edit'),
                    primaryAction: editCategory,
                    menuItems: getActionItems
                }"
                @page-change="onPageChange"
                @sort="onSort"
            >
                <!-- Custom column templates -->
                <template #column-name="{ data }">
                    <div class="font-medium text-900 cursor-pointer" @click="editCategory(data)">{{ data.name }}</div>
                </template>

                <template #column-language="{ data }">
                    <div class="text-900">{{ getLanguageName(data.language_id) }}</div>
                </template>

                <template #column-parent="{ data }">
                    <div class="text-900">{{ getParentCategoryName(data.parent_category_uid) }}</div>
                </template>

                <template #column-slug="{ data }">
                    <div class="text-600 font-mono text-sm">{{ data.slug }}</div>
                </template>
            </BaseDataTable>

            <!-- Error Toast -->
            <Toast />
        </div>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />

        <!-- Category Form Dialog -->
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
import { useCategoriesStore } from '~/store/categories'
import type { LanguageResource } from '~/types/languages'
import type { CategoryResource } from '~/types/categories'
import type { FilterFieldConfig } from '~/types/filters'
import type { BaseDataTableColumn } from '~/types/base-data-table'

// ==================== COMPOSABLES ====================
// I18n
const { t } = useI18n()

// PrimeVue composables
const confirm = useConfirm()
const toast = useToast()

// Stores
const categoriesStore = useCategoriesStore()

// App settings
const { contentLanguageId, initSettings } = useAppSettings()

// ==================== REACTIVE STATE ====================
// Filters
const filters = ref({
    search: '',
    language_id: '',
    parent_category_uid: '',
    per_page: 10,
    page: 1
})

// Sorting
const sortField = ref<string>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Data for filters
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()
const languages = ref<LanguageResource[]>([])
const allCategories = ref<CategoryResource[]>([])

// Dialog state
const showCategoryDialog = ref(false)
const selectedCategory = ref<CategoryResource | null>(null)
const isEditMode = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Breadcrumb items
const breadcrumbItems = computed(() => [
    {
        label: t('categories.title'),
        to: "/categories"
    }
])

// Table columns configuration
const tableColumns = computed<BaseDataTableColumn[]>(() => [
    {
        key: 'name',
        field: 'name',
        header: t('categories.table.name'),
        sortable: true,
        style: 'min-width: 200px;',
        type: 'custom'
    },
    {
        key: 'slug',
        field: 'slug',
        header: t('categories.table.slug'),
        sortable: true,
        style: 'min-width: 150px;',
        type: 'custom'
    },
    {
        key: 'language',
        field: 'language_id',
        header: t('categories.table.language'),
        style: 'min-width: 100px;',
        type: 'custom'
    },
    {
        key: 'parent',
        field: 'parent_category_uid',
        header: t('categories.table.parent'),
        style: 'min-width: 150px;',
        type: 'custom'
    },
    {
        key: 'description',
        field: 'description',
        header: t('categories.table.description'),
        style: 'min-width: 200px;',
        type: 'text'
    }
])

// Filter fields configuration
const filterFields = computed<FilterFieldConfig[]>(() => {
    return [
        {
            key: 'search',
            type: 'text',
            label: 'categories.filters.search',
            placeholder: 'categories.filters.searchPlaceholder',
            width: 'lg:w-1/2',
            icon: 'pi pi-search'
        },
        {
            key: 'language_id',
            type: 'select',
            label: 'categories.filters.language',
            placeholder: 'categories.filters.allLanguages',
            width: 'lg:w-1/4',
            optionLabel: 'name',
            optionValue: 'id',
            options: languages.value
        },
        {
            key: 'parent_category_uid',
            type: 'select',
            label: 'categories.filters.parent',
            placeholder: 'categories.filters.allParents',
            width: 'lg:w-1/4',
            optionLabel: 'name',
            optionValue: 'uid',
            filter: true,
            options: allCategories.value
        }
    ]
})

// ==================== METHODS ====================
// Filter handlers
const onFilterChange = async (field: string, value: any) => {
    if (field === 'search') {
        filters.value.page = 1
    }
    
    // When language changes, reload all categories for parent filter
    if (field === 'language_id') {
        filters.value.parent_category_uid = ''
        await loadAllCategories()
    }
    
    applyFilters()
}

const onFilterReset = async () => {
    sortField.value = 'name'
    sortOrder.value = 'asc'
    await loadAllCategories()
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
        await categoriesStore.getCategories({
            search: filters.value.search || undefined,
            language_id: filters.value.language_id || undefined,
            parent_category_uid: filters.value.parent_category_uid || undefined,
            per_page: filters.value.per_page,
            page: filters.value.page,
            sort_field: sortField.value,
            sort_order: sortOrder.value
        })
    } catch (error) {
        console.error('Error applying filters:', error)
        toast.add({
            severity: 'error',
            summary: t('categories.states.error'),
            detail: error instanceof Error ? error.message : 'Unknown error',
            life: 5000
        })
    }
}

// Load all categories for parent filter
const loadAllCategories = async () => {
    try {
        const response = await categoriesStore.getCategories({ 
            per_page: 1000,
            language_id: filters.value.language_id || undefined
        })
        allCategories.value = response.data.collection
    } catch (error) {
        console.error('Error loading all categories:', error)
    }
}

// Data refresh
const refreshData = () => {
    applyFilters()
    loadAllCategories()
}

// Utility methods
const { getLanguageName: getLanguageNameUtil, getCategoryName: getCategoryNameUtil } = useGetEntityName()

const getLanguageName = (languageId: string): string => {
    return getLanguageNameUtil(languages.value, languageId, t('categories.table.unknown'))
}

const getParentCategoryName = (parentUid: string | null): string => {
    return getCategoryNameUtil(allCategories.value, parentUid, t('categories.table.noParent'))
}

// Action methods
const openCategoryDialog = (category: CategoryResource | null = null) => {
    selectedCategory.value = category
    isEditMode.value = !!category
    showCategoryDialog.value = true
}

const editCategory = (data: CategoryResource) => {
    openCategoryDialog(data)
}

const getActionItems = (data: CategoryResource) => {
    return [
        {
            label: t('categories.table.edit'),
            icon: 'pi pi-pencil',
            command: () => editCategory(data)
        },
        {
            separator: true
        },
        {
            label: t('categories.table.delete'),
            icon: 'pi pi-trash',
            command: () => deleteCategory(data),
            class: 'text-red-500'
        }
    ]
}

const deleteCategory = (data: CategoryResource) => {
    confirm.require({
        message: t('categories.actions.deleteConfirm'),
        header: t('categories.table.delete'),
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
                await categoriesStore.deleteCategory(data.id)
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category deleted successfully',
                    life: 3000
                })
                await applyFilters()
                await loadAllCategories()
            } catch (error) {
                console.error('Error deleting category:', error)
                toast.add({
                    severity: 'error',
                    summary: t('categories.actions.deleteError'),
                    detail: error instanceof Error ? error.message : 'Unknown error',
                    life: 5000
                })
            }
        }
    })
}

const onCategorySaved = () => {
    showCategoryDialog.value = false
    selectedCategory.value = null
    refreshData()
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
    try {
        // Initialize app settings
        initSettings()
        
        // Load languages
        const languagesData = await loadCachedLanguages()
        languages.value = languagesData

        // Auto-select language from settings if not selected
        if (!filters.value.language_id && contentLanguageId.value) {
            const languageExists = languages.value.find(l => l.id === contentLanguageId.value)
            if (languageExists) {
                filters.value.language_id = contentLanguageId.value
            }
        }

        // Load all categories for parent filter and main data
        await Promise.all([
            loadAllCategories(),
            applyFilters()
        ])
    } catch (error) {
        console.error('Error loading initial data:', error)
        toast.add({
            severity: 'error',
            summary: t('categories.states.error'),
            detail: 'Failed to load initial data',
            life: 5000
        })
    }
})
</script> 