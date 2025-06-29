<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader 
            :title="$t('administrators.title')" 
            :items="breadcrumbItems"
            :hideBreadcrumb="false"
        >
            <template #header-actions>
                <Button 
                    v-if="canAccessAdministrators"
                    :label="$t('administrators.add_new')"
                    icon="pi pi-plus" 
                    size="small"
                    @click="showCreateDialog = true"
                />
            </template>
        </TheHeader>

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
                :data="administratorsStore.items"
                :columns="columns"
                :loading="generalStore.isLoading"
                :total-records="administratorsStore.meta.total"
                :rows-per-page="administratorsStore.meta.per_page"
                :current-page="administratorsStore.meta.current_page"
                :sort-field="sortField"
                :sort-order="sortOrder"
                :empty-state-title="$t('administrators.empty_state_title')"
                :empty-state-description="$t('administrators.empty_state_description')"
                :empty-state-icon="'pi pi-users'"
                :loading-text="$t('common.loading')"
                :actions-column="actionsColumn"
                :default-actions="defaultActions"
                @page-change="onPageChange"
                @sort="onSort"
            >
                <!-- Custom column templates -->
                <template #column-full_name="{ data }">
                    <div class="flex items-center gap-3 min-w-0">
                        <Avatar 
                            :label="getInitials(data.first_name, data.last_name)"
                            shape="circle"
                            class="flex-shrink-0"
                        />
                        <div class="min-w-0">
                            <div class="font-medium text-gray-900 truncate">
                                {{ data.full_name || $t('common.not_specified') }}
                            </div>
                            <div class="text-sm text-gray-500 truncate">{{ data.email }}</div>
                        </div>
                    </div>
                </template>

                <template #column-role="{ data }">
                    <Tag 
                        :value="data.role?.name || $t('common.not_specified')" 
                        :severity="data.role?.code ? getRoleSeverity(data.role.code) : 'secondary'"
                    />
                </template>

                <template #column-created_at="{ data }">
                    <span class="text-sm text-gray-600">
                        {{ formatDateLong(data.created_at) }}
                    </span>
                </template>
            </BaseDataTable>
        </div>

        <!-- Create/Edit Dialog -->
        <Dialog 
            v-model:visible="showCreateDialog" 
            :header="editingAdministrator ? $t('administrators.edit_administrator') : $t('administrators.create_administrator')"
            :modal="true"
            class="w-full max-w-md"
            :closable="true"
        >
            <form @submit.prevent="submitForm" class="space-y-6">
                <div class="space-y-4">
                    <div>
                        <label for="first_name" class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.first_name') }}
                        </label>
                        <InputText 
                            id="first_name"
                            v-model="form.first_name" 
                            class="w-full"
                            :class="{ 'p-invalid': formErrors.first_name }"
                        />
                        <small v-if="formErrors.first_name" class="text-red-600 text-sm mt-1">
                            {{ formErrors.first_name }}
                        </small>
                    </div>

                    <div>
                        <label for="last_name" class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.last_name') }}
                        </label>
                        <InputText 
                            id="last_name"
                            v-model="form.last_name" 
                            class="w-full"
                            :class="{ 'p-invalid': formErrors.last_name }"
                        />
                        <small v-if="formErrors.last_name" class="text-red-600 text-sm mt-1">
                            {{ formErrors.last_name }}
                        </small>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.email') }} <span class="text-red-500">*</span>
                        </label>
                        <InputText 
                            id="email"
                            v-model="form.email" 
                            type="email"
                            class="w-full"
                            :class="{ 'p-invalid': formErrors.email }"
                            required
                        />
                        <small v-if="formErrors.email" class="text-red-600 text-sm mt-1">
                            {{ formErrors.email }}
                        </small>
                    </div>

                    <div>
                        <label for="display_name" class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.display_name') }}
                        </label>
                        <InputText 
                            id="display_name"
                            v-model="form.display_name" 
                            class="w-full"
                            :class="{ 'p-invalid': formErrors.display_name }"
                        />
                        <small v-if="formErrors.display_name" class="text-red-600 text-sm mt-1">
                            {{ formErrors.display_name }}
                        </small>
                    </div>

                    <div>
                        <label for="role_id" class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.role') }} <span class="text-red-500">*</span>
                        </label>
                        <Dropdown 
                            id="role_id"
                            v-model="form.role_id" 
                            :options="availableRoles"
                            option-label="name"
                            option-value="id"
                            class="w-full"
                            :class="{ 'p-invalid': formErrors.role_id }"
                            :placeholder="$t('administrators.select_role')"
                            :loading="rolesStore.loading"
                            required
                        />
                        <small v-if="formErrors.role_id" class="text-red-600 text-sm mt-1">
                            {{ formErrors.role_id }}
                        </small>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.password') }}
                            <span v-if="!editingAdministrator" class="text-red-500">*</span>
                            <span v-else class="text-sm font-normal text-gray-500">
                                ({{ $t('administrators.password_optional_update') }})
                            </span>
                        </label>
                        <InputText 
                            id="password"
                            v-model="form.password" 
                            type="password"
                            class="w-full"
                            :class="{ 'p-invalid': formErrors.password }"
                            :placeholder="editingAdministrator ? $t('administrators.password_placeholder_update') : $t('administrators.password_placeholder')"
                            :required="!editingAdministrator"
                        />
                        <small v-if="formErrors.password" class="text-red-600 text-sm mt-1">
                            {{ formErrors.password }}
                        </small>
                        <small v-if="editingAdministrator" class="text-gray-500 text-sm mt-1">
                            {{ $t('administrators.password_update_hint') }}
                        </small>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button 
                        :label="$t('common.cancel')"
                        @click="closeDialog"
                        text
                    />
                    <Button 
                        :label="editingAdministrator ? $t('common.update') : $t('common.create')"
                        type="submit"
                        :loading="generalStore.isLoading"
                    />
                </div>
            </form>
        </Dialog>

        <!-- View Dialog -->
        <Dialog 
            v-model:visible="showViewDialog" 
            :header="$t('administrators.administrator_details')"
            :modal="true"
            class="w-full max-w-lg"
        >
            <div v-if="viewingAdministrator" class="space-y-6">
                <div class="text-center pb-6 border-b border-gray-200">
                    <Avatar 
                        :label="getInitials(viewingAdministrator.first_name, viewingAdministrator.last_name)"
                        size="xlarge"
                        shape="circle"
                        class="mb-4"
                    />
                    <h3 class="text-xl font-bold text-gray-900 mb-2">
                        {{ viewingAdministrator.full_name || $t('common.not_specified') }}
                    </h3>
                    <p class="text-gray-600">{{ viewingAdministrator.email }}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.role') }}
                        </label>
                        <Tag 
                            :value="viewingAdministrator.role?.name || $t('common.not_specified')" 
                            :severity="viewingAdministrator.role?.code ? getRoleSeverity(viewingAdministrator.role.code) : 'secondary'"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.created_at') }}
                        </label>
                        <p class="text-gray-600 text-sm">{{ formatDateLong(viewingAdministrator.created_at) }}</p>
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-gray-900 mb-2">
                            {{ $t('administrators.updated_at') }}
                        </label>
                        <p class="text-gray-600 text-sm">{{ formatDateLong(viewingAdministrator.updated_at) }}</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-6 border-t mt-6 border-gray-200">
                <Button 
                    :label="$t('common.close')"
                    @click="showViewDialog = false"
                    severity="secondary"
                />
            </div>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog 
            v-model:visible="showDeleteDialog" 
            :header="$t('administrators.confirm_delete')"
            :modal="true"
            class="w-full max-w-md"
        >
            <div class="space-y-6">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                        <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    </div>
                    <div>
                        <p class="text-gray-900 font-medium mb-2">{{ $t('administrators.delete_confirmation') }}</p>
                        <p class="text-gray-600 text-sm">{{ $t('administrators.delete_warning') }}</p>
                    </div>
                </div>

                <div v-if="deletingAdministrator" class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                        <Avatar 
                            :label="getInitials(deletingAdministrator.first_name, deletingAdministrator.last_name)"
                            size="small"
                            shape="circle"
                            class="flex-shrink-0"
                        />
                        <div class="min-w-0">
                            <div class="font-medium text-red-900 truncate">
                                {{ deletingAdministrator.full_name || $t('common.not_specified') }}
                            </div>
                            <div class="text-sm text-red-600 truncate">{{ deletingAdministrator.email }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button 
                    :label="$t('common.cancel')"
                    @click="showDeleteDialog = false"
                    text
                />
                <Button 
                    :label="$t('common.delete')"
                    @click="deleteAdministrator"
                    :loading="generalStore.isLoading"
                    severity="danger"
                />
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
// Import TypeScript interfaces and types
import type { AdministratorResource, AdministratorRequest, AdministratorUpdateRequest } from '~/types/administrators'
import type { BaseDataTableColumn, BaseDataTableActionsColumn } from '~/types/base-data-table'
import type { FilterFieldConfig } from '~/types/filters'

// Import stores
import { useAdministratorsStore } from '~/store/administrators'
import { useGeneralStore } from '~/store/general'
import { useRolesStore } from '~/store/roles'

// Import permissions
import { usePermissions } from '~/composables/core/auth/usePermissions'

// Import libraries and third-party dependencies
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'

// Composables
const { t } = useI18n()
const toast = useToast()
const administratorsStore = useAdministratorsStore()
const generalStore = useGeneralStore()
const rolesStore = useRolesStore()

// Permissions
const { canAccessAdministrators } = usePermissions()

// Utils composables
const { formatDateLong } = useFormatDate()
const { getInitials } = useGetInitials()
const { getRoleSeverity } = useGetRoleSeverity()

// Reactive state
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const editingAdministrator = ref<AdministratorResource | null>(null)
const viewingAdministrator = ref<AdministratorResource | null>(null)
const deletingAdministrator = ref<AdministratorResource | null>(null)

// Filters
const filters = ref({
  search: '',
  role_id: ''
})
const sortField = ref('email')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Form state
const form = ref<AdministratorRequest>({
  email: '',
  first_name: '',
  last_name: '',
  display_name: '',
  role_id: '',
  password: ''
})
const formErrors = ref<Record<string, string>>({})

// Computed properties
const availableRoles = computed(() => rolesStore.allRoles)

const breadcrumbItems = computed(() => [
  {
    label: t('administrators.title'),
    to: "/administrators"
  }
])

const filterFields = computed((): FilterFieldConfig[] => [
  {
    key: 'search',
    type: 'text',
    label: 'administrators.filters.search',
    placeholder: 'administrators.filters.searchPlaceholder',
    width: 'lg:w-1/2',
    icon: 'pi pi-search'
  },
  {
    key: 'role_id',
    type: 'select',
    label: 'administrators.role',
    placeholder: 'administrators.filter_by_role',
    width: 'lg:w-1/3',
    options: availableRoles.value,
    optionLabel: 'name',
    optionValue: 'id',
    showClear: true
  }
])

const columns = computed((): BaseDataTableColumn[] => [
  {
    key: 'full_name',
    header: t('administrators.full_name'),
    sortable: true,
    field: 'email' // Сортируем по email для лучшего UX
  },
  {
    key: 'role',
    header: t('administrators.role'),
    sortable: true,
    field: 'role_id'
  },
  {
    key: 'created_at',
    header: t('administrators.created_at'),
    sortable: true,
    field: 'created_at'
  }
])

const actionsColumn = computed((): BaseDataTableActionsColumn => ({
  header: t('common.actions'),
  style: 'width: 150px'
}))

const getActionItems = (data: AdministratorResource) => {
  const actions = []
  if (canAccessAdministrators.value) {
    actions.push({
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => editAdministrator(data)
    })
    actions.push({ separator: true })
    actions.push({
      label: t('common.delete'),
      icon: 'pi pi-trash',
      command: () => confirmDeleteAdministrator(data),
      class: 'text-red-500'
    })
  }
  return actions
}

const viewAdministrator = (administrator: AdministratorResource) => {
  viewingAdministrator.value = administrator
  showViewDialog.value = true
}

const defaultActions = {
  primaryLabel: t('common.view'),
  primaryAction: viewAdministrator,
  menuItems: getActionItems
}

// Methods
const loadAdministrators = async () => {
  try {
    const params: any = {
      page: administratorsStore.meta.current_page,
      per_page: administratorsStore.meta.per_page,
      sort_field: sortField.value,
      sort_order: sortOrder.value
    }
    
    // Добавляем параметры фильтрации только если они не пустые
    if (filters.value.search?.trim()) {
      params.search = filters.value.search.trim()
    }
    if (filters.value.role_id?.trim()) {
      params.role_id = filters.value.role_id.trim()
    }
    
    await administratorsStore.getAdministrators(params)
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('administrators.error_loading'),
      life: 3000
    })
  }
}

