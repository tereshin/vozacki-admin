<template>
    <div>
        <!-- Header -->
        <TheHeader 
            :title="$t('dashboard.title')"
            :hideBreadcrumb="true"
            :items="breadcrumbItems"
        >
            <template #actions>
                <!-- Дополнительные действия можно добавить здесь -->
            </template>
        </TheHeader>

        <!-- Main Content -->
        <div class="flex flex-col gap-4">
            <!-- Loading state -->
            <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                <Card v-for="i in 4" :key="i" class="animate-pulse">
                    <template #content>
                        <div>
                            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="p-6">
                <Card class="bg-red-50 border border-red-200">
                    <template #content>
                        <div>
                            <h3 class="text-red-800 font-medium mb-2">{{ $t('dashboard.errors.loadingStats') }}</h3>
                            <p class="text-red-600 text-sm">{{ error.message }}</p>
                            <Button 
                                @click="refresh()" 
                                severity="danger"
                                size="small"
                                class="mt-4"
                            >
                                {{ $t('dashboard.actions.tryAgain') }}
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Stats Dashboard -->
            <div v-else class="p-6">
                <!-- Stats cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Articles card -->
                    <Card class="hover:shadow-lg transition-shadow duration-300 cursor-pointer" @click="navigateTo('/articles')">
                        <template #content>
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600 mb-2">{{ $t('dashboard.stats.articles') }}</p>
                                        <p class="text-3xl font-bold text-gray-900">{{ stats?.articles_count || 0 }}</p>
                                    </div>
                                    <div class="p-3 bg-blue-100 rounded-full">
                                        <BaseIcon name="folder" class="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <NuxtLink 
                                        to="/articles" 
                                        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {{ $t('dashboard.actions.goToArticles') }} →
                                    </NuxtLink>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Topics card -->
                    <Card class="hover:shadow-lg transition-shadow duration-300">
                        <template #content>
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600 mb-2">{{ $t('dashboard.stats.topics') }}</p>
                                        <p class="text-3xl font-bold text-gray-900">{{ stats?.topics_count || 0 }}</p>
                                    </div>
                                    <div class="p-3 bg-green-100 rounded-full">
                                        <BaseIcon name="folder-plus" class="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <span class="text-sm text-gray-500">
                                        {{ $t('dashboard.actions.topicsDescription') }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Tests card -->
                    <Card class="hover:shadow-lg transition-shadow duration-300 cursor-pointer" @click="navigateTo('/tests')">
                        <template #content>
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600 mb-2">{{ $t('dashboard.stats.tests') }}</p>
                                        <p class="text-3xl font-bold text-gray-900">{{ stats?.tests_count || 0 }}</p>
                                    </div>
                                    <div class="p-3 bg-purple-100 rounded-full">
                                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <NuxtLink 
                                        to="/tests" 
                                        class="text-sm text-purple-600 hover:text-purple-800 font-medium"
                                    >
                                        {{ $t('dashboard.actions.goToTests') }} →
                                    </NuxtLink>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Administrators card -->
                    <Card class="hover:shadow-lg transition-shadow duration-300 cursor-pointer" @click="navigateTo('/administrators')">
                        <template #content>
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600 mb-2">{{ $t('dashboard.stats.administrators') }}</p>
                                        <p class="text-3xl font-bold text-gray-900">{{ stats?.administrators_count || 0 }}</p>
                                    </div>
                                    <div class="p-3 bg-orange-100 rounded-full">
                                        <BaseIcon name="user-square" class="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <div>
                                    <NuxtLink 
                                        to="/administrators" 
                                        class="text-sm text-orange-600 hover:text-orange-800 font-medium"
                                    >
                                        {{ $t('dashboard.actions.goToAdministrators') }} →
                                    </NuxtLink>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Current language info -->
                <Card>
                    <template #header>
                        <div class="p-4 pb-0">
                            <h3 class="font-medium text-gray-900">{{ $t('dashboard.currentLanguage.title') }}</h3>
                        </div>
                    </template>
                    <template #content>
                        <div>
                            <div class="flex items-center space-x-3">
                                <div class="p-2 bg-blue-100 rounded">
                                    <BaseIcon name="flag" class="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900">{{ contentLanguageId }}</p>
                                    <p class="text-sm text-gray-500">{{ $t('dashboard.currentLanguage.description') }}</p>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 3. Import TypeScript interfaces and types
import type { DashboardStats } from '~/composables/api/useDashboardApi'

// 9. Declare variables and reactive data
const breadcrumbItems = ref([
    {
        label: "Dashboard",
        to: "/dashboard"
    }
])

// App settings для получения текущего языка
const { contentLanguageId, initSettings } = useAppSettings()

// API для получения статистики
const { getDashboardStats } = useDashboardApi()

// Реактивная загрузка статистики при изменении языка
const { data: stats, pending, error, refresh } = await useLazyAsyncData<DashboardStats>(
    'dashboard-stats',
    () => getDashboardStats(contentLanguageId.value),
    {
        // Перезагружать при изменении языка
        watch: [contentLanguageId]
    }
)

// 14. Lifecycle hooks — ВСЕГДА в самом конце
onMounted(() => {
    initSettings()
})
</script>
