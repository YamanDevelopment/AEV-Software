// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@tresjs/nuxt', '@nuxt/content'],
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    s3endpoint: process.env.ENDPOINT,
    s3accessKey: process.env.ACCESS_KEY,
    s3secretKey: process.env.SECRET_KEY
  },

  compatibilityDate: '2024-11-06',
})