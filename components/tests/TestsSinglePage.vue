<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader :title="$t('tests.tree.totalQuestions')" :items="breadcrumbItems">
            <template #header-actions>
                <div class="flex gap-2">
                    <Button :label="$t('tests.single.addQuestion')" icon="pi pi-plus" @click="openCreateQuestionDialog"
                        size="small" />
                    <Button :label="$t('tests.single.editTest')" icon="pi pi-pencil" @click="editTest" size="small"
                        severity="secondary" />
                </div>
            </template>
        </TheHeader>

        <div class="pt-2 p-4">
            <!-- Test Info Card -->
            <Card v-if="test" class="mb-4">
                <template #content>
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <div class="text-900 text-lg font-medium">{{ test.title }}</div>
                        </div>
                        <div v-if="test.description">
                            <div class="text-sm font-medium text-600 mb-2">{{ $t('tests.single.description') }}</div>
                            <div class="text-900">{{ test.description }}</div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Filters -->
            <BaseFilter :model-value="filters" :filter-fields="filterConfigs" @update:model-value="updateFilters"
                @change="onFilterChange" @apply="onFilterApply" @reset="onFilterReset" />

            <div class="flex flex-col gap-4">
                <!-- Questions Table -->
                <BaseDataTable :data="questions" :columns="tableColumns" :loading="generalStore.isLoading"
                    :totalRecords="questionsStore.meta.total" :rowsPerPage="questionsStore.meta.per_page"
                    :currentPage="questionsStore.meta.current_page" :sortField="sortField" :sortOrder="sortOrder"
                    @page-change="onPageChange" @sort="onSort" :emptyStateIcon="'pi pi-question-circle'"
                    :emptyStateTitle="$t('tests.single.noQuestions')"
                    :emptyStateDescription="$t('tests.single.noQuestionsDescription')"
                    :actionsColumn="{ header: $t('tests.single.actions'), style: 'min-width: 120px; white-space: nowrap;' }">
                    <template #column-text="{ data }">
                        <div class="text-900 font-medium mb-1">{{ data.text }}</div>
                        <div class="text-sm text-600">ID: {{ data.external_id }}</div>
                    </template>

                    <template #column-points="{ data }">
                        <Tag :value="data.points || 0" severity="success" class="font-medium" />
                    </template>
                    <template #actions="{ data }">
                        <div class="flex gap-2">
                            <Button icon="pi pi-pencil" @click="editQuestion(data)" size="small" severity="secondary"
                                v-tooltip.top="$t('tests.single.editQuestion')" />
                            <Button icon="pi pi-trash" @click="confirmDeleteQuestion(data)" size="small"
                                severity="danger" v-tooltip.top="$t('tests.single.deleteQuestion')" />
                        </div>
                    </template>
                </BaseDataTable>
                <!-- Error Toast -->
                <Toast />
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />

        <!-- Question Edit Dialog -->
        <TestsQuestionEditDialog 
            v-model:visible="questionEditDialogVisible" 
            :question="selectedQuestion"
            :testId="props.testId"
            :isCreateMode="isCreateQuestionMode"
            @saved="onQuestionSaved"
        />

        <!-- Test Edit Dialog -->
        <TestsEditDialog 
            v-model:visible="testEditDialogVisible" 
            :test="test"
            @saved="onTestSaved"
        />
    </div>
</template>

<script setup lang="ts">
// 1. Props interface
interface Props {
    testId: any
}

// 2. TypeScript interfaces and types
import type { TestResource } from '~/types/tests'
import type { QuestionResource } from '~/types/questions'
import type { LanguageResource } from '~/types/languages'
import type { FilterFieldConfig } from '~/types/filters'

// 3. Stores
import { useTestsStore } from '~/store/tests'
import { useQuestionsStore } from '~/store/questions'
import { useGeneralStore } from '~/store/general'

// 5. Props declaration
const props = defineProps<Props>()

// 6. Stores
const testsStore = useTestsStore()
const questionsStore = useQuestionsStore()
const generalStore = useGeneralStore()

// 7. Composables
const { t } = useI18n()
const confirm = useConfirm()
const toast = useToast()
const { contentLanguageId, initSettings } = useAppSettings()
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()

// 8. Variables and reactive data
const test = ref<TestResource | null>(null)
const questions = ref<QuestionResource[]>([])
const languages = ref<LanguageResource[]>([])

const filters = ref({
    search: '',
    points: '',
    language_id: ''
})

const currentPage = ref(1)
const sortField = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Dialog state
const questionEditDialogVisible = ref(false)
const selectedQuestion = ref<QuestionResource | null>(null)
const isCreateQuestionMode = ref(false)
const testEditDialogVisible = ref(false)

// 9. Computed properties
const breadcrumbItems = computed(() => [
    {
        label: t('tests.title'),
        to: "/tests"
    },
    {
        label: t('tests.tree.totalQuestions')
    }
])

const tableColumns = computed(() => [
    {
        key: 'text',
        field: 'text',
        header: t('tests.single.questionText'),
        sortable: true,
        style: 'min-width: 400px;'
    },
    {
        key: 'points',
        field: 'points',
        header: t('tests.single.points'),
        sortable: true,
        style: 'min-width: 100px;'
    }
])

const filterConfigs = computed<FilterFieldConfig[]>(() => [
    {
        key: 'search',
        type: 'text',
        label: 'tests.single.searchQuestions',
        placeholder: 'tests.single.searchQuestionsPlaceholder',
        width: 'w-full'
    },
    {
        key: 'language_id',
        type: 'select',
        label: 'tests.filters.language',
        placeholder: 'tests.filters.allLanguages',
        optionLabel: 'label',
        optionValue: 'value',
        width: 'w-48',
        options: [
            { label: t('tests.filters.allLanguages'), value: '' },
            ...languages.value.map(lang => ({
                label: lang.name,
                value: lang.id
            }))
        ]
    },
    {
        key: 'points',
        type: 'text',
        label: 'tests.single.filterByPoints',
        placeholder: 'tests.single.pointsPlaceholder',
        width: 'w-32'
    }
])

