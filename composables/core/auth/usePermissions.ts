import { useAuthStore } from '~/store/auth'

export const usePermissions = () => {
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  // Проверка роли пользователя
  const hasRole = (roleCode: string): boolean => {
    if (!user.value || !user.value.role) {
      return false
    }
    return user.value.role.code === roleCode
  }

  // Проверка на администратора
  const isAdministrator = computed(() => hasRole('administrator'))

  // Проверка на модератора
  const isModerator = computed(() => hasRole('moderator'))

  // Проверка на обычного пользователя
  const isUser = computed(() => hasRole('user'))

  const isGuest = computed(() => hasRole('guest'))

  // Проверка доступа к разделу администраторов
  const canAccessAdministrators = computed(() => isAdministrator.value)

  // Проверка доступа к управлению ролями
  const canManageRoles = computed(() => isAdministrator.value)

  // Проверка доступа к управлению контентом
  const canManageContent = computed(() => isAdministrator.value || isModerator.value)

  // Проверка доступа к просмотру тестов
  const canViewTests = computed(() => isAdministrator.value || isModerator.value || isUser.value || isGuest.value)

  // Получение текущей роли пользователя
  const currentRole = computed(() => user.value?.role?.code || null)

  // Получение названия текущей роли
  const currentRoleName = computed(() => user.value?.role?.name || null)

  return {
    hasRole,
    isAdministrator,
    isModerator,
    isUser,
    canAccessAdministrators,
    canManageRoles,
    canManageContent,
    canViewTests,
    currentRole,
    currentRoleName,
  }
} 