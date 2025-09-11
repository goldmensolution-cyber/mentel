// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/image', '@nuxthub/core', '@nuxtjs/supabase', '@vueuse/nuxt'],
  supabase: {
    redirectOptions: {
    login: '/login',
    callback: '/confirm',
    include: [],
    exclude: ['/','/about','/contact','/terms','/privacy','/pricing','/faqs','/login','/signup','/confirm','/forgot-password','/reset-password','/*','/**'],
    saveRedirectToCookie: false,
  }
  },
  nitro: {
    experimental: {
      openAPI: true
    }
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-16'
})
