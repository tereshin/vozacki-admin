<template>
  <div class="flex flex-col w-full p-4">
    <div class="flex justify-between items-center w-full">
      <div :class="generalStore.isMobile ? 'flex gap-1 items-center' : 'flex gap-1 items-start'">
        <button v-ripple
          class="p-3 rounded-full cursor-pointer hover:bg-gray-100 flex duration-150 lg:ml-0 -ml-3 text-slate-500 hover:text-slate-700 hover:text-slate-700"
          aria-label="Menu" @click="generalStore.isMenuOpen = !generalStore.isMenuOpen">
          <BaseIcon name="menu" class="w-6 h-6 text-inherit" />
        </button>
        <div class="flex flex-col gap-0.5">
          <div v-if="title"
            class="lg:text-xl font-semibold lg:pt-2 whitespace-nowrap max-w-[200px] lg:max-w-[700px] overflow-hidden text-ellipsis">
            {{ title }}</div>
          <!-- Breadcrumbs -->
          <BaseBreadcrumb v-if="!hideBreadcrumb && !generalStore.isMobile" :items="items" />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Components Area -->
        <component v-if="componentsArea" :is="componentsArea" />

        <!-- Header actions near avatar -->
        <slot name="header-actions" />

        <!-- Avatar -->
        <Avatar :label="userData?.full_name?.slice(0, 1)" class="cursor-pointer !w-[33px] !h-[33px]" shape="circle"
          @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" v-ripple />

        <!-- Avatar menu -->
        <Menu :model="avatarItems" class="w-full md:w-60 !border-gray-100 !rounded-2xl" ref="avatarMenu"
          id="overlay_menu" :popup="true">
          <template #item="{ item, props }">
            <p v-ripple class="flex items-center" v-bind="props.action" @click="avatarItemsHeandler(item)">
              <span :class="item.icon" />
              <span>{{ item.label }}</span>
            </p>
          </template>
        </Menu>
      </div>
    </div>
    <div>
      <!-- Breadcrumbs -->
      <BaseBreadcrumb v-if="!hideBreadcrumb && generalStore.isMobile" :items="items" />
    </div>
  </div>
</template>

<script setup lang="ts">
// ==================== INTERFACES/TYPES ====================
import { useGeneralStore } from "@/store/general";
import { useAuthStore } from "@/store/auth";
import { useLanguage } from "@/composables/core/i18n/useLanguage";
import type { MenuItem } from "primevue/menuitem";

interface Props {
  hideBreadcrumb?: boolean;
  items: {
    label: string;
    to?: string;
    icon?: string;
  }[];
  title?: string;
  componentsArea?: Component;
}

// ==================== STORES ====================
const generalStore = useGeneralStore();
const authStore = useAuthStore();
const { userData } = useUserData();
const { currentLanguage, changeLanguage, availableLanguages, getLanguageName, getLanguageFlag } = useLanguage();

// ==================== PROPS ====================
const props = withDefaults(defineProps<Props>(), {
  hideBreadcrumb: false,
});

// ==================== REACTIVE DATA ====================
const avatarMenu = ref();
const avatarItems = ref([
  {
    label: "Language",
    items: availableLanguages.map(lang => ({
      label: lang.localName,
      icon: "pi pi-globe",
      data: lang.code,
      disabled: currentLanguage.value === lang.code
    }))
  },
  {
    separator: true
  },
  {
    items: [
      {
        label: "Logout",
        icon: "pi pi-sign-out",
      },
    ],
  },
]);

// ==================== METHODS ====================
function toggle(event: Event) {
  avatarMenu.value.toggle(event);
}

async function avatarItemsHeandler(item: MenuItem) {
  // Обработка смены языка
  if (item.data && availableLanguages.some(lang => lang.code === item.data)) {
    await changeLanguage(item.data);
    // Обновляем меню после смены языка
    updateAvatarItems();
    return;
  }

  switch (item.label) {
    case "Profile":
      navigateTo({ name: useRoutesNames().dashboard });
      return;

    case "Logout":
      logout();
      return;
  }
}

function updateAvatarItems() {
  avatarItems.value = [
    {
      label: "Language",
      items: availableLanguages.map(lang => ({
        label: lang.localName,
        icon: "pi pi-globe",
        data: lang.code,
        disabled: currentLanguage.value === lang.code
      }))
    },
    {
      separator: true
    },
    {
      items: [
        {
          label: "Logout",
          icon: "pi pi-sign-out",
        },
      ],
    },
  ];
}

async function logout() {
  try {
    await authStore.logout();
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}
</script>