<template>
    <Card>
        <template #content>
            <DataTable 
                :value="data" 
                :loading="loading"
                :totalRecords="totalRecords" 
                :rows="rowsPerPage"
                :first="(currentPage - 1) * rowsPerPage" 
                lazy 
                paginator
                :rowsPerPageOptions="rowsPerPageOptions"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :currentPageReportTemplate="currentPageReportTemplate"
                sortMode="single" 
                :sortField="sortField" 
                :sortOrder="sortOrder === 'asc' ? 1 : -1"
                @page="onPageChange" 
                @sort="onSort" 
                stripedRows 
                showGridlines 
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <template #empty>
                    <div class="text-center py-8">
                        <i :class="emptyStateIcon" class="text-4xl text-400 mb-4"></i>
                        <div class="text-900 font-medium text-xl mb-2">{{ emptyStateTitle }}</div>
                        <div class="text-600">{{ emptyStateDescription }}</div>
                    </div>
                </template>

                <template #loading>
                    <div class="text-center py-8">
                        <ProgressSpinner />
                        <div class="mt-3 text-600">{{ loadingText }}</div>
                    </div>
                </template>

                <Column 
                    v-for="column in columns" 
                    :key="column.field || column.key"
                    :field="column.field"
                    :header="column.header"
                    :sortable="column.sortable"
                    :style="column.style"
                >
                    <template #body="{ data: rowData }">
                        <slot 
                            :name="`column-${column.key}`" 
                            :data="rowData" 
                            :column="column"
                            :value="getColumnValue(rowData, column)"
                        >
                            <!-- Default rendering if no slot provided -->
                            <span v-if="column.type === 'text'">
                                {{ getColumnValue(rowData, column) }}
                            </span>
                            <code v-else-if="column.type === 'code'" class="text-600 text-sm">
                                {{ getColumnValue(rowData, column) }}
                            </code>
                            <Tag 
                                v-else-if="column.type === 'tag'" 
                                :value="column.tagValue ? column.tagValue(rowData) : getColumnValue(rowData, column)"
                                :severity="column.tagSeverity ? column.tagSeverity(rowData) : 'secondary'"
                            />
                            <span v-else>
                                {{ getColumnValue(rowData, column) }}
                            </span>
                        </slot>
                    </template>
                </Column>

                <!-- Actions column if provided -->
                <Column v-if="actionsColumn" :header="actionsColumn.header" :style="actionsColumn.style">
                    <template #body="{ data: rowData }">
                        <slot name="actions" :data="rowData">
                            <!-- Default actions if no slot provided -->
                            <SplitButton 
                                v-if="defaultActions"
                                :label="defaultActions.primaryLabel"
                                size="small"
                                severity="secondary"
                                @click="defaultActions.primaryAction(rowData)"
                                :model="defaultActions.menuItems ? defaultActions.menuItems(rowData) : []"
                            />
                        </slot>
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { 
    BaseDataTableColumn, 
    BaseDataTableActionsColumn, 
    BaseDataTableDefaultActions 
} from '~/types/base-data-table'

interface Props {
    data: any[]
    columns: BaseDataTableColumn[]
    loading?: boolean
    totalRecords?: number
    rowsPerPage?: number
    currentPage?: number
    sortField?: string
    sortOrder?: 'asc' | 'desc'
    rowsPerPageOptions?: number[]
    currentPageReportTemplate?: string
    emptyStateIcon?: string
    emptyStateTitle?: string
    emptyStateDescription?: string
    loadingText?: string
    actionsColumn?: BaseDataTableActionsColumn
    defaultActions?: BaseDataTableDefaultActions
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    totalRecords: 0,
    rowsPerPage: 10,
    currentPage: 1,
    sortField: 'id',
    sortOrder: 'desc',
    rowsPerPageOptions: () => [10, 25, 50, 100],
    currentPageReportTemplate: 'Showing {first} - {last} of {totalRecords} records',
    emptyStateIcon: 'pi pi-file',
    emptyStateTitle: 'No Data Found',
    emptyStateDescription: 'No records match your criteria',
    loadingText: 'Loading...'
})

interface Emits {
    (e: 'page-change', event: any): void
    (e: 'sort', event: any): void
}

const emit = defineEmits<Emits>()

const onPageChange = (event: any) => {
    emit('page-change', event)
}

const onSort = (event: any) => {
    emit('sort', event)
}

const getColumnValue = (rowData: any, column: BaseDataTableColumn): any => {
    if (column.formatter) {
        return column.formatter(rowData[column.field || column.key], rowData)
    }
    
    if (column.field) {
        return rowData[column.field]
    }
    
    return rowData[column.key]
}
</script> 