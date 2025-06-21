<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Main Card -->
      <Card>
        <template #content>
          <div class="p-1 space-y-3">
            <!-- Header -->
            <div class="text-center space-y-2">
              <div class="mx-auto w-16 h-16 shadow-sm rounded-xl flex items-center justify-center mb-4">
                <img src="https://autokurs.tereshin.co/favicon/apple-touch-icon.png" alt="logo" class="w-full rounded-xl">
              </div>
              <h1 class="text-xl font-semibold tracking-tight">
                {{ $t('login.title') || 'Log in to system' }}
              </h1>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="space-y-6 mt-6">
              <!-- Email Input -->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-gray-700">
                  {{ $t('login.emailLabel') }}
                </label>
                <div class="relative">
                  <i class="pi pi-at absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <InputText
                    id="email"
                    v-model="formData.email"
                    type="email"
                    :placeholder="$t('login.emailPlaceholder')"
                    :disabled="loading"
                    :class="{ 
                      'p-invalid': error,
                      'border-green-300': successMessage 
                    }"
                    class="w-full"
                    required
                    autocomplete="email"
                  />
                
                </div>
              </div>

              <!-- Error Message -->
              <Message 
                v-if="error" 
                severity="error" 
                :closable="true"
                @close="error = null"
                class="mt-4"
              >
                <div class="flex items-center space-x-2">
                  <i class="pi pi-exclamation-triangle"></i>
                  <div>
                    <strong>{{ $t('login.errorTitle') }}</strong>
                    <p class="mt-1 text-sm">{{ error }}</p>
                  </div>
                </div>
              </Message>

              <!-- Success Message -->
              <Message 
                v-if="successMessage" 
                severity="success" 
                :closable="true"
                @close="successMessage = null"
                class="mt-4"
              >
                <div class="flex items-center space-x-2">
                  <i class="pi pi-check-circle"></i>
                  <div>
                    <strong>{{ $t('login.successTitle') }}</strong>
                    <p class="mt-1 text-sm">{{ successMessage }}</p>
                  </div>
                </div>
              </Message>

              <!-- Submit Button -->
              <Button
                type="submit"
                :disabled="!formData.email || loading"
                :loading="loading"
                :label="$t('login.submitButton')"
                class="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
                :loading-label="$t('login.submitting')"
              />
            </form>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginRequest } from '~/types/auth';
import { useAuthStore } from '~/store/auth';

// Устанавливаем layout
definePageMeta({
  layout: 'login'
});

// Reactive data
const formData = reactive<LoginRequest>({
  email: ''
});

const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Store
const authStore = useAuthStore();

// i18n
const { t } = useI18n();

// Methods
async function handleLogin() {
  if (!formData.email) {
    error.value = t('login.emailRequired');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    error.value = t('login.invalidEmail');
    return;
  }

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const result = await authStore.login(formData);

    if (result.error) {
      error.value = result.error;
    } else {
      successMessage.value = t('login.successMessage');
      formData.email = '';
    }
  } catch (err: any) {
    error.value = err.message || t('login.unexpectedError');
  } finally {
    loading.value = false;
  }
}

// Clear error on input change
watch(() => formData.email, () => {
  if (error.value) {
    error.value = null;
  }
  if (successMessage.value) {
    successMessage.value = null;
  }
});

// Auto-clear messages after some time
watch(error, (newError) => {
  if (newError) {
    setTimeout(() => {
      if (error.value === newError) {
        error.value = null;
      }
    }, 8000);
  }
});

watch(successMessage, (newMessage) => {
  if (newMessage) {
    setTimeout(() => {
      if (successMessage.value === newMessage) {
        successMessage.value = null;
      }
    }, 10000);
  }
});

// Page meta
useHead({
  title: t('login.title') + ' - Vozacki Admin'
});
</script>