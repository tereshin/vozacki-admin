<template>
    <Dialog v-model:visible="dialogVisible" modal :style="{ width: '90vw', maxWidth: '600px' }"
        :header="props.isCreateMode ? $t('tests.single.createTest') : $t('tests.single.editTest')" :closable="true" @hide="onDialogHide">

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
                        <span v-if="isCreateMode" class="text-red-500">*</span>
                    </label>
                    <Dropdown id="testTopic" v-model="formData.topic_uid" :options="topicOptions"
                        :placeholder="topics.length === 0 ? $t('tests.single.loadingTopics') : $t('tests.single.selectTopic')" 
                        optionLabel="label" optionValue="value"
                        class="w-full" :class="{ 'p-invalid': errors.topic_uid }" 
                        :disabled="topics.length === 0" />
                    <small v-if="errors.topic_uid" class="p-error">{{ errors.topic_uid }}</small>
                    <small v-else-if="isCreateMode && topics.length === 0" class="text-600">
                        {{ $t('tests.single.loadingTopicsMessage') }}
                    </small>
                </div>
            </div>
        </div>

        <!-- Dialog Footer -->
        <template #footer>
            <div class="flex gap-2">
                <Button :label="$t('common.cancel')" icon="pi pi-times" @click="closeDialog" severity="secondary"
                    outlined />
                <Button :label="props.isCreateMode ? $t('common.create') : $t('common.update')" icon="pi pi-check" @click="saveTest" :loading="saving" 
                    :disabled="props.isCreateMode && (!formData.language_id || !formData.topic_uid)" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
// ==================== INTERFACES/TYPES ====================
import type { TestResource, TestRequest, TestUpdateRequest } from '~/types/tests'
import type { LanguageResource } from '~/types/languages'
import type { TopicResource } from '~/types/topics'

interface Props {
    visible: boolean
    test: TestResource | null
    isCreateMode?: boolean
    topic?: TopicResource | null
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'saved'): void
}

// ==================== STORES ====================
import { useTestsStore } from '~/store/tests'
const testsStore = useTestsStore()

// ==================== COMPOSABLES ====================
const { t } = useI18n()
const toast = useToast()
const { contentLanguageId } = useAppSettings()
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()
const topicsApi = useTopicsApi()

// ==================== PROPS & EMITS ====================
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== REACTIVE DATA ====================
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const saving = ref(false)
const languages = ref<LanguageResource[]>([])
const topics = ref<TopicResource[]>([])

// Computed property for create mode
const isCreateMode = computed(() => props.isCreateMode || false)

const formData = ref({
    title: '',
    description: '',
    language_id: '',
    topic_uid: ''
})

const errors = ref<Record<string, string>>({})

// ==================== COMPUTED PROPERTIES ====================
const languageOptions = computed(() => 
    languages.value.map(lang => ({
        label: lang.name,
        value: lang.id
    }))
)

const topicOptions = computed(() => {
    const options = topics.value.map(topic => ({
        label: topic.name,
        value: topic.uid
    }))
    
    // В режиме редактирования добавляем опцию "Без темы"
    if (!isCreateMode.value) {
        options.unshift({ label: t('tests.single.noTopic'), value: '' })
    }
    
    return options
})

// ==================== METHODS ====================
// Helper function to convert language code to ID
const getActualLanguageId = async (codeOrId: string): Promise<string> => {
    if (!codeOrId) return ''
    
    // Если языки еще не загружены, загружаем их
    if (languages.value.length === 0) {
        await loadLanguagesData()
    }
    
    // Проверяем, является ли это кодом языка
    if (codeOrId.includes('-') || codeOrId.length <= 2) {
        const language = languages.value.find(lang => lang.code === codeOrId)
        if (language) {
            console.log(`Converted language code ${codeOrId} to ID ${language.id}`)
            return language.id
        }
    }
    
    // Если это уже ID или не найден подходящий язык
    return codeOrId
}

const resetForm = () => {
    formData.value = {
        title: '',
        description: '',
        language_id: '',
        topic_uid: ''
    }
    errors.value = {}
    // Не сбрасываем languages и topics здесь, так как они кэшируются
    console.log('Form reset')
}

const loadTestData = async () => {
    if (props.isCreateMode) {
        // For create mode, initialize with default values
        const languageId = await getActualLanguageId(contentLanguageId.value)
        formData.value = {
            title: '',
            description: '',
            language_id: languageId,
            topic_uid: '' // Будет установлено в loadTopicsData
        }
        console.log('Initialized create mode with language_id:', languageId)
        return
    }

    if (!props.test) {
        console.warn('No test data provided for edit mode')
        return
    }

    // Load test data for edit mode
    formData.value = {
        title: props.test.title || '',
        description: props.test.description || '',
        language_id: props.test.language_id || '',
        topic_uid: props.test.topic_uid || ''
    }
    console.log('Loaded test data for edit mode:', formData.value)
}

