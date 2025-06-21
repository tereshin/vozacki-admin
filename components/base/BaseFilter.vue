<template>
    <!-- Mobile Filter Button -->
    <div class="mb-4 lg:hidden">
        <Button @click="showFilters = !showFilters" :label="filterButtonLabel || $t('common.filters')"
            :icon="showFilters ? 'pi pi-times' : 'pi pi-filter'" severity="secondary" size="small" class="w-full" />
    </div>

    <!-- Filter Card -->
    <Card class="mb-6 relative" :class="{
        '!hidden lg:!block': !showFilters,
        'lg:static lg:z-auto z-50': showFilters
    }">
        <template #content>
            <div class="flex flex-col lg:flex-row gap-4 w-full items-end justify-between">
                <!-- Динамические поля фильтра -->
                <template v-for="field in filterFields" :key="field.key">
                    <!-- Поле поиска -->
                    <div v-if="field.type === 'text'" class="w-full" :class="field.width || 'lg:w-1/2'">
                        <label class="block text-900 font-medium mb-2">
                            {{ $t(field.label) }}
                        </label>
                        <InputText :model-value="modelValue[field.key]"
                            @input="handleInput(field.key, ($event.target as HTMLInputElement)?.value || '')"
                            :placeholder="$t(field.placeholder || '')" class="w-full" :icon="field.icon" />
                    </div>

                    <!-- Поле выбора (Select) -->
                    <div v-else-if="field.type === 'select'" class="w-full" :class="field.width || 'lg:w-1/3'">
                        <label class="block text-900 font-medium mb-2">
                            {{ $t(field.label) }}
                        </label>
                        <Select :model-value="modelValue[field.key]"
                            @update:model-value="(value) => handleChange(field.key, value)" :options="field.options"
                            :option-label="field.optionLabel || 'name'" :option-value="field.optionValue || 'id'"
                            :placeholder="$t(field.placeholder || '')" class="w-full"
                            :show-clear="field.showClear !== false" :filter="field.filter" />
                    </div>

                    <!-- Поле даты -->
                    <div v-else-if="field.type === 'date'" class="w-full" :class="field.width || 'lg:w-1/4'">
                        <label class="block text-900 font-medium mb-2">
                            {{ $t(field.label) }}
                        </label>
                        <DatePicker :model-value="modelValue[field.key]"
                            @update:model-value="(value) => handleChange(field.key, value)"
                            :placeholder="$t(field.placeholder || '')" class="w-full"
                            :show-clear="field.showClear !== false" :date-format="field.dateFormat || 'dd.mm.yy'" />
                    </div>

                    <!-- Числовое поле -->
                    <div v-else-if="field.type === 'number'" class="w-full" :class="field.width || 'lg:w-1/4'">
                        <label class="block text-900 font-medium mb-2">
                            {{ $t(field.label) }}
                        </label>
                        <InputNumber :model-value="modelValue[field.key]"
                            @update:model-value="(value) => handleChange(field.key, value)"
                            :placeholder="$t(field.placeholder || '')" class="w-full" :min="field.min" :max="field.max"
                            :step="field.step" />
                    </div>

                    <!-- Переключатель (Boolean) -->
                    <div v-else-if="field.type === 'boolean'" class="w-full" :class="field.width || 'lg:w-1/6'">
                        <label class="block text-900 font-medium mb-2">
                            {{ $t(field.label) }}
                        </label>
                        <div class="flex align-items-center">
                            <Checkbox :model-value="modelValue[field.key]"
                                @update:model-value="(value: boolean) => handleChange(field.key, value)" />
                            <label class="ml-2">{{ field.checkboxLabel ? $t(field.checkboxLabel) : $t(field.label)
                                }}</label>
                        </div>
                    </div>
                </template>

                <!-- Кнопки действий -->
                <div class="mt-auto mb-0.5 whitespace-nowrap flex gap-2">
                    <Button v-if="showResetButton" @click="handleReset" :label="resetButtonLabel || 'Reset Filters'"
                        size="small" severity="secondary" />
                    <Button v-if="showApplyButton" @click="handleApply" :label="applyButtonLabel || 'Apply'"
                        size="small" severity="primary" />
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FilterFieldConfig } from '~/types/filters'

// Состояние для мобильных фильтров
const showFilters = ref(false)

// Props
interface Props {
    modelValue: Record<string, any>
    filterFields: FilterFieldConfig[]
    showResetButton?: boolean
    showApplyButton?: boolean
    resetButtonLabel?: string
    applyButtonLabel?: string
    filterButtonLabel?: string
    debounceTimeout?: number
}

const props = withDefaults(defineProps<Props>(), {
    showResetButton: true,
    showApplyButton: false,
    debounceTimeout: 300
})

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: Record<string, any>]
    'change': [field: string, value: any]
    'reset': []
    'apply': []
}>()

// Debounced input для поиска
let inputTimeout: NodeJS.Timeout

const handleInput = (field: string, value: string) => {
    clearTimeout(inputTimeout)
    inputTimeout = setTimeout(() => {
        handleChange(field, value)
    }, props.debounceTimeout)
}

const handleChange = (field: string, value: any) => {
    const newValue = { ...props.modelValue, [field]: value }
    emit('update:modelValue', newValue)
    emit('change', field, value)

    // Скрываем фильтры на мобильных после изменения (кроме поиска)
    if (field !== 'search') {
        showFilters.value = false
    }
}

const handleReset = () => {
    const resetValue = Object.fromEntries(
        props.filterFields.map(field => [field.key, ''])
    )
    emit('update:modelValue', resetValue)
    emit('reset')

    // Скрываем фильтры на мобильных после сброса
    showFilters.value = false
}

const handleApply = () => {
    emit('apply')

    // Скрываем фильтры на мобильных после применения
    showFilters.value = false
}
</script>