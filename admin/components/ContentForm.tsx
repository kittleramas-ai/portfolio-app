import { useRef, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import type { ZodType } from 'zod'

import { saveSettingsGroupFn } from '../server/api.ts'
import type { SettingsGroupKey, SiteSettings } from '../server/settings-schema.ts'
import { SETTINGS_GROUPS } from '../server/settings-schema.ts'
import {
  Card,
  buttonClass,
  inputClass,
  readServerError,
} from './fields.tsx'
import type { SaveState } from './fields.tsx'

/**
 * The subset of JSON Schema that `z.toJSONSchema` emits for our content
 * schemas. Used to drive the form rather than introspecting Zod internals: the
 * JSON Schema conversion is a documented public API, whereas reading `_def`
 * would tie the admin to whatever shape this Zod version happens to use.
 */
type JsonSchema = {
  type?: string
  enum?: string[]
  anyOf?: JsonSchema[]
  items?: JsonSchema
  properties?: Record<string, JsonSchema>
  default?: unknown
  maxLength?: number
  description?: string
  minimum?: number
}

/** Per-field overrides, keyed by dotted path with `*` for "any list item". */
type FieldHint = {
  /** Force a multi-line box even for short copy. */
  multiline?: boolean
  rows?: number
  /**
   * Render a string array as a checkbox list over another array of objects in
   * the same group, instead of as free text. Value is the sibling path.
   */
  choicesFrom?: string
  /** Property on the referenced object used as each choice's label. */
  titleKey?: string
  /** Hides a field without removing it from the data. */
  hidden?: true
}

/**
 * Per-field overrides, keyed by dotted path with `*` for "any list item".
 *
 * `Partial` rather than `Record`: the file indexes this map with computed paths
 * that legitimately miss, and a total Record would type every lookup as defined
 * and make the `?.` reads look redundant to the linter.
 */
/**
 * The only field that genuinely cannot be rendered generically: `featuredIds`
 * is a list of book ids, and a free-text list of ids would be unusable. Every
 * other case is a convention handled in code below — `*Icon` fields become icon
 * pickers, `*Href` fields get an anchor hint, long strings become textareas — so
 * this table stays short.
 */
const HINTS: Partial<Record<string, FieldHint>> = {
  'books.featuredIds': { choicesFrom: 'books', titleKey: 'title' },
  'books.annotation': { rows: 2 },
}

const ACCENTS = [
  'gold',
  'cyan',
  'emerald',
  'indigo',
  'violet',
  'sky',
] as const

/** A representative slice of Material Symbols for the icon datalist. */
const ICON_SUGGESTIONS = [
  'rocket_launch',
  'school',
  'campaign',
  'hub',
  'cloud',
  'bolt',
  'verified_user',
  'currency_rupee',
  'menu_book',
  'payments',
  'terminal',
  'cognition',
  'public',
  'groups',
  'military_tech',
  'memory',
  'account_tree',
  'award_star',
  'workspace_premium',
  'arrow_forward',
  'arrow_outward',
  'volunteer_activism',
  'north',
]

/** Uppercase the acronyms that camelCase splitting would otherwise mangle. */
const ACRONYMS = new Set(['cta', 'href', 'url', 'bio', 'id', 'seo'])

function humanise(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
  if (words.length === 1) return words[0].toUpperCase()
  return words
    .map((w, i) =>
      i === 0
        ? ACRONYMS.has(w.toLowerCase())
          ? w.toUpperCase()
          : w.charAt(0).toUpperCase() + w.slice(1)
        : ACRONYMS.has(w.toLowerCase())
          ? w.toUpperCase()
          : w,
    )
    .join(' ')
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8)
  }
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Build a blank row for "Add".
 *
 * Prefers cloning the existing last row: a new venture card should arrive with
 * sensible values already filled in, and copying the previous card is how the
 * hand-written markup used to work. Falls back to the schema's own defaults when
 * the list is empty, and to type-appropriate blanks after that.
 */
