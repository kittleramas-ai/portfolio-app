import { createFileRoute } from '@tanstack/react-router'

import { requireAdmin } from '../../../../admin/server/session.ts'
import { isSafeSameOrigin } from '../../../../admin/server/csrf.ts'
import { validateImageUpload } from '../../../../admin/server/media-validate.ts'
import {
  publicUrlFor,
  uploadExists,
  writeUpload,
} from '../../../../admin/server/media-storage.ts'
import { EXTENSION_FOR_TYPE, MAX_UPLOAD_BYTES } from '../../../../admin/server/media-schema.ts'

/**
 * Generic image upload used by the "*Url" fields in the settings form, which
 * are free-form URLs (not bound to a named slot), so they get a unique name
 * rather than overwriting a fixed slot file.
 */
export const Route = createFileRoute('/api/admin/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAdmin(request)
          if (!isSafeSameOrigin(request)) {
            return Response.json(
              { ok: false, error: 'Cross-origin uploads are not allowed.' },
              { status: 403 },
            )
          }

          const declaredLength = Number(
            request.headers.get('content-length') ?? '0',
          )
          if (declaredLength > MAX_UPLOAD_BYTES * 2) {
            return Response.json(
              { ok: false, error: 'That upload is too large.' },
              { status: 413 },
            )
          }

          const form = await request.formData()
          const file = form.get('file')
          if (!(file instanceof File)) {
            return Response.json(
              { ok: false, error: 'No file was received.' },
              { status: 400 },
            )
          }

          const bytes = new Uint8Array(await file.arrayBuffer())
          const validated = validateImageUpload(file.type, bytes)
          if (!validated.ok) {
            return Response.json(validated, { status: 422 })
          }

          let fileName = `custom-${crypto.randomUUID()}.${EXTENSION_FOR_TYPE[validated.contentType]}`
          while (await uploadExists(fileName)) {
            fileName = `custom-${crypto.randomUUID()}.${EXTENSION_FOR_TYPE[validated.contentType]}`
          }
          await writeUpload(fileName, bytes)
          return Response.json(
            { ok: true, url: publicUrlFor(fileName) },
            { status: 200 },
          )
        } catch (err) {
          if (err instanceof Response) throw err
          return Response.json(
            { ok: false, error: 'Upload failed.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
