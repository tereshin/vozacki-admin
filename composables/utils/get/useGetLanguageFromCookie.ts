import { defaultLocale } from "~/i18n/i18n";

export const useGetLanguageFromCookie = (): string => {
  if (typeof document === "undefined") {
    return defaultLocale;
  }

  const cookies = document.cookie.split(";");
  const langCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("i18n_lang=")
  );
  return langCookie ? langCookie.split("=")[1].trim() : defaultLocale;
};