function blankItem(
  siblings: (Record<string, unknown> | undefined)[],
  objectSchema: JsonSchema | undefined,
): Record<string, unknown> {
  const source = siblings[siblings.length - 1]
  if (source) {
    const clone: Record<string, unknown> = { ...source }
    if (typeof clone.id === 'string') clone.id = newId()
    return clone
  }

  const item: Record<string, unknown> = {}
  for (const [key, prop] of Object.entries(objectSchema?.properties ?? {})) {
    if (key === 'id') {
      item.id = newId()
      continue
    }
    if (prop.default !== undefined) {
      item[key] = prop.default
      continue
    }
    switch (prop.type) {
      case 'number':
      case 'integer':
        item[key] = 0
        break
      case 'boolean':
        item[key] = false
        break
      case 'array':
        item[key] = []
        break
      case 'object':
        item[key] = blankItem([], prop)
        break
      case 'string':
        item[key] = prop.enum?.[0] ?? ''
        break
      default:
        item[key] = null
    }
  }
  return item
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** Resolve `a.b.c` against the group value, with `*` walking into list items. */
function atPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (Array.isArray(acc)) return acc[0]
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, value)
}

/** `countTo` is `number | null`; a blank box means "no counter, plain text". */
function nullishNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

function toSchema(zod: ZodType): JsonSchema {
  // `unrepresentable: 'any'` keeps exotic checks (`.url()`, `.regex()`) from
  // throwing on conversion — the admin only needs the shape, and the Zod schema
  // remains the thing that actually validates on save.
  const json = zod.toJSONSchema({
    io: 'output',
    unrepresentable: 'any',
  }) as JsonSchema
  return json
}

/* ------------------------------------------------------------------ the form */

