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
                  <InputText
                    id="email"
                    v-model="formData.email"
                    type="email"
                    :placeholder="$t('login.emailPlaceholder')"
                    :disabled="loading"
                    :class="{ 
                      'p-invalid': error 
                    }"
                    class="w-full"
                    required
                    autocomplete="email"
                  />
                
                </div>
              </div>

              <!-- Password Input -->
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">
                  {{ $t('login.passwordLabel') }}
                </label>
                <div class="relative">
                  <i class="pi pi-lock absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <InputText
                    id="password"
                    v-model="formData.password"
                    type="password"
                    :placeholder="$t('login.passwordPlaceholder')"
                    :disabled="loading"
                    :class="{ 
                      'p-invalid': error 
                    }"
                    class="w-full"
                    required
                    autocomplete="current-password"
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



              <!-- Submit Button -->
              <Button
                type="submit"
                :disabled="!formData.email || !formData.password || loading"
                :loading="loading"
                :label="$t('login.submitButton')"
                class="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
                :loading-label="$t('login.submitting')"
              />
            </form>



            <!-- Debug Info -->
            <div v-if="$config.public.NODE_ENV === 'development'" class="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>🐛 Debug Info:</strong><br>
              Is Authenticated: {{ authStore.isAuthenticated }}<br>
              User ID: {{ authStore.user?.id || 'None' }}<br>
              Session: {{ authStore.session ? 'Present' : 'None' }}<br>
              Cookie Token: {{ tokenDebug }}
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LoginRequest } from '~/types/auth';
import { useAuthStore } from '~/store/auth';

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