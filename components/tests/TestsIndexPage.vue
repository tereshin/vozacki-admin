<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader :title="$t('tests.title')" :items="breadcrumbItems">
            <template #header-actions>
                <Button 
                    v-if="userData?.role?.code === 'administrator'"
                    :label="$t('tests.tree.addTopic')" 
                    icon="pi pi-plus" 
                    @click="openCreateTopicDialog"
                    size="small"
                />
            </template>
        </TheHeader>

        <div class="pt-2 p-4">
            <!-- Filters -->
            <BaseFilter :model-value="filters" :filter-fields="filterConfigs" @update:model-value="updateFilters"
                @apply="onFilterApply" @change="onFilterChange" @reset="onFilterReset" />

            <div class="flex flex-col gap-4">
                <!-- TreeTable -->
                <Card>
                    <template #content>
                        <TreeTable v-model:expandedKeys="expandedKeys" :value="treeData" :loading="generalStore.isLoading"
                            class="p-treetable-sm" stripedRows showGridlines responsiveLayout="scroll"
                            @node-expand="onNodeExpand">
                            <template #empty>
                                <div class="text-center py-8">
                                    <i class="pi pi-folder text-4xl text-400 mb-4"></i>
                                    <div class="text-900 font-medium text-xl mb-2">{{ $t('tests.states.notFound') }}
                                    </div>
                                    <div class="text-600">{{ $t('tests.states.notFoundDescription') }}</div>
                                </div>
                            </template>

                            <!-- Topic/Test Name Column -->
                            <Column field="name" :header="$t('tests.tree.topic')" expander style="min-width: 300px;">
                                <template #body="{ node }">
                                    <div class="flex items-center gap-2 w-full">
                                        <!-- Loading indicator -->
                                        <ProgressSpinner v-if="node.data.type === 'loading'" class="w-4 h-4"
                                            strokeWidth="4" />
                                        <!-- Icon for topic/test -->
                                        <BaseIcon v-else :name="node.data.type === 'topic' ? 'folder' : 'folder'"
                                            :class="node.data.type === 'topic' ? 'text-blue-600' : 'text-green-600'"
                                            class="min-w-6" />
                                        <div class="flex-1">
                                            <!-- Test with link -->
                                            <NuxtLink 
                                                v-if="node.data.type === 'test'"
                                                :to="`/tests/${node.data.id}`"
                                                class="block font-medium text-900 hover:text-primary-500 transition-colors duration-200"
                                            >
                                                {{ node.data.name }}
                                            </NuxtLink>
                                            <!-- Topic without link -->
                                            <div v-else class="font-medium text-900">{{ node.data.name }}</div>
                                            <div v-if="node.data.description" class="text-sm text-600 mt-1">
                                                {{ node.data.description }}
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <!-- Questions Count Column -->
                            <Column field="totalQuestions" :header="$t('tests.tree.totalQuestions')"
                                style="min-width: 120px;">
                                <template #body="{ node }">
                                    <div v-if="node.data.type === 'test'" class="text-center">
                                        <Tag :value="node.data.totalQuestions || 0" severity="info"
                                            class="font-medium" />
                                    </div>
                                    <div v-else-if="node.data.type === 'loading'" class="text-center text-600">
                                        ...
                                    </div>
                                    <div v-else class="text-center text-600">
                                        -
                                    </div>
                                </template>
                            </Column>

                            <!-- Language Column -->
                            <Column field="language" :header="$t('tests.filters.language')" style="min-width: 100px;">
                                <template #body="{ node }">
                                    <div class="text-900">{{ getLanguageName(node.data.language_id) }}</div>
                                </template>
                            </Column>

                            <!-- Actions Column -->
                            <Column :header="$t('tests.tree.actions')" style="min-width: 120px; white-space: nowrap;">
                                <template #body="{ node }">
                                    <div v-if="node.data.type !== 'loading'">
                                        <SplitButton :label="getPrimaryActionLabel(node.data)" size="small"
                                            severity="secondary" @click="handlePrimaryAction(node.data)"
                                            :model="getActionItems(node.data)" />
                                    </div>
                                </template>
                            </Column>
                        </TreeTable>
                    </template>
                </Card>

                <!-- Error Toast -->
                <Toast />
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />

        <!-- Topic Form Dialog -->
        <TopicsFormDialog 
            v-model:visible="topicDialogVisible" 
            :topic="selectedTopic" 
            :is-edit-mode="isEditMode"
            @saved="onTopicSaved"
        />

        <!-- Test Edit/Create Dialog -->
        <TestsEditDialog 
            v-model:visible="testEditDialogVisible" 
            :test="selectedTest" 
            :is-create-mode="isCreateTestMode"
            :topic="selectedTopicForTest"
            @saved="onTestSaved"
        />
    </div>
