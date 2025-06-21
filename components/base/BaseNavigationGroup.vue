<template>
  <div class="mb-6">
    <!-- Group Label -->
    <div
      v-if="
        group.name &&
        (group.conditions?.every((i: any) => i === true) ||
          !group.conditions?.length)
      "
      @click="handleToggle"
      class="mb-2.5 px-1.5 nav-group-header p-ripple cursor-pointer"
      v-ripple
      v-styleclass="{
        selector: '@next',
        enterFromClass: 'hidden',
        enterActiveClass: 'animate-slidedown',
        leaveToClass: 'hidden',
        leaveActiveClass: 'animate-slideup',
      }"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {{ group.name }}
        </span>
        <i 
          :class="[
            'pi nav-group-chevron !text-[12px] text-gray-400',
            isCollapsed ? 'pi-chevron-up' : 'pi-chevron-down'
          ]"
        ></i>
      </div>
    </div>

    <!-- Navigation Items -->
    <div 
      class="space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out"
      :style="{
        maxHeight: isCollapsed ? '0px' : '300px',
        opacity: isCollapsed ? 0 : 1,
        paddingTop: isCollapsed ? '0px' : '',
        paddingBottom: isCollapsed ? '0px' : ''
      }"
    >
      <BaseNavigationItem
        v-for="navItem in group.nav"
        :key="navItem?.name"
        :item="navItem"
        :is-active="checkIsActive(navItem)"
        @click="handleItemClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Import interfaces/types
import type { NavigationItem, NavigationGroup } from "../../types/navigation";
// Props
interface Props {
  group: NavigationGroup;
  groupKey: number;
  isCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapsed: false
});

// Emits
const emit = defineEmits<{
  toggle: [groupKey: number];
  itemClick: [item: NavigationItem];
}>();

// Route handling
const route = useRoute();

// Functions
function handleToggle() {
  emit('toggle', props.groupKey);
}

function handleItemClick(item: NavigationItem) {
  emit('itemClick', item);
}

function checkIsActive(item: NavigationItem): boolean {
  const currentRoute = route.name;
  return currentRoute === item.link;
}
</script> 