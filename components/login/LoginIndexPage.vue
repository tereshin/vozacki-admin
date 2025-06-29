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
                <img src="/favicon/apple-touch-icon.png" alt="logo" class="w-full rounded-xl">
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
                  <InputText id="email" v-model="formData.email" type="email"
                    :placeholder="$t('login.emailPlaceholder')" :disabled="loading" :class="{
                      'p-invalid': error
                    }" class="w-full" required autocomplete="email" />

                </div>
              </div>

              <!-- Password Input -->
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">
                  {{ $t('login.passwordLabel') }}
                </label>
                <div class="relative">
                  <i class="pi pi-lock absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <InputText id="password" v-model="formData.password" type="password"
                    :placeholder="$t('login.passwordPlaceholder')" :disabled="loading" :class="{
                      'p-invalid': error
                    }" class="w-full" required autocomplete="current-password" />
                </div>
              </div>

              <!-- Error Message -->
              <Message v-if="error" severity="error" :closable="true" @close="error = null" class="mt-4">
                <div class="flex items-center space-x-2">
                  <i class="pi pi-exclamation-triangle"></i>
                  <div>
                    <strong>{{ $t('login.errorTitle') }}</strong>
                    <p class="mt-1 text-sm">{{ error }}</p>
                  </div>
                </div>
              </Message>

              <div class="flex flex-col gap-2">
                <!-- Submit Button -->
                <Button type="submit" :disabled="!formData.email || !formData.password || loading" :loading="loading"
                  :label="$t('login.submitButton')"
                  class="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
                  :loading-label="$t('login.submitting')" />
                <!-- Demo Account Button -->
                <Button type="button" :disabled="loading" :label="$t('login.demoButton')" class="w-full"
                  @click="loginAsDemo" severity="secondary" />
              </div>
            </form>

          </div>
        </template>
      </Card>
      <!-- GitHub link -->
      <div class="flex justify-center mt-6">
        <a href="https://github.com/tereshin/vozacki-admin" target="_blank" rel="noopener" title="GitHub Vozacki Admin" class="inline-flex items-center opacity-70 hover:opacity-100 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z" fill="currentColor"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LoginRequest } from '~/types/auth';
import { useAuthStore } from '~/store/auth';
import { useRuntimeConfig } from '#app';

// Reactive data
const formData = reactive<LoginRequest>({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref<string | null>(null);

// Store
const authStore = useAuthStore();

// Debug token helper
const tokenDebug = computed(() => {
  const token = useCookie('access_token');
  return token.value ? `${token.value.substring(0, 20)}...` : 'None';
});

// i18n
const { t } = useI18n();

const config = useRuntimeConfig();

// Methods
async function handleLogin() {
  if (!formData.email) {
    error.value = t('login.emailRequired');
    return;
  }

  if (!formData.password) {
    error.value = t('login.passwordRequired');
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

  try {
    const result = await authStore.login(formData);

    if (result.error) {
      error.value = result.error;
    } else {
      // При успешной авторизации перенаправляем на дашборд
      await navigateTo('/dashboard');
    }
  } catch (err: any) {
    error.value = err.message || t('login.unexpectedError');
  } finally {
    loading.value = false;
  }
}

function loginAsDemo() {
  formData.email = config.public.demoEmail;
  formData.password = config.public.demoPassword;
  handleLogin();
}

// Clear error on input change
watch([() => formData.email, () => formData.password], () => {
  if (error.value) {
    error.value = null;
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

// Page meta
useHead({
  title: t('login.title') + ' - Vozacki Admin'
});
</script>