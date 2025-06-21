import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", () => {
  const isLoading = ref(false);
  const isMenuOpen = ref(true);
  const isMobile = ref(false);

  // Functions
  function updateMobileStatus() {
    isMobile.value = window.innerWidth < 1024;
  }

  function initMobileDetection() {
    updateMobileStatus();
    window.addEventListener("resize", updateMobileStatus);
  }

  function destroyMobileDetection() {
    window.removeEventListener("resize", updateMobileStatus);
  }

  return {
    isLoading,
    isMenuOpen,
    isMobile,
    updateMobileStatus,
    initMobileDetection,
    destroyMobileDetection
  };
});