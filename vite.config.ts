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
    tanstackStart({
      serverFns: {
        // Server-function requests are POSTs to <base>/<functionId>, so the
        // default `/_serverFn` shows up as noise in the network panel. A path
        // that says what these are makes the traffic self-describing.
        base: '/api/fn',
        /**
         * Build-time function ids. Without this the compiler hashes
         * `file--export` to a sha256 hex string, so a production trace shows an
         * opaque id too. Deriving it from the file and export name gives
         * `admin_server_api_submitEnquiryFn`-style ids that map back to source.
         *
         * Dev mode ignores this: the compiler base64-encodes the module
         * specifier there so an unbuilt file can be located and reloaded.
         */
        generateFunctionId: ({ filename, functionName }) =>
          `${filename.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}_${functionName}`,
      },
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
