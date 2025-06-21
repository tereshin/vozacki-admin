<template>
    <div class="surface-ground min-h-screen">
        <!-- Header -->
        <TheHeader :title="$t('tests.title')" :items="breadcrumbItems">
            <template #actions>
                <Button @click="refreshData" :loading="isLoading" :label="$t('tests.actions.refresh')"
                    icon="pi pi-refresh" class="p-button-primary" />
            </template>
        </TheHeader>

        <div class="pt-2 p-4">
            <!-- Filters -->
            <BaseFilter :model-value="filters" :filter-fields="filterConfigs" @update:model-value="updateFilters"
                @apply="onFilterApply" @reset="onFilterReset" />

            <div class="flex flex-col gap-4">
                <!-- TreeTable -->
                <Card>
                    <template #content>
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex gap-2">
                                <Button :label="$t('tests.tree.expandAll')" size="small" severity="secondary"
                                    @click="expandAll" />
                                <Button :label="$t('tests.tree.collapseAll')" size="small" severity="secondary"
                                    @click="collapseAll" />
                            </div>
                        </div>
                        <TreeTable v-model:expandedKeys="expandedKeys" :value="treeData" :loading="isLoading"
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
                                        <div class="">
                                            <div class="font-medium text-900">{{ node.data.name }}</div>
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
    </div>
</template>

<script setup lang="ts">
// ==================== IMPORTS ====================
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useTopicsStore } from '~/store/topics'
import { useTestsStore } from '~/store/tests'
import { useLanguagesStore } from '~/store/languages'
import TheHeader from "~/components/TheHeader.vue"
import BaseFilter from "~/components/base/BaseFilter.vue"
import BaseIcon from "~/components/base/BaseIcon.vue"
import type { LanguageResource } from '~/types/languages'
import type { TopicResource } from '~/types/topics'
import type { TestResource } from '~/types/tests'
import type { FilterFieldConfig } from '~/types/filters'

// ==================== COMPOSABLES ====================
// I18n
const { t } = useI18n()

// PrimeVue composables
const confirm = useConfirm()
const toast = useToast()

// Stores
const topicsStore = useTopicsStore()
const testsStore = useTestsStore()
const languagesStore = useLanguagesStore()

// App settings
const { contentLanguageId, initSettings } = useAppSettings()

// ==================== REACTIVE STATE ====================
// Loading state
const isLoading = ref(false)
const expandedKeys = ref<{ [key: string]: boolean }>({})
const loadingNodes = ref<Set<string>>(new Set())

// Data
const languages = ref<LanguageResource[]>([])
const testsByTopic = ref<Map<string, TestResource[]>>(new Map())

