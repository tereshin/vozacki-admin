<template>
  <div class="surface-ground min-h-screen">
    <!-- Header -->
    <TheHeader :title="isEditMode ? $t('articles.edit.title') : $t('articles.create.title')" :hideBreadcrumb="false"
      :items="breadcrumbItems">
      <template #header-actions>
        <div class="flex gap-2">
          <Button @click="saveAsDraft" :loading="generalStore.isLoading" :label="$t('articles.actions.saveAsDraft')"
            icon="pi pi-save" size="small" severity="secondary" />
          <Button @click="publishArticle" :loading="generalStore.isLoading" :label="$t('articles.actions.publish')"
            size="small" />
        </div>
      </template>
    </TheHeader>

    <!-- Main content -->
    <div class="pt-2 p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Main form -->
        <div class="w-full">
          <Card>
            <template #content>
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Title -->
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('articles.form.title') }} <span class="text-red-500">*</span>
                  </label>
                  <InputText id="title" v-model="form.title" class="w-full" :class="{ 'p-invalid': formErrors.title }"
                    :placeholder="$t('articles.form.titlePlaceholder')" required />
                  <small v-if="formErrors.title" class="text-red-600 text-sm mt-1">
                    {{ formErrors.title }}
                  </small>
                </div>

                <!-- Slug -->
                <div>
                  <label for="slug" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('articles.form.slug') }} <span class="text-red-500">*</span>
                  </label>
                  <InputText id="slug" v-model="form.slug" class="w-full" :class="{ 'p-invalid': formErrors.slug }"
                    :placeholder="$t('articles.form.slugPlaceholder')" required />
                  <small v-if="formErrors.slug" class="text-red-600 text-sm mt-1">
                    {{ formErrors.slug }}
                  </small>
                </div>

                <!-- Content Editor -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('articles.form.content') }} <span class="text-red-500">*</span>
                  </label>
                  <BaseEditorJS v-model="form.content" :placeholder="$t('articles.form.contentPlaceholder')"
                    :min-height="400" @change="onContentChange" />
                  <small v-if="formErrors.content" class="text-red-600 text-sm mt-1">
                    {{ formErrors.content }}
                  </small>
                </div>
              </form>
            </template>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="w-1/3">
          <!-- Article Settings -->
          <Card class="mb-4">
            <template #title>
              <div class="text-base mb-2">
                {{ $t('articles.form.settings') }}
              </div>
            </template>
            <template #content>
              <div class="space-y-4">
                <!-- Language -->
                <div>
                  <label for="language_id" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('articles.form.language') }} <span class="text-red-500">*</span>
                  </label>
                  <Dropdown id="language_id" v-model="form.language_id" :options="languages" option-label="name"
                    option-value="id" class="w-full" :class="{ 'p-invalid': formErrors.language_id }"
                    :placeholder="$t('articles.form.selectLanguage')" :loading="languagesLoading" required />
                  <small v-if="formErrors.language_id" class="text-red-600 text-sm mt-1">
                    {{ formErrors.language_id }}
                  </small>
                </div>

                <!-- Category -->
                <div>
                  <label for="category_uid" class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('articles.form.category') }}
                  </label>
                  <Dropdown id="category_uid" filter v-model="form.category_uid" :options="categories"
                    option-label="name" option-value="uid" class="w-full"
                    :class="{ 'p-invalid': formErrors.category_uid }" :placeholder="$t('articles.form.selectCategory')"
                    :loading="categoriesLoading" :show-clear="true" />
                  <small v-if="formErrors.category_uid" class="text-red-600 text-sm mt-1">
                    {{ formErrors.category_uid }}
                  </small>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    {{ $t('articles.form.status') }}
                  </label>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center">
                      <RadioButton v-model="formStatus" value="draft" :input-id="'status-draft'" />
                      <label :for="'status-draft'" class="ml-2 text-sm text-gray-700">
                        {{ $t('articles.form.draft') }}
                      </label>
                    </div>
                    <div class="flex items-center">
                      <RadioButton v-model="formStatus" value="published" :input-id="'status-published'" />
                      <label :for="'status-published'" class="ml-2 text-sm text-gray-700">
                        {{ $t('articles.form.published') }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Article Preview -->
          <Card v-if="formStatus === 'published'">
            <template #title>
              <div class="text-base mb-2">
                {{ $t('articles.form.preview') }}
              </div>
            </template>
            <template #content>
              <div class="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>{{ $t('articles.form.title') }}:</strong> {{ form.title || $t('articles.form.noTitle') }}
                </div>
                <div>
                  <strong>{{ $t('articles.form.slug') }}:</strong> {{ form.slug || $t('articles.form.noSlug') }}
                </div>
                <div>
                  <strong>{{ $t('articles.form.language') }}:</strong> {{ getLanguageName(form.language_id) }}
                </div>
                <div>
                  <strong>{{ $t('articles.form.category') }}:</strong> {{ getCategoryName(form.category_uid) }}
                </div>
                <div>
                  <strong>{{ $t('articles.form.blocks') }}:</strong> {{ contentBlocksCount }}
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
// Import interfaces/types
import type { LanguageResource } from '~/types/languages'
import type { CategoryResource } from '~/types/categories'
import type { ArticleRequest, EditorJSData } from '~/types/articles'

// Import stores
import { useArticlesStore } from '~/store/articles'
import { useCategoriesStore } from '~/store/categories'
import { useGeneralStore } from '~/store/general'

// I18n
const { t } = useI18n()

// PrimeVue composables
const toast = useToast()

// Router
const route = useRoute()

// Stores
const articlesStore = useArticlesStore()
const categoriesStore = useCategoriesStore()
const generalStore = useGeneralStore()

// App settings
const { contentLanguageId, initSettings } = useAppSettings()

// Utils composables
const { getLanguageName: getLanguageNameUtil, getCategoryName: getCategoryNameUtil } = useGetEntityName()

// Variables and reactive data
const form = ref<ArticleRequest>({
  id: crypto.randomUUID(),
  title: '',
  slug: '',
  content: { blocks: [] } as EditorJSData,
  language_id: '',
  category_uid: null,
  uid: crypto.randomUUID()
})

const formStatus = ref<'draft' | 'published'>('draft')
const formErrors = ref<Record<string, string>>({})
const languagesLoading = ref(false)
const categoriesLoading = ref(false)

const { loadLanguages: loadCachedLanguages } = useCachedLanguages()
const languages = ref<LanguageResource[]>([])
const categories = ref<CategoryResource[]>([])

// Computed properties
const isEditMode = computed(() => route.params.id !== 'create')

const articleId = computed(() => isEditMode.value ? route.params.id as string : null)

const breadcrumbItems = computed(() => [
  {
    label: t('articles.title'),
    to: '/articles'
  },
  {
    label: isEditMode.value ? t('articles.edit.title') : t('articles.create.title'),
    to: route.path
  }
])

const contentBlocksCount = computed(() => {
  try {
    return form.value.content?.blocks?.length ?? 0
  } catch {
    return 0
  }
})

// Functions
const loadInitialData = async () => {
  try {
    generalStore.isLoading = true

    // Initialize app settings
    initSettings()

    // Load languages
    const languagesData = await loadCachedLanguages()
    languages.value = languagesData

    // Auto-select language from settings if not selected
    if (!form.value.language_id && contentLanguageId.value) {
      const languageExists = languages.value.find(l => l.id === contentLanguageId.value)
      if (languageExists) {
        form.value.language_id = contentLanguageId.value
      }
    }

    // Load article data if editing
    if (isEditMode.value && articleId.value) {
      await loadArticle(articleId.value)
    }

    // Load categories for selected language
    await loadCategoriesForLanguage(form.value.language_id)
  } catch (error: any) {
    console.error('Error loading initial data:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Failed to load initial data',
      life: 5000
    })
  } finally {
    generalStore.isLoading = false
  }
}