export function ContentForm<TGroup extends SettingsGroupKey>({
  group,
  schema,
  value,
  onChange,
}: {
  group: TGroup
  schema: ZodType
  value: SiteSettings[TGroup]
  onChange: (next: SiteSettings[TGroup]) => void
}) {
  const [state, setState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  const json = toSchema(schema)
  const meta = SETTINGS_GROUPS.find((g) => g.key === group)

  async function save() {
    setState('saving')
    setError(null)
    try {
      await saveSettingsGroupFn({ data: { group, value } })
      setState('saved')
      setTimeout(() => setState('idle'), 2500)
    } catch (err) {
      setState('error')
      setError(readServerError(err))
    }
  }

  return (
    <Card
      title={meta?.label ?? group}
      description={meta?.description ?? ''}
      state={state}
      error={error}
      onSave={save}
    >
      {/*
        ObjectFields is typed in terms of plain JSON records because it is
        driven by the JSON Schema, not by any one group's TS type. The group's
        real type cannot be threaded through without either a generic constraint
        TS cannot verify on an indexed access, or casting every leaf field, so
        the boundary is asserted once here instead of at every call site.
      */}
      <ObjectFields
        object={json}
        value={value}
        path={group}
        onChange={
          onChange as unknown as (next: Record<string, unknown>) => void
        }
      />
    </Card>
  )
}

function ObjectFields({
  object,
  value,
  path,
  onChange,
}: {
  object: JsonSchema
  value: Record<string, unknown>
  path: string
  onChange: (next: Record<string, unknown>) => void
}) {
  const entries = Object.entries(object.properties ?? {})
  return (
    <div className="space-y-5">
      {entries.map(([key, prop]) => {
        const childPath = `${path}.${key}`
        // `id` is the row key React and the list editor use. Showing it would
        // invite a manager to break both by editing it, so it stays internal.
        const hidden = key === 'id' || HINTS[childPath]?.hidden
        if (hidden) return null

        return (
          <Field
            key={key}
            schema={prop}
            value={value[key]}
            label={humanise(key)}
            path={childPath}
            groupValue={value}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        )
      })}
    </div>
  )
}

function Field({
  schema,
  value,
  label,
  path,
  groupValue,
  onChange,
}: {
  schema: JsonSchema
  value: unknown
  label: string
  path: string
  groupValue: Record<string, unknown>
  onChange: (next: unknown) => void
}) {
  const hint = HINTS[path]
  const key = path.split('.').pop() ?? ''

  if (schema.type === 'object') {
    return (
      <fieldset className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row)] p-4">
        <legend className="px-1 font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
          {label}
        </legend>
        <ObjectFields
          object={schema}
          value={
            value && typeof value === 'object' && !Array.isArray(value)
              ? (value as Record<string, unknown>)
              : {}
          }
          path={path}
          onChange={onChange}
        />
      </fieldset>
    )
  }

  if (schema.type === 'array') {
    const itemSchema = schema.items
    const items = Array.isArray(value) ? value : []

    if (itemSchema?.type === 'object') {
      return (
        <ObjectList
          label={label}
          description={schema.description}
          items={items as Record<string, unknown>[]}
          itemSchema={itemSchema}
          path={path}
          onChange={onChange}
        />
      )
    }

    if (hint?.choicesFrom) {
      const source = atPath(groupValue, hint.choicesFrom)
      const options = Array.isArray(source)
        ? (source as Record<string, unknown>[])
        : []
      const titleKey = hint.titleKey ?? 'label'
      const selected = new Set(items.map(String))
      return (
        <fieldset className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row)] p-4">
          <legend className="px-1 font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
            {label}
          </legend>
          <p className="mb-3 text-[12px] text-[#7a8a80]">
            {schema.description ??
              `Checked items appear in this order, up to three.`}
          </p>
          {options.map((option) => {
            const id = String(option[idKey(options[0])])
            const checked = selected.has(id)
            return (
              <label
                key={id}
                className="flex items-center gap-2.5 py-1.5 text-[13px] text-[#f5efe0]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...items, id]
                        : items.filter((v) => String(v) !== id),
                    )
                  }
                  className="size-4 accent-[#d4af37]"
                />
                {String(option[titleKey] ?? id)}
              </label>
            )
          })}
        </fieldset>
      )
    }

    return (
      <StringList
        label={label}
        description={schema.description}
        items={items.map(String)}
        multiline={hint?.multiline}
        path={path}
        onChange={onChange}
      />
    )
  }

  if (schema.type === 'boolean') {
    return (
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-[#d4af37]"
        />
        <span className="font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
          {label}
        </span>
      </label>
    )
  }

  // Nullable numbers arrive as `anyOf: [number, null]`.
  if (schema.anyOf?.some((s) => s.type === 'null')) {
    const numeric = schema.anyOf.find((s) => s.type !== 'null')
    return (
      <Field
        schema={numeric ?? { type: 'number' }}
        value={nullishNumber(value)}
        label={label}
        path={path}
        groupValue={groupValue}
        onChange={onChange}
      />
    )
  }

  if (schema.enum) {
    return (
      <label className="block">
        <span className="mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
          {label}
        </span>
        <select
          value={String(value ?? schema.enum[0])}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {schema.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {schema.description ? (
          <span className="mt-1.5 block text-[12px] text-[#7a8a80]">
            {schema.description}
          </span>
        ) : null}
      </label>
    )
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return (
      <label className="block">
        <span className="mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
          {label}
        </span>
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          min={schema.minimum}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          className={inputClass}
        />
        {schema.description ? (
          <span className="mt-1.5 block text-[12px] text-[#7a8a80]">
            {schema.description}
          </span>
        ) : null}
      </label>
    )
  }

  // Strings, including the null union collapsed to ''.
  const text = typeof value === 'string' ? value : value == null ? '' : String(value)
  /** `icon` bare as well as `*Icon`: list items are addressed by their plain
   *  key, so `ventures.pills.*.icon` would otherwise miss the picker. */
  const isIcon = key === 'icon' || key.endsWith('Icon')
  /**
   * `maxLength` is the multiline signal, because a 300-character limit means
   * display copy and a 40-character one means a label. Links are the
   * exception: `line(200)` allows a long URL, but a link is still one line, and
   * a tall box for "#advisory" wastes the most eye-catching space on the form.
   */
  const isLink = key.endsWith('Href') || key.endsWith('Url')
  const isImageUrl = key.endsWith('Url')
  const multiline =
    hint?.multiline || (!isLink && !isIcon && (schema.maxLength ?? 0) >= 200)

  if (isIcon) {
    return (
      <label className="block">
        <span className="mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="material-symbols-outlined shrink-0 text-[24px] leading-none text-[#f5efe0]"
          >
            {normaliseIconName(text)}
          </span>
          <input
            list="material-symbols"
            value={text}
            onChange={(e) => onChange(normaliseIconName(e.target.value))}
            className={inputClass}
            placeholder="menu_book"
          />
        </div>
        <span className="mt-1.5 block text-[12px] text-[#7a8a80]">
          A Google Material Symbols name, in snake_case. Typing the label
          works too — spaces and capitals become underscores as you go.
        </span>
        {/* The full catalogue is ~3000 icons, far more than the datalist can
            carry, so the picker links out to it rather than trying to embed it. */}
        <a
          href="https://fonts.google.com/icons"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--admin-gold)] underline underline-offset-2 hover:opacity-80"
        >
          Browse Material Symbols
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[14px]"
          >
            open_in_new
          </span>
        </a>
        <datalist id="material-symbols">
          {ICON_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>
    )
  }

  if (multiline) {
    return (
      <label className="block">
        <span className="mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
          {label}
        </span>
        <textarea
          value={text}
          rows={hint?.rows ?? 3}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {countHint(schema, text, true)}
      </label>
    )
  }

  return (
    <label className="block">
      <span className="mb-1.5 block font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type={key.endsWith('Url') ? 'url' : 'text'}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {isImageUrl ? <FilePickerButton onUploaded={(url) => onChange(url)} /> : null}
      </div>
      {countHint(schema, text, false)}
      {isImageUrl ? (
        <span className="mt-1.5 block text-[12px] text-[#7a8a80]">
          JPEG, PNG or WebP, max 5 MB. The URL updates once the upload finishes.
        </span>
      ) : null}
      {key.endsWith('Href') && !schema.description ? (
        <span className="mt-1.5 block text-[12px] text-[#7a8a80]">
          A #section anchor on this page, or a full URL.
        </span>
      ) : null}
    </label>
  )
}

function FilePickerButton({
  onUploaded,
}: {
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
      })
      const json = (await res.json()) as {
        ok: boolean
        error?: string
        url?: string
      }
      if (!json.ok || !json.url) {
        setError(json.error ?? 'Upload failed.')
        return
      }
      onUploaded(json.url)
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-lg border border-[var(--admin-border)] bg-transparent px-3 py-2 font-mono-metric text-[11px] uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-[var(--admin-gold)] hover:text-[var(--admin-gold)] disabled:cursor-not-allowed disabled:opacity-35"
      >
        {busy ? 'Uploading…' : 'Choose file'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />
      {error ? (
        <span className="absolute left-0 top-full mt-1 whitespace-nowrap text-[11px] text-red-400">
          {error}
        </span>
      ) : null}
    </span>
  )
}

