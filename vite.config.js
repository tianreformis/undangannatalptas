import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const FALLBACK_SITE_URL = 'https://domain-anda.com'

export default defineConfig(({ mode }) => {
  // VITE_SITE_URL dipakai untuk membentuk URL absolut og:image / twitter:image.
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '')

  return {
    plugins: [
      vue(),
      {
        name: 'inject-og-image-url',
        transformIndexHtml(html) {
          return html.replaceAll('__OG_IMAGE_URL__', `${siteUrl}/og-image.png`)
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2019',
      cssCodeSplit: true,
    },
  }
})
