import ToastService from 'primevue/toastservice'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ToastService)
}) 