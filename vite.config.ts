import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'node18',
    ssr: true,
    lib: {
      entry: {
        cli: 'src/cli/index.ts',
        index: 'src/index.ts'
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ['yargs', 'yargs/helpers'],
      output: {
        banner: (chunk) => (chunk.name === 'cli' ? '#!/usr/bin/env node' : '')
      }
    }
  }
})