</template>

<script setup lang="ts">
// ==================== IMPORTS ====================
// Types
import type { LanguageResource } from '~/types/languages'
import type { TopicResource } from '~/types/topics'
import type { TestResource } from '~/types/tests'
import type { FilterFieldConfig } from '~/types/filters'

// Stores
import { useTopicsStore } from '~/store/topics'
import { useTestsStore } from '~/store/tests'
import { useGeneralStore } from '~/store/general'

// ==================== COMPOSABLES ====================
// I18n
const { t } = useI18n()

// User data
const { userData } = useUserData();

// PrimeVue composables
const confirm = useConfirm()
const toast = useToast()

// Stores
const topicsStore = useTopicsStore()
const testsStore = useTestsStore()
const generalStore = useGeneralStore()

// API
const testsApi = useTestsApi()

// App settings
const { contentLanguageId, initSettings } = useAppSettings()

// ==================== REACTIVE STATE ====================
const expandedKeys = ref<{ [key: string]: boolean }>({})
const loadingNodes = ref<Set<string>>(new Set())

// Data
const { loadLanguages: loadCachedLanguages } = useCachedLanguages()
const languages = ref<LanguageResource[]>([])
const testsByTopic = ref<Map<string, TestResource[]>>(new Map())

// Filters
const filters = ref({
    search: '',
    language_id: ''
})

// Topic Dialog State
const topicDialogVisible = ref(false)
const selectedTopic = ref<TopicResource | null>(null)
const isEditMode = ref(false)

// Test Dialog State
const testEditDialogVisible = ref(false)
const selectedTest = ref<TestResource | null>(null)
const isCreateTestMode = ref(false)
const selectedTopicForTest = ref<TopicResource | null>(null)
const loadingTestData = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Breadcrumb items
const breadcrumbItems = computed(() => [
    {
        label: t('tests.title'),
        to: "/tests"
    }
])

// Filter configurations
const filterConfigs = computed<FilterFieldConfig[]>(() => [
    {
        key: 'search',
        type: 'text',
        label: 'tests.filters.search',
        placeholder: 'tests.filters.searchPlaceholder',
        width: 'w-full'
    },
    {
        key: 'language_id',
        type: 'select',
        label: 'tests.filters.language',
        placeholder: 'tests.filters.allLanguages',
        optionLabel: 'label',
        optionValue: 'value',
        options: [
            { label: t('tests.filters.allLanguages'), value: '' },
            ...languages.value.map(lang => ({
                label: lang.name,
                value: lang.id
            }))
        ]
    }
])

