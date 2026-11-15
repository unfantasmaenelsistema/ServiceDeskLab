import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base relativa: funciona igual en GitHub Pages (/ServiceDeskLab/) que en local
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // React y los iconos en su propio fichero: el bundle principal baja de 500 kB
        codeSplitting: {
          groups: [{ name: 'vendor', test: /node_modules[\/](react|react-dom|scheduler|lucide-react)[\/]/ }],
        },
      },
    },
  },
});
