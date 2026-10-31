import { createFileRoute } from '@tanstack/react-router'

import { requireAdmin } from '../../../../admin/server/session.ts'
import { saveMedia } from '../../../../admin/server/media.ts'
import { uploadsDir } from '../../../../admin/server/media-storage.ts'
import {
  mediaSlotKeySchema,
  MAX_UPLOAD_BYTES,
} from '../../../../admin/server/media-schema.ts'
import { isSafeSameOrigin } from '../../../../admin/server/csrf.ts'

/**
 * Multipart image upload → `public/uploads/`.
 *
 * A dedicated route rather than a server function: server-function inputs are
 * serialised as JSON, so passing an image would mean base64 (+33% size and two
 * extra copies in memory). `request.formData()` handles the body natively.
 *
 * Auth is checked before the body is read, so an unauthenticated request cannot
 * be used to push bytes at the server.
 */
export const Route = createFileRoute('/api/admin/media/$slot')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const admin = await requireAdmin(request)

          if (!isSafeSameOrigin(request)) {
            return Response.json(
              { ok: false, error: 'Cross-origin uploads are not allowed.' },
              { status: 403 },
            )
          }

          const parsedSlot = mediaSlotKeySchema.safeParse(params.slot)
          if (!parsedSlot.success) {
            return Response.json(
              { ok: false, error: 'Unknown image slot.' },
              { status: 400 },
            )
          }

          // Reject an oversized body before buffering it.
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

          const altText = String(form.get('altText') ?? '')
          const bytes = new Uint8Array(await file.arrayBuffer())

          const result = await saveMedia({
            slot: parsedSlot.data,
            declaredType: file.type,
            bytes,
            altText,
            updatedBy: admin.userId,
          })

          if (!result.ok) {
            return Response.json(result, { status: 422 })
          }
          return Response.json(result, { status: 200 })
        } catch (err) {
          if (err instanceof Response) throw err
          return Response.json(
            {
              ok: false,
              error: `Upload failed. Could not write to ${uploadsDir()}.`,
            },
            { status: 500 },
          )
        }
      },
    },
  },
})