// Tree data
const treeData = computed(() => {
    const result: any[] = []

    // Build tree structure - initially show only topics
    topicsStore.items.forEach((topic, index) => {
        const topicKey = `topic-${topic.id}`
        const topicNode: any = {
            key: topicKey,
            data: {
                ...topic,
                type: 'topic',
                name: topic.name
            },
            leaf: false, // Topic can have children
            children: []
        }

        // If topic is expanded and we have tests for it, add them
        const cacheKey = `${topic.uid}-${filters.value.language_id}`
        if (expandedKeys.value[topicKey] && testsByTopic.value.has(cacheKey)) {
            const topicTests = testsByTopic.value.get(cacheKey)!
            topicTests.forEach((test, testIndex) => {
                const testNode = {
                    key: `test-${test.id}`,
                    data: {
                        ...test,
                        type: 'test',
                        name: test.title,
                        totalQuestions: test.total_questions
                    },
                    leaf: true // Tests don't have children
                }
                topicNode.children.push(testNode)
            })
        }

        // Add loading indicator if node is being loaded
        if (loadingNodes.value.has(topicKey)) {
            topicNode.children.push({
                key: `${topicKey}-loading`,
                data: {
                    type: 'loading',
                    name: 'Loading tests...',
                    description: ''
                },
                leaf: true
            })
        }

        result.push(topicNode)
    })

    return result
})

// ==================== METHODS ====================
// Filter methods
const updateFilters = (newFilters: Record<string, any>) => {
    const oldLanguageId = filters.value.language_id
    filters.value = { ...filters.value, ...newFilters }

    // Auto-reload data when language changes
    if ('language_id' in newFilters && newFilters.language_id !== oldLanguageId) {
        // Clear tests cache when language changes
        testsByTopic.value.clear()
        loadData()
    }
}

const onFilterApply = () => {
    loadData()
}

const onFilterChange = () => {
    loadData()
}

const onFilterReset = () => {
    let languageId = contentLanguageId.value
    
    // Если contentLanguageId содержит дефис, это код - нужно конвертировать в ID
    if (languageId.includes('-')) {
        languageId = getLanguageIdByCode(languageId) || languageId
    }
    
    // Проверяем, что язык существует в загруженных языках
    const languageExists = languages.value.find(lang => lang.id === languageId)
    if (!languageExists && languages.value.length > 0) {
        languageId = languages.value[0].id
    }
    
    filters.value = {
        search: '',
        language_id: languageId || ''
    }
    loadData()
}

// Data loading methods
const loadData = async () => {
    generalStore.isLoading = true
    try {
        // Only load languages if not already loaded
        if (languages.value.length === 0) {
            languages.value = await loadCachedLanguages()
        }

        // Load only topics initially - tests will be loaded dynamically
        await topicsStore.getTopics({
            filters: {
                language_id: filters.value.language_id || undefined
            },
            search: filters.value.search || undefined,
            per_page: 100 // Load all topics
        })

        // Clear tests data since we'll load them dynamically
        testsByTopic.value.clear()
        loadingNodes.value.clear()
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('tests.states.error'),
            detail: t('tests.actions.deleteError'),
            life: 5000
        })
    } finally {
        generalStore.isLoading = false
    }
}

const onNodeExpand = async (node: any) => {
    // Only load tests for topic nodes
    if (node.data.type !== 'topic') return

    const topicKey = node.key
    const topicUid = node.data.uid
    const cacheKey = `${topicUid}-${filters.value.language_id}`

    // Skip if already loading or already loaded for current language
    if (loadingNodes.value.has(topicKey) || testsByTopic.value.has(cacheKey)) return

    // Mark as loading
    loadingNodes.value.add(topicKey)

    try {
        // Load tests for this specific topic with current language
        const params = {
            filters: {
                topic_uid: topicUid,
                language_id: filters.value.language_id || undefined
            },
            per_page: 1000 // Load all tests for this topic
        }
        
        const response = await testsStore.getTests(params)

        // Store tests in our Map with language-specific key
        testsByTopic.value.set(cacheKey, response.data.collection)
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: t('tests.states.error'),
            detail: 'Failed to load tests for topic',
            life: 5000
        })
    } finally {
        // Remove loading state
        loadingNodes.value.delete(topicKey)
    }
}

const expandNode = (node: any) => {
    if (node.children && node.children.length) {
        expandedKeys.value[node.key] = true
        node.children.forEach((child: any) => expandNode(child))
    }
}

