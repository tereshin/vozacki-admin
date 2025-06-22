<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader 
            :title="$t('roles.title')" 
            :items="breadcrumbItems"
            :hideBreadcrumb="false"
        />

        <!-- Main content -->
        <div class="pt-2 p-4">
            <!-- Filters -->
            <BaseFilter
                v-model="filters"
                :filter-fields="filterFields"
                :show-reset-button="true"
                :show-apply-button="false"
                :reset-button-label="$t('common.reset')"
                :debounce-timeout="500"
                @change="onFilterChange"
                @reset="onFilterReset"
            />

            <!-- Data Table -->
            <BaseDataTable
                :data="rolesStore.items"
                :columns="columns"
                :loading="generalStore.isLoading"
                :total-records="rolesStore.meta.total"
                :rows-per-page="rolesStore.meta.per_page"
                :current-page="rolesStore.meta.current_page"
                :sort-field="sortField"
                :sort-order="sortOrder"
                :empty-state-title="$t('roles.empty_state_title')"
                :empty-state-description="$t('roles.empty_state_description')"
                :empty-state-icon="'pi pi-shield'"
                :loading-text="$t('common.loading')"
                @page-change="onPageChange"
                @sort="onSort"
            >
                <!-- Custom column templates -->
                <template #column-name="{ data }">
                    <div class="flex items-center gap-3 min-w-0">
                        <i class="pi pi-shield text-blue-600 flex-shrink-0"></i>
                        <div class="min-w-0">
                            <div class="font-medium text-gray-900 truncate">
                                {{ data.name }}
                            </div>
                            <div class="text-sm text-gray-500 truncate">{{ data.code }}</div>
                        </div>
                    </div>
                </template>

                <template #column-created_at="{ data }">
                    <span class="text-sm text-gray-600">
                        {{ formatDateLong(data.created_at) }}
                    </span>
                </template>
            </BaseDataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGeneralStore } from '~/store/general'
import { useRolesStore } from '~/store/roles'
import type { RoleResource } from '~/types/administrators'

// Page meta
definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

// Stores
const rolesStore = useRolesStore()
const generalStore = useGeneralStore()

// Composables
const { t } = useI18n()
const { formatDateLong } = useFormatDate()

// Page state
const filters = ref({
    search: ''
})

// Table configuration
const sortField = ref<string>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const columns = computed(() => [
    {
        key: 'name',
        field: 'name',
        header: t('roles.name'),
        sortable: true,
        template: 'name'
    },
    {
        key: 'created_at',
        field: 'created_at',
        header: t('common.created_at'),
        sortable: true,
        template: 'created_at'
    }
])

// Filter fields
const filterFields = computed(() => [
    {
        key: 'search',
        label: t('common.search'),
        type: 'text' as const,
        placeholder: t('roles.search_placeholder')
    }
])

// Breadcrumb
const breadcrumbItems = computed(() => [
    { label: t('dashboard.title'), route: '/dashboard' },
    { label: t('roles.title') }
])

// Methods
const loadRoles = async (params = {}) => {
    generalStore.isLoading = true
    try {
        await rolesStore.getRoles({
            search: filters.value.search,
            sort_field: sortField.value,
            sort_order: sortOrder.value,
            ...params
        })
    } finally {
        generalStore.isLoading = false
    }
}

const onFilterChange = () => {
    loadRoles()
}

const onFilterReset = () => {
    filters.value = {
        search: ''
    }
    loadRoles()
}

const onPageChange = (event: any) => {
    loadRoles({
        page: event.page + 1,
        per_page: event.rows
    })
}

const onSort = (event: any) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
    loadRoles()
}

// Lifecycle
onMounted(() => {
    loadRoles()
})
</script> 