import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const CONTENT_SECURITY_POLICY =
  "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:"

// Injected at build time only: in dev, Vite and React Refresh add an inline script that the CSP would block.
function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
        injectTo: 'head-prepend',
      },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentSecurityPolicy()],
  build: {
    // Fonts inlined as data: URLs in the CSS: the PNG export has nothing left to download.
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? true : undefined),
  },
})
