import { defineConfig } from 'vite'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import {
  readUpload,
  uploadsDir,
  uploadsUrlPrefix,
} from './admin/server/media-storage.ts'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

function configureUploadedImages(server: ViteDevServer | PreviewServer) {
  server.middlewares.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }

    let pathname: string
    try {
      pathname = new URL(req.url ?? '/', 'http://localhost').pathname
    } catch (error) {
      next(error)
      return
    }

    const prefix = uploadsUrlPrefix()
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
      next()
      return
    }

    let fileName: string
    try {
      fileName = decodeURIComponent(pathname.slice(prefix.length + 1))
    } catch (error) {
      next(error)
      return
    }

    void readUpload(fileName).then(
      (bytes) => {
        if (!bytes) {
          next()
          return
        }

        const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
        const contentType =
          extension === 'png'
            ? 'image/png'
            : extension === 'webp'
              ? 'image/webp'
              : 'image/jpeg'
        res.statusCode = 200
        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Length', String(bytes.byteLength))
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(req.method === 'HEAD' ? undefined : Buffer.from(bytes))
      },
      next,
    )
  })
}

const uploadedImages: Plugin = {
  name: 'uploaded-images',
  configureServer: configureUploadedImages,
  configurePreviewServer: configureUploadedImages,
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    watch: {
      ignored: [`${uploadsDir().replace(/\\/g, '/')}/**`],
    },
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('libphonenumber-js')) return 'vendor-phone'
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('@tanstack/react-router') || id.includes('@tanstack/react-query') || id.includes('@tanstack/react-router-devtools') || id.includes('@tanstack/react-router-ssr-query')) return 'vendor-tanstack'
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) return 'vendor-ui'
            if (id.includes('@tanstack/react-form') || id.includes('@tanstack/react-table')) return 'vendor-forms'
            if (id.includes('gsap') || id.includes('@lottiefiles/dotlottie-react')) return 'vendor-animation'
            if (id.includes('zod') || id.includes('drizzle-orm') || id.includes('mysql2')) return 'vendor-db'
            if (id.includes('nodemailer')) return 'vendor-email'
            if (id.includes('zod')) return 'vendor-validation'
            return 'vendor-other'
          }
        },
      },
    },
  },
  plugins: [
    uploadedImages,
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
