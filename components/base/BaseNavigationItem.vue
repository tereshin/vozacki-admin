<template>
    <div
      v-if="
        item?.conditions?.every((i: any) => i === true) ||
        !item?.conditions?.length
      "
      @click="handleClick"
      v-ripple
      class="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-gray-200 hover:text-gray-700"
      :class="[
        isActive 
          ? 'bg-gray-100 text-gray-950' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950'
      ]"
    >
      <!-- Icon -->
      <div class="flex items-center justify-center w-4.5 h-4.5">
        <BaseIcon :name="item.icon" :class="[
          isActive ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-600'
        ]" />
        
      </div>
      
      <!-- Label -->
      <span class="font-medium flex-grow">
        {{ item.name }}
      </span>
      
      <!-- Badge -->
      <div
        v-if="item.badge"
        class="flex items-center justify-center min-w-[17.5px] h-[17.5px] px-1.5 bg-black text-white text-xs font-bold rounded-full"
      >
        {{ item.badge }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // Import interfaces/types
  import type { NavigationItem } from "../../types/navigation";
  
  // Props
  interface Props {
    item: NavigationItem;
    isActive?: boolean;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isActive: false
  });
  
  // Emits
  const emit = defineEmits<{
    click: [item: NavigationItem];
  }>();
  
  // Functions
  function handleClick() {
    emit('click', props.item);
  }
  </script> 