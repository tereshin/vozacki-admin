<template>
  <Breadcrumb :home="home" :model="items" class="bg-inherit! cursor-pointer! !p-0 text-sm">
    <template #item="{ item, props }">
      <NuxtLink v-if="item.to" :to="item.to" v-bind="props.action">
        <span class="text-gray-400 hover:text-gray-700 font-medium">{{
          item.label
        }}</span>
      </NuxtLink>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <span class="text-gray-400 font-medium block whitespace-nowrap max-w-[200px] lg:max-w-[700px] overflow-hidden text-ellipsis">{{ item.label }}</span>
      </a>
    </template>
    <template #separator>
      <span class="text-gray-400 font-medium">/</span>
    </template>
  </Breadcrumb>
</template>
<script setup lang="ts">
interface Props {
  home?: {
    label?: string;
    to?: string;
  };
  items: {
    label: string;
    to?: string;
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  home: {
    label: "Home",
    to: '/dashboard'
  },
});

</script>
