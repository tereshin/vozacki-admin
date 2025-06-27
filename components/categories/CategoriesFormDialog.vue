<template>
    <Dialog 
        :visible="visible" 
        @update:visible="$emit('update:visible', $event)"
        :header="isEditMode ? $t('categories.form.editTitle') : $t('categories.form.createTitle')"
        :modal="true"
        :style="{ width: '600px' }"
        :closable="!loading"
        :draggable="false"
        :dismissableMask="false"
    >
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name -->
            <div>
                <label for="category-name" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('categories.form.name') }} <span class="text-red-500">*</span>
                </label>
                <InputText 
                    id="category-name" 
                    v-model="form.name" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.name }"
                    :placeholder="$t('categories.form.namePlaceholder')" 
                    required 
                    :disabled="loading"
                />
                <small v-if="formErrors.name" class="text-red-600 text-sm mt-1">
                    {{ formErrors.name }}
                </small>
            </div>

            <!-- Slug -->
            <div>
                <label for="category-slug" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('categories.form.slug') }} <span class="text-red-500">*</span>
                </label>
                <InputText 
                    id="category-slug" 
                    v-model="form.slug" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.slug }"
                    :placeholder="$t('categories.form.slugPlaceholder')" 
                    required 
                    :disabled="loading"
                />
                <small v-if="formErrors.slug" class="text-red-600 text-sm mt-1">
                    {{ formErrors.slug }}
                </small>
            </div>

            <!-- Description -->
            <div>
                <label for="category-description" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('categories.form.description') }}
                </label>
                <Textarea 
                    id="category-description" 
                    v-model="form.description" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.description }"
                    :placeholder="$t('categories.form.descriptionPlaceholder')" 
                    rows="3"
                    :disabled="loading"
                />
                <small v-if="formErrors.description" class="text-red-600 text-sm mt-1">
                    {{ formErrors.description }}
                </small>
            </div>

            <!-- Language -->
            <div>
                <label for="category-language" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('categories.form.language') }} <span class="text-red-500">*</span>
                    <span v-if="isEditMode" class="text-sm text-gray-500 font-normal ml-2">
                        ({{ $t('categories.form.languageEditNotice') }})
                    </span>
                </label>
                <Dropdown 
                    id="category-language" 
                    v-model="form.language_id" 
                    :options="languages" 
                    option-label="name"
                    option-value="id" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.language_id, 'p-disabled': isEditMode }"
                    :placeholder="$t('categories.form.selectLanguage')" 
                    :loading="languagesLoading" 
                    required 
                    :disabled="loading || isEditMode"
                    @change="onLanguageChange"
                />
                <small v-if="formErrors.language_id" class="text-red-600 text-sm mt-1">
                    {{ formErrors.language_id }}
                </small>
                <small v-if="isEditMode" class="text-gray-500 text-xs mt-1">
                    {{ $t('categories.form.languageEditHint') }}
                </small>
            </div>

            <!-- Parent Category -->
            <div>
                <label for="category-parent" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('categories.form.parent') }}
                </label>
                <Dropdown 
                    id="category-parent" 
                    v-model="form.parent_category_uid" 
                    :options="availableParentCategories" 
                    option-label="name"
                    option-value="uid" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.parent_category_uid }"
                    :placeholder="$t('categories.form.selectParent')" 
                    :loading="categoriesLoading" 
                    :show-clear="true"
                    filter
                    :disabled="loading || !form.language_id"
                />
                <small v-if="formErrors.parent_category_uid" class="text-red-600 text-sm mt-1">
                    {{ formErrors.parent_category_uid }}
                </small>
            </div>
        </form>

        <template #footer>
            <div class="flex justify-between gap-2">
                <Button 
                    :label="$t('common.cancel')" 
                    icon="pi pi-times" 
                    severity="secondary" 
                    @click="closeDialog"
                    :disabled="loading"
                />
                <Button 
                    :label="isEditMode ? $t('categories.form.update') : $t('categories.form.create')" 
                    icon="pi pi-check" 
                    @click="handleSubmit"
                    :loading="loading"
                />
            </div>
        </template>

        <!-- Toast -->
        <Toast />
    </Dialog>
</template>

<script setup lang="ts">
// ==================== IMPORTS ====================
import { useCategoriesStore } from '~/store/categories'
import type { LanguageResource } from '~/types/languages'
import type { CategoryResource, CategoryRequest, CategoryUpdateRequest } from '~/types/categories'
// ==================== INTERFACES ====================
interface Props {
    visible: boolean
    category: CategoryResource | null
    isEditMode: boolean
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'saved'): void
}

// ==================== PROPS & EMITS ====================
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== COMPOSABLES ====================
const { t } = useI18n()
const toast = useToast()
const categoriesStore = useCategoriesStore()
const { contentLanguageId, initSettings } = useAppSettings()
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()

// ==================== REACTIVE STATE ====================
const loading = ref(false)
const languagesLoading = ref(false)
const categoriesLoading = ref(false)

const languages = ref<LanguageResource[]>([])
const parentCategories = ref<CategoryResource[]>([])