const onPageChange = (event: any) => {
  administratorsStore.meta.current_page = event.page + 1
  administratorsStore.meta.per_page = event.rows
  loadAdministrators()
}

const onSort = (event: any) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
  loadAdministrators()
}

const onFilterChange = (field: string, value: any) => {
  // Автоматически загружаем данные при изменении любого фильтра
  administratorsStore.meta.current_page = 1
  loadAdministrators()
}

const onFilterReset = () => {
  // Фильтры уже очищены BaseFilter компонентом
  administratorsStore.meta.current_page = 1
  loadAdministrators()
}

const resetForm = () => {
  form.value = {
    email: '',
    first_name: '',
    last_name: '',
    display_name: '',
    role_id: '',
    password: ''
  }
  formErrors.value = {}
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingAdministrator.value = null
  resetForm()
}

const submitForm = async () => {
  formErrors.value = {}

  // Валидация пароля при создании
  if (!editingAdministrator.value && !form.value.password?.trim()) {
    formErrors.value.password = t('login.passwordRequired')
    return
  }

  try {
    if (editingAdministrator.value) {
      const updateData: AdministratorUpdateRequest = {
        email: form.value.email,
        first_name: form.value.first_name || null,
        last_name: form.value.last_name || null,
        display_name: form.value.display_name || null,
        role_id: form.value.role_id || null
      }
      
      // Добавляем пароль только если он был введен
      if (form.value.password?.trim()) {
        updateData.password = form.value.password
      }
      
      await administratorsStore.updateAdministrator(editingAdministrator.value.id, updateData)
      
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('administrators.updated_successfully'),
        life: 3000
      })
    } else {
      await administratorsStore.createAdministrator(form.value)
      
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('administrators.created_successfully'),
        life: 3000
      })
    }
    
    closeDialog()
    loadAdministrators()
  } catch (error: any) {
    if (error.details) {
      formErrors.value = error.details
    } else {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: error.message || t('administrators.error_creating'),
        life: 3000
      })
    }
  }
}

