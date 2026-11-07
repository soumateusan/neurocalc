import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { readFileSync, readdirSync, statSync } from 'node:fs'

const raiz = import.meta.dirname

/* lista todos os arquivos de public/ (PDFs, ícones) */
function arquivosPublic(dir = resolve(raiz, 'public'), base = '') {
  return readdirSync(dir).flatMap((n) => {
    const p = resolve(dir, n)
    return statSync(p).isDirectory() ? arquivosPublic(p, `${base}${n}/`) : [`/${base}${n}`]
  }).filter((f) => !f.endsWith('.DS_Store'))
}

/* gera o service worker com a lista completa de arquivos do build → funciona offline desde a 1ª visita */
function serviceWorker() {
  return {
    name: 'service-worker-offline',
    apply: 'build',
    generateBundle(_, bundle) {
      const arquivos = ['/', '/index.html', '/dosus.html', ...Object.keys(bundle).map((f) => `/${f}`), ...arquivosPublic()]
      const versao = Date.now().toString(36)
      const src = readFileSync(resolve(raiz, 'src/sw-template.js'), 'utf8')
        .replace('__PRECACHE__; // eslint-disable-line no-undef', '__PRECACHE__;').replace('__PRECACHE__', JSON.stringify([...new Set(arquivos)]))
        .replace('__VERSAO__', versao)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: src })
    },
  }
}

// duas páginas: NeuroCalc (index.html) e DOSUS Neuro (dosus.html)
export default defineConfig({
  plugins: [react(), serviceWorker()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(raiz, 'index.html'),
        dosus: resolve(raiz, 'dosus.html'),
      },
    },
  },
})