const form = ref<CategoryRequest>({
    name: '',
    slug: '',
    description: null,
    language_id: '',
    parent_category_uid: null,
    uid: ''
})

const formErrors = ref<Record<string, string>>({})

// ==================== COMPUTED PROPERTIES ====================
const availableParentCategories = computed(() => {
    // Exclude current category from parent options (prevent self-referencing)
    if (props.isEditMode && props.category) {
        return parentCategories.value.filter(cat => cat.uid !== props.category?.uid)
    }
    return parentCategories.value
})

// ==================== METHODS ====================
const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

const loadLanguages = async () => {
    try {
        languagesLoading.value = true
        const languagesData = await loadCachedLanguages()
        languages.value = languagesData
    } catch (error) {
        console.error('Error loading languages:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: 'Failed to load languages',
            life: 5000
        })
    } finally {
        languagesLoading.value = false
    }
}

const loadParentCategories = async (languageId?: string) => {
    if (!languageId) {
        parentCategories.value = []
        return
    }

    try {
        categoriesLoading.value = true
        const response = await categoriesStore.getCategories({
            language_id: languageId,
            per_page: 1000
        })
        parentCategories.value = response.data.collection
    } catch (error) {
        console.error('Error loading parent categories:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: 'Failed to load parent categories',
            life: 5000
        })
    } finally {
        categoriesLoading.value = false
    }
}

const onLanguageChange = (event: any) => {
    form.value.parent_category_uid = null
    loadParentCategories(event.value)
}

const validateForm = (): boolean => {
    formErrors.value = {}

    if (!form.value.name.trim()) {
        formErrors.value.name = t('categories.form.errors.nameRequired')
    }

    if (!form.value.slug.trim()) {
        formErrors.value.slug = t('categories.form.errors.slugRequired')
    }

    if (!form.value.language_id) {
        formErrors.value.language_id = t('categories.form.errors.languageRequired')
    }

    return Object.keys(formErrors.value).length === 0
}

const generateContentUid = (): string => {
    return crypto.randomUUID()
}

const resetForm = () => {
    form.value = {
        name: '',
        slug: '',
        description: null,
        language_id: '',
        parent_category_uid: null,
        uid: ''
    }
    formErrors.value = {}
}

const populateForm = () => {
    if (props.category && props.isEditMode) {
        form.value = {
            name: props.category.name,
            slug: props.category.slug,
            description: props.category.description,
            language_id: props.category.language_id,
            parent_category_uid: props.category.parent_category_uid,
            uid: props.category.uid
        }
        // Load parent categories for the selected language
        loadParentCategories(props.category.language_id)
    } else {
        resetForm()
        // Auto-select language from settings if not selected
        if (!form.value.language_id && contentLanguageId.value) {
            const languageExists = languages.value.find(l => l.id === contentLanguageId.value)
            if (languageExists) {
                form.value.language_id = contentLanguageId.value
                loadParentCategories(contentLanguageId.value)
            }
        }
        // Generate new UID for new category
        form.value.uid = generateContentUid()
    }
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    try {
        loading.value = true

        if (props.isEditMode && props.category) {
            // For updates, exclude language_id to prevent changes
            const updateData: CategoryUpdateRequest = {
                name: form.value.name.trim(),
                slug: form.value.slug.trim(),
                description: form.value.description?.trim() || null,
                parent_category_uid: form.value.parent_category_uid,
                uid: form.value.uid
            }
            await categoriesStore.updateCategory(props.category.id, updateData)
            toast.add({
                severity: 'success',
                summary: t('common.success'),
                detail: t('categories.messages.updated'),
                life: 3000
            })
        } else {
            // For creation, include all fields including language_id
            const createData: CategoryRequest = {
                name: form.value.name.trim(),
                slug: form.value.slug.trim(),
                description: form.value.description?.trim() || null,
                language_id: form.value.language_id,
                parent_category_uid: form.value.parent_category_uid,
                uid: form.value.uid
            }
            await categoriesStore.createCategory(createData)
            toast.add({
                severity: 'success',
                summary: t('common.success'),
                detail: t('categories.messages.created'),
                life: 3000
            })
        }

        emit('saved')
    } catch (error: any) {
        console.error('Error saving category:', error)

        if (error.details) {
            formErrors.value = error.details
        } else {
            toast.add({
                severity: 'error',
                summary: t('common.error'),
                detail: error.message || 'Failed to save category',
                life: 5000
            })
        }
    } finally {
        loading.value = false
    }
}

const closeDialog = () => {
    emit('update:visible', false)
}

// ==================== WATCHERS ====================
// Watch for dialog visibility changes
watch(() => props.visible, (newValue) => {
    if (newValue) {
        populateForm()
    }
})

// Watch for title changes to auto-generate slug
watch(() => form.value.name, (newName) => {
    if (newName && !props.isEditMode && !form.value.slug) {
        form.value.slug = generateSlug(newName)
    }
})

// ==================== LIFECYCLE ====================
onMounted(async () => {
    initSettings()
    await loadLanguages()
})
</script> 