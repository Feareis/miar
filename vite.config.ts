import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const CONTENT_SECURITY_POLICY =
  "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:"

// Injectée au build seulement : en dev, Vite et React Refresh ajoutent un script en ligne que la CSP bloquerait.
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
    // Polices incorporées en data: dans le CSS : l'export PNG n'a plus rien à télécharger.
    assetsInlineLimit: (fichier) => (fichier.endsWith('.woff2') ? true : undefined),
  },
})
