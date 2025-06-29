import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/store/auth';
import type { AdministratorUser } from '~/types/auth';
import type { Ref } from 'vue';

export function useUserData(): { userData: Ref<AdministratorUser | null> } {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  return { userData: user };
}