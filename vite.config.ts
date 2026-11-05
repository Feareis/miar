import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Polices incorporées en data: dans le CSS : l'export PNG n'a plus rien à télécharger.
    assetsInlineLimit: (fichier) => (fichier.endsWith('.woff2') ? true : undefined),
  },
})
