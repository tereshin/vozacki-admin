export interface BaseDataTableColumn {
    key: string
    field?: string
    header: string
    sortable?: boolean
    style?: string
    type?: 'text' | 'code' | 'tag' | 'custom'
    tagValue?: (data: any) => string
    tagSeverity?: (data: any) => string
    formatter?: (value: any, data: any) => string
}

export interface BaseDataTableActionsColumn {
    header: string
    style?: string
}

export interface BaseDataTableDefaultActions {
    primaryLabel: string
    primaryAction: (data: any) => void
    menuItems?: (data: any) => any[]
}

export interface BaseDataTableProps {
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