const loadCategoriesForLanguage = async (languageId: string | null) => {
  if (!languageId) {
    categories.value = []
    return
  }

  try {
    categoriesLoading.value = true
    const categoriesResponse = await categoriesStore.getCategories({
      per_page: 100,
      language_id: languageId
    })
    categories.value = categoriesResponse.data.collection
  } catch (error: any) {
    console.error('Error loading categories:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Failed to load categories',
      life: 5000
    })
  } finally {
    categoriesLoading.value = false
  }
}

const loadArticle = async (id: string) => {
  try {
    const article = await articlesStore.getSingleArticle(id)

    form.value = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content as EditorJSData,
      language_id: article.language_id,
      category_uid: article.category_uid,
      uid: article.uid
    }

    formStatus.value = article.published_at ? 'published' : 'draft'
  } catch (error: any) {
    console.error('Error loading article:', error)
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || 'Failed to load article',
      life: 5000
    })
  }
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.title?.trim()) {
    formErrors.value.title = t('articles.validation.titleRequired')
  }

  if (!form.value.slug?.trim()) {
    formErrors.value.slug = t('articles.validation.slugRequired')
  } else if (!/^[a-z0-9-]+$/.test(form.value.slug)) {
    formErrors.value.slug = t('articles.validation.slugInvalid')
  }

  if (!form.value.language_id) {
    formErrors.value.language_id = t('articles.validation.languageRequired')
  }

  if (!form.value.content?.blocks?.length) {
    formErrors.value.content = t('articles.validation.contentRequired')
  }

  return Object.keys(formErrors.value).length === 0
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const onContentChange = (content: EditorJSData) => {
  form.value.content = content
}

