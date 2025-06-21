<template>
  <Breadcrumb :home="home" :model="items" class="bg-inherit! cursor-pointer! !p-0 text-sm">
    <template #item="{ item, props }">
      <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span class="text-gray-400 hover:text-gray-700 font-medium">{{
            item.label
          }}</span>
        </a>
      </router-link>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <span class="text-gray-400 font-medium">{{ item.label }}</span>
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
    to: useRoutesNames().dashboard
  },
});

</script>