// Utility methods
const getLanguageName = (languageId: string): string => {
    const language = languages.value.find(lang => lang.id === languageId)
    return language ? language.name : 'Unknown'
}

const getLanguageIdByCode = (code: string): string | undefined => {
    const language = languages.value.find(lang => lang.code === code)
    return language?.id
}

// Action methods
const getPrimaryActionLabel = (item: any): string => {
    if (loadingTestData.value && item.type === 'test') {
        return t('common.loading') || 'Loading...'
    }
    if (item.type === 'topic') {
        return t('tests.tree.editTopic')
    } else {
        return t('tests.tree.edit')
    }
}

const handlePrimaryAction = async (item: any) => {
    await editItem(item)
}

const getActionItems = (item: any) => {
    const actions = []

    // Add Test action for topics
    if (item.type === 'topic') {
        actions.push({
            label: t('tests.tree.addTest'),
            icon: 'pi pi-plus',
            command: () => addTest(item)
        })
    }

    // Edit action
    actions.push({
        label: item.type === 'topic' ? t('tests.tree.editTopic') : t('tests.tree.edit'),
        icon: 'pi pi-pencil',
        command: async () => await editItem(item)
    })

    // Separator before delete
    actions.push({
        separator: true
    })

    // Delete action
    actions.push({
        label: item.type === 'topic' ? t('tests.tree.deleteTopic') : t('tests.tree.delete'),
        icon: 'pi pi-trash',
        command: () => deleteItem(item),
        class: 'text-red-500'
    })

    return actions
}

const addTest = (topic: TopicResource) => {
    selectedTopicForTest.value = topic
    selectedTest.value = null
    isCreateTestMode.value = true
    testEditDialogVisible.value = true
}

const editItem = async (item: TopicResource | TestResource) => {
    const itemType = 'type' in item ? item.type : 'unknown'
    
    if (itemType === 'topic') {
        openEditTopicDialog(item as TopicResource)
    } else if (itemType === 'test') {
        await openEditTestDialog(item as TestResource)
    }
}

// Topic Dialog Methods
const openCreateTopicDialog = () => {
    selectedTopic.value = null
    isEditMode.value = false
    topicDialogVisible.value = true
}

const openEditTopicDialog = (topic: TopicResource) => {
    selectedTopic.value = topic
    isEditMode.value = true
    topicDialogVisible.value = true
}

// Test Dialog Methods
const openEditTestDialog = async (test: TestResource) => {
    // Показываем состояние загрузки
    loadingTestData.value = true
    
    try {
        // Загружаем полные данные теста из backend API
        const response = await testsApi.getSingleTest(test.id)
        
        // Устанавливаем загруженные данные
        selectedTest.value = response.data
        isCreateTestMode.value = false
        selectedTopicForTest.value = null
        
        // Открываем диалог после успешной загрузки
        testEditDialogVisible.value = true
        
    } catch (error) {
        console.error('Error loading test data:', error)
        toast.add({
            severity: 'error',
            summary: t('tests.states.error'),
            detail: t('tests.actions.loadError') || 'Failed to load test data',
            life: 5000
        })
        
        // В случае ошибки используем данные из дерева
        selectedTest.value = test
        isCreateTestMode.value = false
        selectedTopicForTest.value = null
        testEditDialogVisible.value = true
    } finally {
        loadingTestData.value = false
    }
}

const onTopicSaved = async () => {
    await loadData()
}

const onTestSaved = async () => {
    await loadData()
}

const deleteItem = (item: TopicResource | TestResource) => {
    const itemType = 'type' in item ? item.type : 'unknown'

    confirm.require({
        message: t('tests.actions.deleteConfirm'),
        header: t('tests.tree.delete'),
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                if (itemType === 'topic') {
                    await topicsStore.deleteTopic(item.id)
                } else if (itemType === 'test') {
                    await testsStore.deleteTest(item.id)
                }

                toast.add({
                    severity: 'success',
                    summary: t('tests.tree.delete'),
                    detail: `${itemType === 'topic' ? 'Topic' : 'Test'} deleted successfully`,
                    life: 3000
                })

                await loadData()
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: t('tests.states.error'),
                    detail: t('tests.actions.deleteError'),
                    life: 5000
                })
            }
        }
    })
}

