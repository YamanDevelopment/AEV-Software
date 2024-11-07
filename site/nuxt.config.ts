// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@tresjs/nuxt', '@nuxt/content', '@nuxtjs/plausible'],
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  plausible: {
    apiHost: 'https://analytics.zachl.tech',
  },

  runtimeConfig: {
    s3endpoint: process.env.ENDPOINT,
    s3accessKey: process.env.ACCESS_KEY,
    s3secretKey: process.env.SECRET_KEY
  },

  compatibilityDate: '2024-11-06',
})