const loadLanguagesData = async () => {
    try {
        languages.value = await loadCachedLanguages()
        console.log('Loaded languages:', languages.value.length)
    } catch (error) {
        console.error('Error loading languages:', error)
        languages.value = []
    }
}

const loadTopicsData = async () => {
    try {
        const languageId = formData.value.language_id || await getActualLanguageId(contentLanguageId.value)
        
        if (!languageId) {
            console.warn('No language ID available for loading topics')
            topics.value = []
            return
        }
        
        const response = await topicsApi.getTopics({
            filters: {
                language_id: languageId
            },
            per_page: 100 // Load all topics
        })
        
        topics.value = response.data.collection || []
        
        // В режиме создания, если передана тема, автоматически выбираем её
        if (props.isCreateMode && props.topic && !formData.value.topic_uid) {
            const topicExists = topics.value.find(t => t.uid === props.topic!.uid)
            if (topicExists) {
                formData.value.topic_uid = props.topic.uid
            }
        }
        
        console.log('Loaded topics:', topics.value.length, 'for language:', languageId)
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

    // Validate language (always required)
    if (!formData.value.language_id) {
        errors.value.language_id = t('tests.validation.languageRequired')
        hasErrors = true
    }

    // Validate topic (required for creation)
    if (props.isCreateMode && !formData.value.topic_uid) {
        errors.value.topic_uid = t('tests.validation.topicRequired')
        hasErrors = true
    }

    return !hasErrors
}

const saveTest = async () => {
    if (!validateForm()) return

    // Validate test exists for edit mode
    if (!props.isCreateMode && !props.test) return

    // Дополнительная проверка для режима создания
    if (props.isCreateMode) {
        if (!formData.value.language_id) {
            toast.add({
                severity: 'error',
                summary: t('common.error'),
                detail: t('tests.validation.languageRequired'),
                life: 3000
            })
            return
        }
        
        if (!formData.value.topic_uid) {
            toast.add({
                severity: 'error',
                summary: t('common.error'),
                detail: t('tests.validation.topicRequired'),
                life: 3000
            })
            return
        }
    }

    saving.value = true

    try {
        if (props.isCreateMode) {
            // Create new test
            const createData: TestRequest = {
                title: formData.value.title,
                description: formData.value.description || null,
                language_id: formData.value.language_id,
                topic_uid: formData.value.topic_uid // В режиме создания тема обязательна
            }

            await testsStore.createTest(createData)

            toast.add({
                severity: 'success',
                summary: t('common.success'),
                detail: t('tests.single.testCreated'),
                life: 3000
            })
        } else {
            // Update existing test
            const updateData: TestUpdateRequest = {
                title: formData.value.title,
                description: formData.value.description || null,
                topic_uid: formData.value.topic_uid || null
            }

            await testsStore.updateTest(props.test!.id, updateData)

            toast.add({
                severity: 'success',
                summary: t('common.success'),
                detail: t('tests.single.testUpdated'),
                life: 3000
            })
        }

        emit('saved')
        closeDialog()
    } catch (error) {
        console.error('Error saving test:', error)
        const errorDetail = props.isCreateMode ? t('tests.single.testCreateError') : t('tests.single.testUpdateError')
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: errorDetail,
            life: 3000
        })
    } finally {
        saving.value = false
    }
}

const closeDialog = () => {
    console.log('Closing dialog')
    dialogVisible.value = false
}

const onDialogHide = () => {
    // Сбрасываем только данные формы, а не списки
    formData.value = {
        title: '',
        description: '',
        language_id: '',
        topic_uid: ''
    }
    errors.value = {}
    console.log('Dialog hidden, form data reset')
}

const initializeDialog = async () => {
    console.log('Initializing dialog, createMode:', props.isCreateMode, 'test:', props.test)
    
    // Сначала загружаем языки
    await loadLanguagesData()
    
    // Затем загружаем данные теста (устанавливает language_id)
    await loadTestData()
    
    // Загружаем темы после установки language_id
    await loadTopicsData()
}

// ==================== LIFECYCLE HOOKS ====================
// Watchers
watch(() => props.visible, async (newValue) => {
    if (newValue) {
        console.log('Dialog opened, initializing...')
        await initializeDialog()
    } else {
        console.log('Dialog closed')
    }
})

watch(() => formData.value.language_id, async (newValue) => {
    if (newValue && props.visible) {
        await loadTopicsData()
    }
})

watch(() => props.topic, (newTopic) => {
    if (newTopic && props.isCreateMode && topics.value.length > 0) {
        const topicExists = topics.value.find(t => t.uid === newTopic.uid)
        if (topicExists && !formData.value.topic_uid) {
            formData.value.topic_uid = newTopic.uid
        }
    }
})

// Инициализация при монтировании компонента
onMounted(async () => {
    console.log('TestsEditDialog mounted')
    // Предварительно загружаем языки для кеша
    await loadLanguagesData()
})
</script> 