// Filters
const filters = ref({
    search: '',
    language_id: ''
})

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
        label: t('tests.filters.search'),
        placeholder: t('tests.filters.searchPlaceholder'),
        width: 'w-full'
    },
    {
        key: 'language_id',
        type: 'select',
        label: t('tests.filters.language'),
        placeholder: t('tests.filters.allLanguages'),
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
        if (expandedKeys.value[topicKey] && testsByTopic.value.has(topic.uid)) {
            const topicTests = testsByTopic.value.get(topic.uid)!
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
    filters.value = { ...filters.value, ...newFilters }

    // Auto-reload data when language changes
    if ('language_id' in newFilters) {
        loadData()
    }
}

const onFilterApply = () => {
    loadData()
}

const onFilterReset = () => {
    filters.value = {
        search: '',
        language_id: getLanguageIdByCode(contentLanguageId.value) || ''
    }
    loadData()
}

// Data loading methods
const loadData = async () => {
    isLoading.value = true
    try {
        // Only load languages if not already loaded
        if (languages.value.length === 0) {
            await languagesStore.getLanguages()
            languages.value = languagesStore.items
        }

        // Load only topics initially - tests will be loaded dynamically
        await topicsStore.getTopics({
            language_id: filters.value.language_id || undefined,
            search: filters.value.search || undefined,
            per_page: 100 // Load all topics
        })

        // Clear tests data since we'll load them dynamically
        testsByTopic.value.clear()
        loadingNodes.value.clear()
    } catch (error) {
        console.error('Error loading data:', error)
        toast.add({
            severity: 'error',
            summary: t('tests.states.error'),
            detail: t('tests.actions.deleteError'),
            life: 5000
        })
    } finally {
        isLoading.value = false
    }
}

const onNodeExpand = async (node: any) => {
    console.log('Node expand:', node)

    // Only load tests for topic nodes
    if (node.data.type !== 'topic') return

    const topicKey = node.key
    const topicUid = node.data.uid

    // Skip if already loading or already loaded
    if (loadingNodes.value.has(topicKey) || testsByTopic.value.has(topicUid)) return

    // Mark as loading
    loadingNodes.value.add(topicKey)

    try {
        // Load tests for this specific topic
        const response = await testsStore.getTests({
            topic_uid: topicUid,
            language_id: filters.value.language_id || undefined,
            per_page: 1000 // Load all tests for this topic
        })

        // Store tests in our Map
        testsByTopic.value.set(topicUid, response.data.collection)

        console.log('Loaded tests for topic:', topicUid, 'count:', response.data.collection.length)
    } catch (error) {
        console.error('Error loading tests for topic:', error)
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

const refreshData = () => {
    loadData()
}

// Tree methods
const expandAll = () => {
    expandedKeys.value = {}
    treeData.value.forEach(node => {
        expandNode(node)
    })
}

const collapseAll = () => {
    expandedKeys.value = {}
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
    console.log('getLanguageIdByCode called with:', code)
    console.log('Available languages:', languages.value.map(l => l.code))
    const language = languages.value.find(lang => lang.code === code)
    console.log('Found language:', language)
    return language?.id
}

// Action methods
const getPrimaryActionLabel = (item: any): string => {
    if (item.type === 'topic') {
        return t('tests.tree.editTopic')
    } else {
        return t('tests.tree.edit')
    }
}

const handlePrimaryAction = (item: any) => {
    editItem(item)
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
        command: () => editItem(item)
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
    // TODO: Implement add test functionality
    console.log('Add test for topic:', topic)
}

const editItem = (item: TopicResource | TestResource) => {
    // TODO: Implement edit functionality
    console.log('Edit item:', item)
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
                console.error('Error deleting item:', error)
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
watch(contentLanguageId, (newCode) => {
    const languageId = getLanguageIdByCode(newCode)
    if (languageId && languageId !== filters.value.language_id) {
        filters.value.language_id = languageId
        loadData()
    }
})

// Watch for language list changes (when languages are loaded)
watch(languages, (newLanguages, oldLanguages) => {
    console.log('Languages watch triggered, new length:', newLanguages.length, 'old length:', oldLanguages?.length)
    console.log('Current filters.language_id:', filters.value.language_id)

    if (newLanguages.length > 0 && !filters.value.language_id) {
        let languageId = getLanguageIdByCode(contentLanguageId.value)
        console.log('Setting language from code:', contentLanguageId.value, 'to ID:', languageId)

        // Try alternatives if not found
        if (!languageId) {
            const alternatives = ['sr', 'sr-lat', 'sr-latn', 'serbian']
            for (const alt of alternatives) {
                languageId = getLanguageIdByCode(alt)
                if (languageId) {
                    console.log('Found language with alternative code:', alt, '->', languageId)
                    break
                }
            }
        }

        // Use first available if still not found
        if (!languageId && newLanguages.length > 0) {
            languageId = newLanguages[0].id
            console.log('Using first available language:', languageId)
        }

        if (languageId) {
            filters.value.language_id = languageId
            console.log('Successfully set filters.language_id to:', languageId)
        } else {
            console.warn('Could not find any suitable language')
        }
    }
}, { immediate: true })

// Debug watch for filter changes
watch(filters, (newFilters) => {
    console.log('Filters changed:', newFilters)
}, { deep: true })

// ==================== LIFECYCLE ====================
onMounted(async () => {
    console.log('=== TestsIndexPage onMounted ===')

    await initSettings()
    console.log('Settings initialized, contentLanguageId:', contentLanguageId.value)

    // First load languages to get proper language_id
    await languagesStore.getLanguages()
    languages.value = languagesStore.items
    console.log('Languages loaded:', languages.value.map(l => ({ id: l.id, code: l.code, name: l.name })))

    // Set correct language_id after languages are loaded
    let languageId = getLanguageIdByCode(contentLanguageId.value)
    console.log('Language ID for code', contentLanguageId.value, ':', languageId)

    // If not found, try some common alternatives
    if (!languageId) {
        console.log('Trying alternative language codes...')
        const alternatives = ['sr', 'sr-lat', 'sr-latn', 'serbian']
        for (const alt of alternatives) {
            languageId = getLanguageIdByCode(alt)
            if (languageId) {
                console.log('Found language with alternative code:', alt, '->', languageId)
                break
            }
        }
    }

    // If still not found, use first available language
    if (!languageId && languages.value.length > 0) {
        languageId = languages.value[0].id
        console.log('Using first available language:', languageId)
    }

    if (languageId) {
        filters.value.language_id = languageId
        console.log('Set filters.language_id to:', languageId)
    } else {
        console.warn('Could not find any suitable language ID')
    }

    console.log('Final filters before loadData:', filters.value)

    // Now load data with correct language_id
    await loadData()
})
</script>
