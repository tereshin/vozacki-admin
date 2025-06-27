<template>
  <Drawer :visible="generalStore.isMenuOpen" :modal="generalStore.isMobile" :dismissable="false" position="left"
    class="!w-64" @update:visible="generalStore.isMenuOpen = $event">
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full bg-white">
        <!-- Sidebar header -->
        <div class="flex items-center justify-between px-3 pt-5 pb-12 shrink-0">
          <span class="inline-flex items-center gap-4">
            <!-- Logo -->
            <div class="mx-auto w-10 h-10 shadow-sm rounded-xl flex items-center justify-center">
              <img src="https://autokurs.tereshin.co/favicon/apple-touch-icon.png" alt="logo" class="w-full rounded-xl">
            </div>
          </span>
          <span class="lg:hidden">
            <Button type="button" @click="generalStore.isMenuOpen = false" variant="link" size="small" severity="secondary" icon="pi pi-times" class="!text-gray-500" />
          </span>
        </div>

        <!-- Sidebar content -->
        <div class="overflow-y-auto flex-grow">
          <!-- Navigation Groups -->
          <nav class="px-2 pb-6">
            <BaseNavigationGroup v-for="(group, groupKey) in menu" :key="groupKey" :group="group" :group-key="groupKey"
              :is-collapsed="collapsedGroups[groupKey]" @toggle="toggleGroup" @item-click="goTo" />
          </nav>
        </div>

        <!-- Content Language Selector -->
        <div class="px-4 py-3 border-t border-gray-200">
          <div class="flex flex-col space-y-2">
            <label class="text-xs font-medium text-gray-700">{{ $t('sidebar.contentLanguage') }}</label>
            <Select 
              v-model="contentLanguageId" 
              :options="availableLanguages" 
              option-label="name"
              option-value="id" 
              :placeholder="$t('sidebar.selectLanguage')" 
              class="w-full text-sm"
              size="small"
              @change="onLanguageChange"
            />
          </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="px-4 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="w-4 h-4 text-gray-600 pi pi-user" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">{{ user?.email || 'User' }}</span>
                <span class="text-xs text-gray-500">{{ currentRoleName || 'Admin' }}</span>
              </div>
            </div>
            <Button variant="text" size="small" @click="handleLogout" :loading="authStore.loading"
              icon="pi pi-sign-out" />
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
// Import interfaces/types
import type { NavigationItem, NavigationGroup } from "~/types/navigation";
import type { LanguageResource } from "~/types/languages";
// Import stores
import { useGeneralStore } from "~/store/general";
import { useAuthStore } from '~/store/auth';

// Stores
const generalStore = useGeneralStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Permissions
const { canAccessAdministrators, canManageContent, canViewTests, currentRoleName } = usePermissions();

// App settings
const { contentLanguageId, initSettings } = useAppSettings();

// Languages from cache
const { loadActiveLanguages } = useCachedLanguages();
const availableLanguages = ref<LanguageResource[]>([]);

// Menu configuration
const menu = computed<NavigationGroup[]>(() => {
  const menuItems: NavigationGroup[] = [
    {
      name: "Dashboard",
      conditions: [],
      nav: [
        {
          name: "Dashboard",
          icon: "sidebar-open",
          link: useRoutesNames().dashboard,
          conditions: [],
        },
      ],
    },
  ];

  // Добавляем раздел Management только если есть права на управление контентом
  if (canViewTests.value) {
    menuItems.push({
      name: "Knowledge base",
      conditions: [],
      nav: [
        {
          name: "Articles",
          icon: "folder-plus",
          link: useRoutesNames().articles,
          conditions: [],
        },
        {
          name: "Categories",
          icon: "folder",
          link: useRoutesNames().categories,
          conditions: [],
        }
      ],
    });
    menuItems.push({
      name: "Materials",
      conditions: [],
      nav: [
        {
          name: "Topics",
          icon: "folder-plus",
          link: useRoutesNames().tests,
          conditions: [],
        },
      ],
    });
  }

  // Добавляем раздел Users только если есть права на доступ к администраторам
  if (canAccessAdministrators.value) {
    menuItems.push({
      name: "Users",
      conditions: [],
      nav: [
        {
          name: "Administrators",
          icon: "folder-plus",
          link: useRoutesNames().administrators,
          conditions: [],
        },
        {
          name: "Roles",
          icon: "user-square",
          link: useRoutesNames().roles,
          conditions: [],
        },
      ],
    });
  }

  return menuItems;
});

// Collapsible groups state
const collapsedGroups = ref<Record<number, boolean>>({});
const router = useRouter();
// Functions
function toggleGroup(groupIndex: number) {
  console.log('Toggling group:', groupIndex, 'Current state:', collapsedGroups.value[groupIndex]);
  collapsedGroups.value[groupIndex] = !collapsedGroups.value[groupIndex];
  console.log('New state:', collapsedGroups.value[groupIndex]);
  // Save to localStorage for persistence
  if (import.meta.client) {
    localStorage.setItem('sidebar-collapsed-groups', JSON.stringify(collapsedGroups.value));
  }
}

function loadCollapsedState() {
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem('sidebar-collapsed-groups');
      if (saved) {
        collapsedGroups.value = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load collapsed groups state:', error);
    }
  }
}

function goTo(item: NavigationItem) {
  navigateTo(router.resolve({ name: item.link }).href);
  if (generalStore.isMobile) {
    generalStore.isMenuOpen = false;
  }
}

// Methods
async function handleLogout() {
  try {
    await authStore.logout();
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  }
}

function onLanguageChange() {
  // Язык автоматически сохраняется через contentLanguageId computed свойство
  console.log('Content language changed to:', contentLanguageId.value);
}

async function loadLanguages() {
  try {
    // Инициализируем кэш если он еще не инициализирован
    const { initializeCache } = useCacheManager()
    await initializeCache()
    
    availableLanguages.value = await loadActiveLanguages();
  } catch (error) {
    console.error('Failed to load languages from cache:', error);
  }
}

// Lifecycle hooks
onMounted(async () => {
  generalStore.initMobileDetection();
  loadCollapsedState();
  
  // Инициализируем настройки приложения
  initSettings();
  
  // Загружаем доступные языки из кэша
  await loadLanguages();
});

onUnmounted(() => {
  generalStore.destroyMobileDetection();
});
</script>