const saveAsDraft = async () => {
  formStatus.value = 'draft'
  await handleSubmit()
}

const publishArticle = async () => {
  formStatus.value = 'published'
  await handleSubmit()
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    generalStore.isLoading = true

    const articleData = {
      title: form.value.title,
      slug: form.value.slug,
      content: form.value.content,
      language_id: form.value.language_id,
      category_uid: form.value.category_uid,
      published_at: formStatus.value === 'published' ? new Date().toISOString() : null
    }

    if (isEditMode.value && articleId.value) {
      await articlesStore.updateArticle(articleId.value, articleData)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('articles.messages.updated'),
        life: 3000
      })
    } else {
      await articlesStore.createArticle({
        ...articleData,
        id: form.value.id,
        uid: form.value.uid
      })
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('articles.messages.created'),
        life: 3000
      })

      // Redirect to edit page after successful creation
      await navigateTo(`/articles/${form.value.id}`)
    }

  } catch (error: any) {
    console.error('Error saving article:', error)

    if (error.details) {
      formErrors.value = error.details
    }
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('articles.messages.error'),
      life: 5000
    })

  } finally {
    generalStore.isLoading = false
  }
}

const getLanguageName = (languageId: string | null | undefined): string => {
  return getLanguageNameUtil(languages.value, languageId || '', t('articles.form.noLanguage'))
}

const getCategoryName = (categoryUid: string | null | undefined): string => {
  return getCategoryNameUtil(categories.value, categoryUid, t('articles.form.noCategory'))
}

// Watchers
watch(() => form.value.title, (newTitle) => {
  if (newTitle && !form.value.slug) {
    form.value.slug = generateSlug(newTitle)
  }
})

watch(() => form.value.language_id, async (newLanguageId, oldLanguageId) => {
  // Only reload categories if language actually changed and it's not the initial load
  if (newLanguageId !== oldLanguageId && oldLanguageId !== undefined) {
    // Clear current category selection since it might not exist in new language
    form.value.category_uid = null

    // Load categories for new language
    await loadCategoriesForLanguage(newLanguageId)
  }
})

// Lifecycle hooks
onMounted(async () => {
  // Load initial data - permissions will be checked by middleware
  await loadInitialData()
})
</script>