import { useEffect, useRef, useState } from 'react'

import {
  deleteMediaFn,
  getAdminMediaFn,
  updateAltTextFn,
} from '../server/api.ts'
import { getMediaAvailabilityFn } from '../server/public.ts'
import { MAX_UPLOAD_BYTES } from '../server/media-schema.ts'
import type {
  MEDIA_SLOTS,
  MediaEntry,
  MediaSlotKey,
} from '../server/media-schema.ts'

/** Slot metadata as sent by getAdminMediaFn (mirrors MEDIA_SLOTS). */
export type SlotMeta = (typeof MEDIA_SLOTS)[MediaSlotKey]

/** Everything the Images tab and the Overview tab need, in one shape. */
export type AdminMediaState = {
  entries: MediaEntry[]
  slots: Record<string, SlotMeta>
  available: boolean
  unavailableReason: string | null
}


/**
 * Loads the media slots once, at the shell level.
 *
 * The Overview needs the slot list to compute its "images live" and "alt text
 * coverage" tiles, so the fetch lives here rather than inside <AdminMedia>.
 * Both tabs read the same state, which also means an upload on the Images tab
 * immediately moves the numbers on the Overview tile instead of leaving a stale
 * count behind.
 */
export function useAdminMedia() {
  const [media, setMedia] = useState<AdminMediaState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cancelled = { current: false }
    void (async () => {
      try {
        const [loaded, avail] = await Promise.all([
          getAdminMediaFn(),
          getMediaAvailabilityFn(),
        ])
        if (cancelled.current) return
        setMedia({
          entries: loaded.entries,
          slots: loaded.slots,
          available: avail.available,
          unavailableReason: avail.reason,
        })
      } catch (err) {
        if (cancelled.current) return
        setError(err instanceof Error ? err.message : 'Could not load images')
      }
    })()
    return () => {
      cancelled.current = true
    }
  }, [])

  function applyChange(next: MediaEntry) {
    setMedia((prev) =>
      prev
        ? {
            ...prev,
            entries: prev.entries.map((e) => (e.slot === next.slot ? next : e)),
          }
        : prev,
    )
  }

  return { media, error, applyChange }
}

/**
 * Image slots.
 *
 * Upload goes through `/api/admin/media/<slot>` as multipart rather than
 * through a server function: function inputs are JSON-serialised, so an image
 * would have to be base64-encoded (+33% size, extra copies in memory).
 *
 * The client checks the size cap before reading the file so an oversized
 * selection fails instantly; the server re-validates from the file's magic
 * bytes regardless, since the client cannot be trusted.
 */
export function AdminMedia({
  media,
  onChanged,
}: {
  media: AdminMediaState
  onChanged: (entry: MediaEntry) => void
}) {
  return (
    <>
      {media.available === false ? (
        <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-5">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-amber-200">
            Image uploads are not available yet
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-amber-100/80">
            {media.unavailableReason}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-amber-100/60">
            The rest of this panel works normally. Once R2 is enabled these four
            slots become editable and the site picks up the uploads immediately.
          </p>
        </div>
      ) : null}

      <div className="space-y-5">
        {media.entries.map((entry) => (
          <SlotCard
            key={entry.slot}
            entry={entry}
            meta={media.slots[entry.slot]}
            disabled={media.available === false}
            onChanged={onChanged}
          />
        ))}
      </div>
    </>
  )
}

function SlotCard({
  entry,
  meta,
  disabled,
  onChanged,
}: {
  entry: MediaEntry
  meta: SlotMeta
  disabled: boolean
  onChanged: (entry: MediaEntry) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [altText, setAltText] = useState(entry.altText)
  const [altSaved, setAltSaved] = useState(false)

  const hasImage = Boolean(entry.url)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    // Fail fast on the client; the server still validates from magic bytes.
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`,
      )
      return
    }

    setBusy(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('altText', altText)

      const res = await fetch(`/api/admin/media/${entry.slot}`, {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
      })
      const json = (await res.json()) as {
        ok: boolean
        error?: string
        entry?: MediaEntry
      }
      if (!json.ok || !json.entry) {
        setError(json.error ?? 'Upload failed.')
        return
      }
      onChanged(json.entry)
      setAltSaved(true)
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    setBusy(true)
    setError(null)
    try {
      const result = await deleteMediaFn({ data: { slot: entry.slot } })
      if (result.ok) onChanged(result.entry)
      else setError(result.error)
    } finally {
      setBusy(false)
    }
  }

  async function onSaveAlt() {
    setBusy(true)
    try {
      await updateAltTextFn({
        data: { slot: entry.slot, altText },
      })
      onChanged({ ...entry, altText })
      setAltSaved(true)
    } finally {
      setBusy(false)
    }
  }

  const previewBox =
    meta.aspect === 'portrait'
      ? 'h-40 w-28'
      : meta.aspect === 'square'
        ? 'h-28 w-28'
        : 'h-24 w-full max-w-xs'

  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#f5efe0]">
            {meta.label}
            {meta.required ? (
              <span className="ml-2 text-[10px] font-normal text-amber-300">
                used on the live site
              </span>
            ) : null}
          </h3>
          <p className="mt-1 text-[12.5px] text-[#7a8a80]">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-5">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-row)] ${previewBox}`}
        >
          {hasImage ? (
            <img
              src={
                entry.url
                  ? `${entry.url}?v=${encodeURIComponent(entry.updatedAt ?? String(entry.sizeBytes ?? Date.now()))}`
                  : ''
              }
              alt={altText || meta.label}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="px-3 text-center text-[11px] leading-snug text-[#7a8a80]">
              Using the bundled asset
            </span>
          )}
        </div>

        <div className="min-w-[16rem] flex-1 space-y-3">
          <p className="font-mono-metric text-[11px] text-[#7a8a80]">
            {hasImage && entry.width && entry.height
              ? `${entry.width}x${entry.height} · ${((entry.sizeBytes ?? 0) / 1024).toFixed(0)} KB`
              : 'JPEG, PNG or WebP · 5 MB max'}
          </p>

          <label className="block">
            <span className="mb-1.5 block font-mono-metric text-[10px] uppercase tracking-[0.18em] text-[#b8c4bb]">
              Alt text (for screen readers)
            </span>
            <input
              value={altText}
              onChange={(e) => {
                setAltText(e.target.value)
                setAltSaved(false)
              }}
              placeholder="Describe the image"
              className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-field)] px-3 py-2 text-[13px] text-[#f5efe0] outline-none placeholder:text-[#7a8a80] focus:border-[var(--admin-gold)] focus:bg-[var(--admin-field-hover)]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void onPick(e)}
            />
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-[#d4af37] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#071a12] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Working…' : hasImage ? 'Replace image' : 'Upload image'}
            </button>

            {hasImage ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onRemove()}
                className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-red-400/60 hover:text-red-300 disabled:opacity-40"
              >
                Remove
              </button>
            ) : null}

            {hasImage && !altSaved ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onSaveAlt()}
                className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-40"
              >
                Save alt text
              </button>
            ) : null}

            {altSaved ? (
              <span className="font-mono-metric text-[11px] text-emerald-300">
                Saved ✓
              </span>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