/**
 * The note under a field: an example, and — only where it is actionable — a
 * character count.
 *
 * The count is deliberately suppressed on short single-line fields. It was on
 * every input at first, and a page of "27 / 60 characters" under labels like
 * "Menu" reads as an error state that does not exist. It earns its place on a
 * textarea, where the limit is genuinely hard to hit by eye, and on any field
 * once the value is within a quarter of the cap.
 */
/**
 * Turn what the manager can see on Google's icon page into the ligature name
 * the site actually renders.
 *
 * The catalogue shows "Add Circle" and aliases like "+ add, circle, counter…",
 * so copy-pasting or typing either of those stores a string that renders as
 * nothing. Lowercasing and folding to snake_case as they type removes the whole
 * class of mistake rather than reporting it after the fact.
 */
function normaliseIconName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function countHint(schema: JsonSchema, text: string, multiline: boolean) {
  const max = schema.maxLength
  if (!max) return null
  const ratio = text.length / max
  const showCount = multiline || ratio >= 0.75
  const over = text.length > max
  if (!showCount && !schema.description) return null
  return (
    <span
      className={`mt-1.5 block text-[12px] ${over ? 'text-red-300' : 'text-[#7a8a80]'}`}
    >
      {showCount ? `${text.length} / ${max} characters` : null}
      {showCount && schema.description ? ' — ' : null}
      {schema.description ?? null}
    </span>
  )
}

/** Ids live under a fixed key; read it off the first row rather than assuming. */
function idKey(sample: Record<string, unknown> | undefined): string {
  if (sample && 'id' in sample) return 'id'
  return 'id'
}

/* ------------------------------------------------------------ list editors */

function RowControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number
  count: number
  onMove: (to: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        title="Move up"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        className={buttonClass}
      >
        ↑
      </button>
      <button
        type="button"
        title="Move down"
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        className={buttonClass}
      >
        ↓
      </button>
      <button
        type="button"
        title="Remove"
        aria-label="Remove"
        onClick={onRemove}
        className={`${buttonClass} hover:border-red-400/60 hover:text-red-300`}
      >
        <Trash2 size={13} aria-hidden />
      </button>
    </div>
  )
}

