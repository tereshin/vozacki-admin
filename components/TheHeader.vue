<template>
    <div class="flex flex-col w-full p-4">
      <div class="flex justify-between items-start w-full">
        <div :class="generalStore.isMobile ? 'flex gap-1 items-center' : 'flex gap-1 items-start'">
          <button v-ripple class="p-3 rounded-full cursor-pointer hover:bg-gray-100 flex duration-150 lg:ml-0 -ml-3 text-slate-500 hover:text-slate-700 hover:text-slate-700" aria-label="Menu" @click="generalStore.isMenuOpen = !generalStore.isMenuOpen">
            <BaseIcon v-if="!generalStore.isMenuOpen" name="sidebar-open" class="w-6 h-6 text-inherit" />
            <BaseIcon v-else name="sidebar-close" class="w-6 h-6 text-inherit" />
          </button>
          <div class="flex flex-col gap-0.5">
            <div v-if="title" class="lg:text-xl font-semibold lg:pt-2">{{ title }}</div>
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
          <Avatar :label="authStore.user?.email?.slice(0, 1)" class="cursor-pointer !w-[33px] !h-[33px]"
            shape="circle" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" v-ripple />
  
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
  import { useGeneralStore } from "@/store/general";
  import { useAuthStore } from "@/store/auth";
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
  
  const props = withDefaults(defineProps<Props>(), {
    hideBreadcrumb: false,
  });
  
  // Stores
  const generalStore = useGeneralStore();
  const authStore = useAuthStore();
  
  // Avatar menu
  const avatarMenu = ref();
  const avatarItems = ref([
    {
      items: [
        //For future
        //   {
        //     label: "Profile",
        //     icon: "pi pi-user",
        //   },
        {
          label: "Logout",
          icon: "pi pi-sign-out",
        },
      ],
    },
  ]);
  
  function toggle(event: Event) {
    avatarMenu.value.toggle(event);
  }
  
  function avatarItemsHeandler(item: MenuItem) {
    switch (item.label) {
      case "Profile":
        navigateTo({ name: useRoutesNames().dashboard });
        return;
  
      case "Logout":
        logout();
        return;
    }
  }
  
  async function logout() {
    try {
      await authStore.logout();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }
  </script>