// 10. Functions
// Get language name by ID
const getLanguageName = (languageId: string) => {
    const language = languages.value.find(lang => lang.id === languageId)
    return language?.name || languageId
}

// Helper function to convert language code to ID
const getActualLanguageId = (codeOrId: string): string => {
    if (codeOrId.includes('-')) {
        const language = languages.value.find(lang => lang.code === codeOrId)
        return language?.id || codeOrId
    }
    return codeOrId
}

// Unified data loading function
const loadData = async (options: { resetPage?: boolean } = {}) => {
    if (!props.testId || generalStore.isLoading) return

    generalStore.isLoading = true

    try {
        const languageId = filters.value.language_id || contentLanguageId.value

        // Reset page if requested
        if (options.resetPage) {
            currentPage.value = 1
        }

        // Load test and questions in parallel
        const [testResult] = await Promise.all([
            testsStore.getSingleTest(props.testId, languageId),
            loadQuestions(languageId)
        ])

        test.value = testResult
    } catch (error) {
        console.error('Error loading data:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('tests.single.loadError'),
            life: 3000
        })
    } finally {
        generalStore.isLoading = false
    }
}

// Load questions for the test (internal helper)
const loadQuestions = async (languageId?: string) => {
    if (!props.testId) return

    const params = {
        test_uid: props.testId,
        page: currentPage.value,
        per_page: 10,
        search: filters.value.search || undefined,
        language_id: languageId || filters.value.language_id || undefined,
        points: filters.value.points || undefined,
        ...(sortField.value && { sort: `${sortField.value}:${sortOrder.value}` })
    }

    await questionsStore.getQuestions(params)
    questions.value = questionsStore.items
}

// Load only questions (for pagination/sorting)
const loadQuestionsOnly = async () => {
    if (!props.testId || generalStore.isLoading) return

    generalStore.isLoading = true

    try {
        await loadQuestions()
    } catch (error) {
        console.error('Error loading questions:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('tests.single.questionsLoadError'),
            life: 3000
        })
    } finally {
        generalStore.isLoading = false
    }
}

// Filter methods
const updateFilters = (newFilters: any) => {
    filters.value = { ...newFilters }
}

const onFilterChange = (field: string, value: any) => {
    // Автоматическая фильтрация при изменении любого поля
    currentPage.value = 1
    loadQuestionsOnly()
}

const onFilterApply = () => {
    currentPage.value = 1
    loadQuestionsOnly()
}

const onFilterReset = () => {
    filters.value = {
        search: '',
        points: '',
        language_id: getActualLanguageId(contentLanguageId.value)
    }
    currentPage.value = 1
    loadQuestionsOnly()
}

// Pagination methods
const onPageChange = (event: any) => {
    currentPage.value = event.page + 1
    loadQuestionsOnly()
}

// Sorting methods
const onSort = (event: any) => {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
    loadQuestionsOnly()
}

// Action methods
const openCreateQuestionDialog = () => {
    selectedQuestion.value = null
    isCreateQuestionMode.value = true
    questionEditDialogVisible.value = true
}

const editTest = () => {
    testEditDialogVisible.value = true
}

const editQuestion = (question: QuestionResource) => {
    selectedQuestion.value = question
    isCreateQuestionMode.value = false
    questionEditDialogVisible.value = true
}

const confirmDeleteQuestion = (question: QuestionResource) => {
    confirm.require({
        message: t('tests.single.deleteQuestionConfirm', { text: question.text }),
        header: t('tests.single.deleteQuestionTitle'),
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: t('common.cancel'),
        acceptLabel: t('common.delete'),
        accept: () => deleteQuestion(question.id)
    })
}

const deleteQuestion = async (questionId: string) => {
    try {
        await questionsStore.deleteQuestion(questionId)
        toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('tests.single.questionDeleted'),
            life: 3000
        })
        // Reload only questions after deletion
        await loadQuestionsOnly()
    } catch (error) {
        console.error('Error deleting question:', error)
        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('tests.single.deleteQuestionError'),
            life: 3000
        })
    }
}

const onQuestionSaved = async () => {
    // Reload questions after successful edit
    await loadQuestionsOnly()
}

const onTestSaved = async () => {
    // Reload test data after successful edit
    await loadData()
}

// 11. Watchers
watch(() => props.testId, async (newTestId) => {
    if (newTestId) {
        await loadData({ resetPage: true })
    }
})

watch(() => contentLanguageId.value, async (newLanguageId) => {
    if (newLanguageId) {
        const languageId = getActualLanguageId(newLanguageId)
        
        if (filters.value.language_id !== languageId) {
            filters.value.language_id = languageId
            await loadData({ resetPage: true })
        }
    }
})

watch(() => filters.value.language_id, async (newValue, oldValue) => {
    // Only reload if the language actually changed and it's not the initial load
    if (newValue !== oldValue && oldValue !== '') {
        currentPage.value = 1
        await loadQuestionsOnly()
    }
})

// 12. Lifecycle hooks
onMounted(async () => {
    // Initialize app settings
    await initSettings()

    // Load cached languages
    languages.value = await loadCachedLanguages()

    // Initialize filters with current language ID (convert from code if needed)
    filters.value.language_id = getActualLanguageId(contentLanguageId.value)

    // Load test and questions
    await loadData()
})
</script>