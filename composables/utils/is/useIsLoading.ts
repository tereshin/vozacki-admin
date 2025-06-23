import { useGeneralStore } from "@/store/general";

export const useIsLoading = (value: boolean) => {
  const generalStore = useGeneralStore();
  generalStore.isLoading = value;
};