// ==================== WATCHERS ====================
// Watch for language changes and update filters accordingly
watch(contentLanguageId, (newValue) => {
    let languageId = newValue
    
    // Если новое значение содержит дефис, это код - нужно конвертировать в ID
    if (languageId.includes('-')) {
        const convertedId = getLanguageIdByCode(languageId)
        if (convertedId) {
            languageId = convertedId
        }
    }
    
    // Проверяем, что язык существует в загруженных языках
    const languageExists = languages.value.find(lang => lang.id === languageId)
    if (languageExists && languageId !== filters.value.language_id) {
        // Clear tests cache when language changes
        testsByTopic.value.clear()
        filters.value.language_id = languageId
        loadData()
    }
})

// Watch for language list changes (when languages are loaded)
watch(languages, (newLanguages, oldLanguages) => {
    if (newLanguages.length > 0 && !filters.value.language_id) {
        let languageId = contentLanguageId.value
        
        // Если contentLanguageId содержит дефис, это код - нужно конвертировать в ID
        if (languageId.includes('-')) {
            const convertedId = getLanguageIdByCode(languageId)
            if (convertedId) {
                languageId = convertedId
            }
        }
        
        // Проверяем, что язык существует в загруженных языках
        let languageExists = newLanguages.find(lang => lang.id === languageId)
        
        // Try alternatives if not found
        if (!languageExists) {
            const alternatives = ['sr', 'sr-lat', 'sr-latn', 'serbian']
            for (const alt of alternatives) {
                const altLanguageId = getLanguageIdByCode(alt)
                if (altLanguageId) {
                    languageExists = newLanguages.find(lang => lang.id === altLanguageId)
                    if (languageExists) {
                        languageId = altLanguageId
                        break
                    }
                }
            }
        }

        // Use first available if still not found
        if (!languageExists && newLanguages.length > 0) {
            languageId = newLanguages[0].id
        }

        if (languageId) {
            filters.value.language_id = languageId
        }
    }
}, { immediate: true })

// ==================== LIFECYCLE ====================
onMounted(async () => {
    await initSettings()

    // First load languages to get proper language_id
    languages.value = await loadCachedLanguages()

    // Set correct language_id after languages are loaded
    // contentLanguageId может быть кодом или ID, поэтому нужно проверить
    let languageId = contentLanguageId.value
    
    // Если contentLanguageId содержит дефис, это код - нужно конвертировать в ID
    if (languageId.includes('-')) {
        languageId = getLanguageIdByCode(languageId) || languageId
    }
    
    // Если все еще не найден среди доступных языков, попробуем найти по коду
    const languageExists = languages.value.find(lang => lang.id === languageId)
    if (!languageExists) {
        // Если не найден, пробуем получить ID по коду
        const foundLanguageId = getLanguageIdByCode(contentLanguageId.value)
        if (foundLanguageId) {
            languageId = foundLanguageId
        } else {
            // Try some common alternatives
            const alternatives = ['sr', 'sr-lat', 'sr-latn', 'serbian']
            for (const alt of alternatives) {
                const altLanguageId = getLanguageIdByCode(alt)
                if (altLanguageId) {
                    languageId = altLanguageId
                    break
                }
            }
        }
    }

    // If still not found, use first available language
    if (!languageExists && !languages.value.find(lang => lang.id === languageId) && languages.value.length > 0) {
        languageId = languages.value[0].id
    }

    if (languageId) {
        filters.value.language_id = languageId
    }

    // Now load data with correct language_id
    await loadData()
})
</script>