function StringList({
  label,
  description,
  items,
  multiline,
  path,
  onChange,
}: {
  label: string
  description?: string
  items: string[]
  multiline?: boolean
  path: string
  onChange: (next: string[]) => void
}) {
  return (
    <fieldset className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row)] p-4">
      <legend className="px-1 font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
        {label}
      </legend>
      {description ? (
        <p className="mb-3 text-[12px] text-[#7a8a80]">{description}</p>
      ) : null}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={`${path}-${i}`} className="flex items-start gap-2">
            <span className="w-5 shrink-0 pt-2.5 text-center font-mono-metric text-[11px] text-[#7a8a80]">
              {i + 1}
            </span>
            {multiline ? (
              <textarea
                value={item}
                rows={2}
                onChange={(e) => {
                  const next = items.slice()
                  next[i] = e.target.value
                  onChange(next)
                }}
                className={inputClass}
              />
            ) : (
              <input
                value={item}
                onChange={(e) => {
                  const next = items.slice()
                  next[i] = e.target.value
                  onChange(next)
                }}
                className={inputClass}
              />
            )}
            <div className="pt-0.5">
              <RowControls
                index={i}
                count={items.length}
                onMove={(to) => onChange(move(items, i, to))}
                onRemove={() => onChange(items.filter((_, j) => j !== i))}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className={`${buttonClass} mt-3 inline-flex items-center gap-1.5`}
      >
        <Plus size={13} aria-hidden />
        Add item
      </button>
    </fieldset>
  )
}

function ObjectList({
  label,
  description,
  items,
  itemSchema,
  path,
  onChange,
}: {
  label: string
  description?: string
  items: Record<string, unknown>[]
  itemSchema: JsonSchema
  path: string
  onChange: (next: Record<string, unknown>[]) => void
}) {
  const [open, setOpen] = useState<Record<number, boolean>>({})

  /** Best-effort title for the collapsed row. */
  const titleFor = (item: Record<string, unknown>) => {
    for (const key of ['title', 'label', 'heading', 'question', 'name', 'badge']) {
      const v = item[key]
      if (typeof v === 'string' && v.trim()) return v
    }
    return String(item.id ?? 'Item')
  }

  return (
    <fieldset className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row)] p-4">
      <legend className="px-1 font-mono-metric text-[11px] uppercase tracking-[0.18em] text-[#b8c4bb]">
        {label}
      </legend>
      {description ? (
        <p className="mb-3 text-[12px] text-[#7a8a80]">{description}</p>
      ) : null}

      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = open[i] ?? false
          return (
            <div
              key={String(item.id ?? i)}
              className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row)] transition-colors hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-row-hover)]"
            >
              <div className="flex items-center gap-2 p-2.5">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen }))}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {isOpen ? (
                    <ChevronDown size={14} className="shrink-0 text-[#7a8a80]" aria-hidden />
                  ) : (
                    <ChevronRight size={14} className="shrink-0 text-[#7a8a80]" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#f5efe0]">
                    {titleFor(item)}
                  </span>
                </button>
                <RowControls
                  index={i}
                  count={items.length}
                  onMove={(to) => onChange(move(items, i, to))}
                  onRemove={() => {
                    const next = items.filter((_, j) => j !== i)
                    onChange(next)
                    setOpen((o) => {
                      const shifted = { ...o }
                      delete shifted[i]
                      for (let j = i; j < items.length; j++) {
                        if (j + 1 in o) shifted[j] = o[j + 1]
                      }
                      return shifted
                    })
                  }}
                />
              </div>

              {isOpen ? (
                <div className="border-t border-[var(--admin-border)] p-4">
                  <ObjectFields
                    object={itemSchema}
                    value={item}
                    path={`${path}.*`}
                    onChange={(next) => {
                      const list = items.slice()
                      list[i] = next
                      onChange(list)
                    }}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, blankItem(items, itemSchema)])}
        className={`${buttonClass} mt-3 inline-flex items-center gap-1.5`}
      >
        <Plus size={13} aria-hidden />
        Add {label.toLowerCase().replace(/s$/, '')}
      </button>

      {items.length === 0 ? (
        <p className="mt-2 text-[12px] text-amber-300">
          This list is empty, so nothing will render on the site.
        </p>
      ) : null}
    </fieldset>
  )
}

export { ACCENTS }