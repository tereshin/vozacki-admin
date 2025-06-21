<template>
    <div
        class="inline-flex items-center justify-center"
        :class="[sizeClasses[size], colorClasses[color]]"
    >
        <component :is="activeComponent" ref="componentRef" />
    </div>
</template>
<script setup lang="ts">
import type { IconName, IconColor, IconSize } from '@/types/general';

const props = defineProps({
    name: {
        type: String as () => IconName,
        default: 'logo',
    },
    size: {
        type: String as () => IconSize,
        default: 'md',
        validator: (value: string) =>
            ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value),
    },

    color: {
        type: String as () => IconColor,
        default: 'default',
        validator: (value: string) =>
            ['default', 'primary', 'secondary', 'white', 'gray'].includes(
                value,
            ),
    },
});

const componentRef = ref();

const activeComponent = computed(() => {
    return useGetIcon(props.name);
});

const sizeClasses: Record<IconSize, string> = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-[73px] h-[63px] lg:w-[90px] lg:h-[78px]',
};
const colorClasses: Record<IconColor, string> = {
    default: 'text-black',
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-500',
};
</script>