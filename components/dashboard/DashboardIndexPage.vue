<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <TheHeader 
            title="Dashboard" 
            :hideBreadcrumb="true"
            :items="breadcrumbItems"
        >
            <template #actions>
                <!-- Дополнительные действия можно добавить здесь -->
            </template>
        </TheHeader>

        <!-- Main content -->
        <main>
            
        </main>
    </div>
</template>

<script setup lang="ts">
import TheHeader from "~/components/TheHeader.vue";

// Breadcrumb items для Dashboard
const breadcrumbItems = ref([
    {
        label: "Dashboard",
        to: "/dashboard"
    }
]);
</script>
