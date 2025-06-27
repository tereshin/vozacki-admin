import { defineStore } from "pinia";
import type { AdministratorResource } from "~/types/administrators";

export const useUserData = defineStore("user", () => {
  const userData = ref<AdministratorResource | null>(null);
  const getUser = localStorage.getItem('user');
  if (getUser) {
    userData.value = JSON.parse(getUser);
  }

  return {
    userData,
  };
});