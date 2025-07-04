// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { i18nConfig } from "./i18n/i18n";
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  nitro: {
    preset: 'node-server'
  },
  app: {
    head: {
      title: "Vozacki Admin",
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, max-image-preview:large, user-scalable=no",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon/favicon-96x96.png",
          sizes: "96x96",
        },
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon/favicon.svg",
        },
        { rel: "shortcut icon", href: "/favicon/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/favicon/site.webmanifest" },
      ],
      meta: [{ name: "apple-mobile-web-app-title", content: "Vozacki SRB" }],
    },
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  imports: {
    dirs: ["composables/**", "composables/**/**"],
  },
  i18n: i18nConfig,
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Вендорные библиотеки
            'vendor-primevue': ['primevue', '@primeuix/themes'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-vue': ['vue', '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity'],
            // Не включаем конкретные файлы проекта, так как Nuxt автоматически их разделяет
          }
        }
      }
    }
  },

  css: [
    "~/assets/css/main.css",
  ],
  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    "nuxt-typed-router",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    'nuxt-typed-router',
    'nuxt-svgo-loader',
    "@primevue/nuxt-module"
  ],
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ['normal', 'italic'],
        display: 'swap'
      }
    ]
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false
        }
      }
    },
    autoImport: true,
    components: {
      include: "*",
      exclude: []
    }
  },
  plugins: [
    '~/plugins/supabase.client.ts'
  ],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://vemilyrevahvusnpoghi.supabase.co',
      supabasePublishableKey: process.env.SUPABASE_ANON_KEY || '',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      demoEmail: process.env.DEMO_EMAIL || 'demo@vozacki.rs',
      demoPassword: process.env.DEMO_PASSWORD || 'password'
    }
  },
})