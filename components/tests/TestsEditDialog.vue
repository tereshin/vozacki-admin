<template>
    <Dialog v-model:visible="dialogVisible" modal :style="{ width: '90vw', maxWidth: '600px' }"
        :header="$t('tests.single.editTest')" :closable="true" @hide="onDialogHide">

        <div class="p-fluid">
            <!-- Test Form -->
            <div class="mb-6">
                <!-- Test Title -->
                <div class="field mb-4">
                    <label for="testTitle" class="block text-900 font-medium mb-2">
                        {{ $t('tests.single.testTitle') }} <span class="text-red-500">*</span>
                    </label>
                    <InputText id="testTitle" v-model="formData.title"
                        :placeholder="$t('tests.single.testTitlePlaceholder')" class="w-full"
                        :class="{ 'p-invalid': errors.title }" />
                    <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
                </div>

                <!-- Test Description -->
                <div class="field mb-4">
                    <label for="testDescription" class="block text-900 font-medium mb-2">
                        {{ $t('tests.single.description') }}
                    </label>
                    <Textarea id="testDescription" v-model="formData.description"
                        :placeholder="$t('tests.single.descriptionPlaceholder')" rows="4" class="w-full" />
                </div>

                <!-- Language Selection -->
                <div class="field mb-4">
                    <label for="testLanguage" class="block text-900 font-medium mb-2">
                        {{ $t('tests.single.language') }} <span class="text-red-500">*</span>
                    </label>
                    <Dropdown id="testLanguage" v-model="formData.language_id" :options="languageOptions"
                        :placeholder="$t('common.selectLanguage')" optionLabel="label" optionValue="value"
                        class="w-full" :class="{ 'p-invalid': errors.language_id }" :disabled="!isCreateMode" />
                    <small v-if="errors.language_id" class="p-error">{{ errors.language_id }}</small>
                    <small v-if="!isCreateMode" class="text-600">{{ $t('tests.form.languageEditNotice') }}</small>
                </div>

                <!-- Topic Selection -->
                <div class="field mb-4">
                    <label for="testTopic" class="block text-900 font-medium mb-2">
                        {{ $t('tests.single.topic') }}
                    </label>
                    <Dropdown id="testTopic" v-model="formData.topic_uid" :options="topicOptions"
                        :placeholder="$t('tests.single.selectTopic')" optionLabel="label" optionValue="value"
                        class="w-full" />
                </div>
            </div>
        </div>

        <!-- Dialog Footer -->
        <template #footer>
            <div class="flex gap-2">
                <Button :label="$t('common.cancel')" icon="pi pi-times" @click="closeDialog" severity="secondary"
                    outlined />
                <Button :label="$t('common.update')" icon="pi pi-check" @click="saveTest" :loading="saving" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import type { TestResource, TestUpdateRequest } from '~/types/tests'
import type { LanguageResource } from '~/types/languages'
import type { TopicResource } from '~/types/topics'
import { useTestsStore } from '~/store/tests'

// Props
interface Props {
    visible: boolean
    test: TestResource | null
}

// Emits
interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const toast = useToast()
const { contentLanguageId } = useAppSettings()
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()

// Stores
const testsStore = useTestsStore()

// Reactive data
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const saving = ref(false)
const isCreateMode = ref(false) // For future extension
const languages = ref<LanguageResource[]>([])
const topics = ref<TopicResource[]>([])

const formData = ref({
    title: '',
    description: '',
    language_id: '',
    topic_uid: ''
})

const errors = ref<Record<string, string>>({})

// Computed properties
const languageOptions = computed(() => 
    languages.value.map(lang => ({
        label: lang.name,
        value: lang.id
    }))
)

const topicOptions = computed(() => [
    { label: t('tests.single.noTopic'), value: '' },
    ...topics.value.map(topic => ({
        label: topic.name,
        value: topic.uid
    }))
])

// Helper function to convert language code to ID
const getActualLanguageId = async (codeOrId: string): Promise<string> => {
    if (codeOrId.includes('-')) {
        const language = languages.value.find(lang => lang.code === codeOrId)
        return language?.id || codeOrId
    }
    return codeOrId
}

// Methods
const resetForm = () => {
    formData.value = {
        title: '',
        description: '',
        language_id: '',
        topic_uid: ''
    }
    errors.value = {}
}

const loadTestData = async () => {
    if (!props.test) return

    // Load test data
    formData.value = {
        title: props.test.title || '',
        description: props.test.description || '',
        language_id: props.test.language_id || '',
        topic_uid: props.test.topic_uid || ''
    }
}

const loadLanguagesData = async () => {
    try {
        languages.value = await loadCachedLanguages()
    } catch (error) {
        console.error('Error loading languages:', error)
    }
}

const loadTopicsData = async () => {
    try {
        // Load topics for the current language
        const { useTopicsApi } = await import('~/composables/api/useTopicsApi')
        const topicsApi = useTopicsApi()
        
        const languageId = formData.value.language_id || await getActualLanguageId(contentLanguageId.value)
        
        const response = await topicsApi.getTopics({
            language_id: languageId,
            per_page: 100 // Load all topics
        })
        
        topics.value = response.data.collection || []
    } catch (error) {
        console.error('Error loading topics:', error)
        topics.value = []
    }
}

const validateForm = (): boolean => {
    errors.value = {}
    let hasErrors = false

    // Validate title
    if (!formData.value.title?.trim()) {
        errors.value.title = t('tests.validation.titleRequired')
        hasErrors = true
    }

    // Validate language
    if (!formData.value.language_id) {
        errors.value.language_id = t('tests.validation.languageRequired')
        hasErrors = true
    }

    return !hasErrors
}

const saveTest = async () => {
    if (!validateForm() || !props.test) return

    saving.value = true

    try {
        const updateData: TestUpdateRequest = {
            title: formData.value.title,
            description: formData.value.description || null,
            topic_uid: formData.value.topic_uid || null
        }

        await testsStore.updateTest(props.test.id, updateData)

        toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('tests.single.testUpdated'),
            life: 3000
        })

        emit('saved')
        closeDialog()
    } catch (error) {
        console.error('Error saving test:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('tests.single.testUpdateError'),
            life: 3000
        })
    } finally {
        saving.value = false
    }
}

const closeDialog = () => {
    dialogVisible.value = false
}

const onDialogHide = () => {
    resetForm()
}

// Initialize data when dialog opens
const initializeDialog = async () => {
    await loadLanguagesData()
    await loadTestData()
    await loadTopicsData()
}

// Watchers
watch(() => props.visible, async (newValue) => {
    if (newValue && props.test) {
        await initializeDialog()
    }
})

watch(() => formData.value.language_id, async (newValue) => {
    if (newValue && props.visible) {
        await loadTopicsData()
    }
})
</script> 