const editAdministrator = (administrator: AdministratorResource) => {
  editingAdministrator.value = administrator
  form.value = {
    id: administrator.id,
    email: administrator.email,
    first_name: administrator.first_name || '',
    last_name: administrator.last_name || '',
    display_name: administrator.display_name || '',
    role_id: administrator.role_id || '',
    password: '' // Пароль всегда пустой при редактировании
  }
  showCreateDialog.value = true
}

const confirmDeleteAdministrator = (administrator: AdministratorResource) => {
  deletingAdministrator.value = administrator
  showDeleteDialog.value = true
}

const deleteAdministrator = async () => {
  if (!deletingAdministrator.value) return

  try {
    await administratorsStore.deleteAdministrator(deletingAdministrator.value.id)
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('administrators.deleted_successfully'),
      life: 3000
    })
    
    showDeleteDialog.value = false
    deletingAdministrator.value = null
    loadAdministrators()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('administrators.error_deleting'),
      life: 3000
    })
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Инициализируем кэш если он еще не инициализирован
    const { initializeCache } = useCacheManager()
    await initializeCache()
    
    // Загружаем роли для выпадающего списка из кэша
    await rolesStore.getAllRoles()
    // Затем загружаем администраторов
    await loadAdministrators()
  } catch (error: any) {
    console.error('Error initializing administrators page:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('administrators.error_loading'),
      life: 3000
    })
  }
})
</script>

