<template>
    <Dialog 
        :visible="visible" 
        @update:visible="$emit('update:visible', $event)"
        :header="isEditMode ? $t('topics.form.editTitle') : $t('topics.form.createTitle')"
        :modal="true"
        :style="{ width: '600px' }"
        :closable="!loading"
        :draggable="false"
        :dismissableMask="false"
    >
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name -->
            <div>
                <label for="topic-name" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('topics.form.name') }} <span class="text-red-500">*</span>
                </label>
                <InputText 
                    id="topic-name" 
                    v-model="form.name" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.name }"
                    :placeholder="$t('topics.form.namePlaceholder')" 
                    required 
                    :disabled="loading"
                />
                <small v-if="formErrors.name" class="text-red-600 text-sm mt-1">
                    {{ formErrors.name }}
                </small>
            </div>

            <!-- Description -->
            <div>
                <label for="topic-description" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('topics.form.description') }}
                </label>
                <Textarea 
                    id="topic-description" 
                    v-model="form.description" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.description }"
                    :placeholder="$t('topics.form.descriptionPlaceholder')" 
                    rows="3"
                    :disabled="loading"
                />
                <small v-if="formErrors.description" class="text-red-600 text-sm mt-1">
                    {{ formErrors.description }}
                </small>
            </div>

            <!-- Language -->
            <div>
                <label for="topic-language" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('topics.form.language') }} <span class="text-red-500">*</span>
                    <span v-if="isEditMode" class="text-sm text-gray-500 font-normal ml-2">
                        ({{ $t('topics.form.languageEditNotice') }})
                    </span>
                </label>
                <Dropdown 
                    id="topic-language" 
                    v-model="form.language_id" 
                    :options="languages" 
                    option-label="name"
                    option-value="id" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.language_id, 'p-disabled': isEditMode }"
                    :placeholder="$t('topics.form.selectLanguage')" 
                    :loading="languagesLoading" 
                    required 
                    :disabled="loading || isEditMode"
                />
                <small v-if="formErrors.language_id" class="text-red-600 text-sm mt-1">
                    {{ formErrors.language_id }}
                </small>
                <small v-if="isEditMode" class="text-gray-500 text-xs mt-1">
                    {{ $t('topics.form.languageEditHint') }}
                </small>
            </div>

            <!-- External ID -->
            <div>
                <label for="topic-external-id" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('topics.form.externalId') }}
                </label>
                <InputNumber 
                    id="topic-external-id" 
                    v-model="form.external_id" 
                    class="w-full" 
                    :class="{ 'p-invalid': formErrors.external_id }"
                    :placeholder="$t('topics.form.externalIdPlaceholder')" 
                    :disabled="loading"
                    :use-grouping="false"
                />
                <small v-if="formErrors.external_id" class="text-red-600 text-sm mt-1">
                    {{ formErrors.external_id }}
                </small>
                <small class="text-gray-500 text-xs mt-1">
                    {{ $t('topics.form.externalIdHint') }}
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
                    :label="isEditMode ? $t('topics.form.update') : $t('topics.form.create')" 
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
import { useTopicsStore } from '~/store/topics'

import type { LanguageResource } from '~/types/languages'
import type { TopicResource, TopicRequest, TopicUpdateRequest } from '~/types/topics'

// ==================== INTERFACES ====================
interface Props {
    visible: boolean
    topic: TopicResource | null
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
const topicsStore = useTopicsStore()
const { contentLanguageId, initSettings } = useAppSettings()
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()

// ==================== REACTIVE STATE ====================
const loading = ref(false)
const languagesLoading = ref(false)

const languages = ref<LanguageResource[]>([])

const form = ref<TopicRequest>({
    name: '',
    description: null,
    language_id: '',
    external_id: null,
    uid: ''
})

const formErrors = ref<Record<string, string>>({})

// ==================== COMPUTED PROPERTIES ====================

// ==================== METHODS ====================
const loadLanguages = async () => {
    languagesLoading.value = true
    try {
        languages.value = await loadCachedLanguages()
        
        // Set default language if not in edit mode
        if (!props.isEditMode && !form.value.language_id && languages.value.length > 0) {
            let languageId = getLanguageIdByCode(contentLanguageId.value)

            // If not found, try some common alternatives
            if (!languageId) {
                const alternatives = ['sr', 'sr-lat', 'sr-latn', 'serbian']
                for (const alt of alternatives) {
                    languageId = getLanguageIdByCode(alt)
                    if (languageId) {
                        break
                    }
                }
            }

            // If still not found, use first available language
            if (!languageId && languages.value.length > 0) {
                languageId = languages.value[0].id
            }

            if (languageId) {
                form.value.language_id = languageId
            }
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('topics.states.error'),
            detail: 'Failed to load languages',
            life: 5000
        })
    } finally {
        languagesLoading.value = false
    }
}

const getLanguageIdByCode = (code: string): string | undefined => {
    const language = languages.value.find(lang => lang.code === code)
    return language?.id
}

const resetForm = () => {
    form.value = {
        name: '',
        description: null,
        language_id: '',
        external_id: null,
        uid: ''
    }
    formErrors.value = {}
}

const populateForm = (topic: TopicResource) => {
    form.value = {
        name: topic.name,
        description: topic.description,
        language_id: topic.language_id,
        external_id: topic.external_id,
        uid: topic.uid
    }
    formErrors.value = {}
}

const validateForm = (): boolean => {
    formErrors.value = {}
    let isValid = true

    if (!form.value.name || form.value.name.trim() === '') {
        formErrors.value.name = t('topics.validation.nameRequired')
        isValid = false
    }

    if (!form.value.language_id) {
        formErrors.value.language_id = t('topics.validation.languageRequired')
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true
    
    try {
        if (props.isEditMode && props.topic) {
            // Update existing topic
            const updateData: TopicUpdateRequest = {
                name: form.value.name,
                description: form.value.description || null,
                external_id: form.value.external_id || null
            }

            await topicsStore.updateTopic(props.topic.id, updateData)
            
            toast.add({
                severity: 'success',
                summary: t('topics.messages.updated'),
                detail: t('topics.messages.updated'),
                life: 3000
            })
        } else {
            // Create new topic
            const createData: TopicRequest = {
                ...form.value,
                description: form.value.description || null,
                external_id: form.value.external_id || null
            }

            await topicsStore.createTopic(createData)
            
            toast.add({
                severity: 'success',
                summary: t('topics.messages.created'),
                detail: t('topics.messages.created'),
                life: 3000
            })
        }

        emit('saved')
        closeDialog()
    } catch (error: any) {
        console.error('Error saving topic:', error)
        
        // Handle validation errors
        if (error?.message?.includes('validation') || error?.details) {
            const details = error.details || {}
            if (details.name) formErrors.value.name = details.name[0]
            if (details.language_id) formErrors.value.language_id = details.language_id[0]
            if (details.external_id) formErrors.value.external_id = details.external_id[0]
        }
        
        toast.add({
            severity: 'error',
            summary: t('topics.states.error'),
            detail: props.isEditMode ? t('topics.actions.updateError') : t('topics.actions.createError'),
            life: 5000
        })
    } finally {
        loading.value = false
    }
}

const closeDialog = () => {
    emit('update:visible', false)
}

// ==================== WATCHERS ====================
watch(() => props.visible, async (newVisible) => {
    if (newVisible) {
        await loadLanguages()
        
        if (props.isEditMode && props.topic) {
            populateForm(props.topic)
        } else {
            resetForm()
        }
    }
})

// ==================== LIFECYCLE ====================
onMounted(async () => {
    await initSettings()
})
</script> 