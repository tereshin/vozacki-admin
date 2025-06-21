<template>
  <Drawer :visible="generalStore.isMenuOpen" :modal="generalStore.isMobile" :dismissable="false" position="left" class="!w-64"
    @update:visible="generalStore.isMenuOpen = $event">
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
            <Button type="button" @click="generalStore.isMenuOpen = false" variant="outline" size="sm">
              <span name="i-heroicons-x-mark" class="w-4 h-4" />
            </Button>
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

        <!-- Sidebar Footer -->
        <div class="mt-auto px-4 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="w-4 h-4 text-gray-600 pi pi-user" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">{{ user?.email || 'User' }}</span>
                <span class="text-xs text-gray-500">Admin</span>
              </div>
            </div>
            <Button variant="text" size="small" @click="handleLogout" :loading="authStore.loading" icon="pi pi-sign-out" />
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
// Import interfaces/types
import type { NavigationItem, NavigationGroup } from "~/types/navigation";
import Drawer from 'primevue/drawer';

// Import components
import BaseNavigationGroup from "~/components/base/BaseNavigationGroup.vue";

// Import stores
import { useGeneralStore } from "~/store/general";
import { useAuthStore } from '~/store/auth';

// Stores
const generalStore = useGeneralStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Menu configuration
const menu = ref<NavigationGroup[]>([
  {
    name: "Dashboard",
    conditions: [],
    nav: [
      {
        name: "Dashboard",
        icon: "folder-plus",
        link: useRoutesNames().dashboard,
        conditions: [],
      },
    ],
  },
  {
    name: "Management",
    conditions: [],
    nav: [
      {
        name: "Articles",
        icon: "folder-plus",
        link: "/articles",
        conditions: [],
      },
      {
        name: "Topics",
        icon: "folder-plus",
        link: "/topics",
        conditions: [],
      },
    ],
  },
  {
    name: "Users",
    conditions: [],
    nav: [
      {
        name: "Administrators",
        icon: "folder-plus",
        link: "/administrators",
        conditions: [],
      },
    ],
  },
]);

// Collapsible groups state
const collapsedGroups = ref<Record<number, boolean>>({});

// Functions
function toggleGroup(groupIndex: number) {
  console.log('Toggling group:', groupIndex, 'Current state:', collapsedGroups.value[groupIndex]);
  collapsedGroups.value[groupIndex] = !collapsedGroups.value[groupIndex];
  console.log('New state:', collapsedGroups.value[groupIndex]);
  // Save to localStorage for persistence
  if (process.client) {
    localStorage.setItem('sidebar-collapsed-groups', JSON.stringify(collapsedGroups.value));
  }
}

function loadCollapsedState() {
  if (process.client) {
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
  console.log('Navigating to:', item.link);
  // Пока используем простой alert вместо навигации, так как страницы не созданы
  alert(`Переход на: ${item.name} (${item.link})`);

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

// Lifecycle hooks
onMounted(() => {
  generalStore.initMobileDetection();
  loadCollapsedState();
});

onUnmounted(() => {
  generalStore.destroyMobileDetection();
});
</script>