import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    // NOTE: @cloudflare/vite-plugin was removed. It ran the SSR environment
    // inside workerd, which has no writable filesystem — `node:fs` resolved but
    // threw "[unenv] fs.writeFile is not implemented yet!", making on-disk
    // image uploads impossible. The app now targets a Node server (VPS), where
    // the filesystem is real.
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
