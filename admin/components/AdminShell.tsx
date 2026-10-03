import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  CircleCheckBig,
  ExternalLink,
  FileText,
  Hash,
  Images,
  Info,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  Newspaper,
  PanelBottom,
  Quote,
  ScanText,
  Trophy,
  TriangleAlert,
  Type,
  Upload,
  User,
} from 'lucide-react'
import type { ZodType } from 'zod'

import { currentAdminFn, getAdminSettingsFn, logoutFn } from '../server/api.ts'
import {
  contactSettingsSchema,
  SETTINGS_GROUPS,
  SITE_SETTINGS_SHAPE,
} from '../server/settings-schema.ts'
import type { SettingsGroupKey, SiteSettings } from '../server/settings-schema.ts'
import { AdminMedia, useAdminMedia } from './AdminMedia.tsx'
import { ContentForm } from './ContentForm.tsx'
import { ErrorNote, isUnauthorized } from './fields.tsx'

/**
 * Icons are keyed by settings group rather than stored alongside the schema,
 * because they are React components and the schema module is also imported by
 * the server. A missing key falls back to a neutral icon rather than crashing.
 */
const GROUP_ICONS: Record<SettingsGroupKey, LucideIcon> = {
  navbar: Menu,
  footer: PanelBottom,
  hero: Type,
  milestones: Hash,
  about: User,
  ventures: Building2,
  achievements: Trophy,
  keynotes: Mic,
  governance: Landmark,
  perspectives: Newspaper,
  books: BookOpen,
  quote: Quote,
  advisory: FileText,
  contact: MessageCircle,
}

type TabKey = 'overview' | 'images' | SettingsGroupKey

const TABS: ReadonlyArray<{
  key: TabKey
  label: string
  icon: LucideIcon
  title: string
  blurb: string
}> = [
  {
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    title: 'Dashboard',
    blurb: 'Everything editable on the site, and anything still missing.',
  },
  {
    key: 'images',
    label: 'Images',
    icon: Images,
    title: 'Images',
    blurb: 'The four slots the site reads its photography from.',
  },
  // Every other tab is derived from SETTINGS_GROUPS, so registering a section's
  // schema is all it takes for it to appear here.
  ...SETTINGS_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    icon: GROUP_ICONS[g.key],
    title: g.label,
    blurb: g.description,
  })),
]

/**
 * Admin dashboard — the manager-facing surface.
 *
 * A sidebar of sections instead of one long scroll: reaching one section's copy
 * should not mean scrolling past every other section's copy, and there has to
 * be somewhere to answer "is anything missing yet?" — the thing a manager
 * actually opens the panel to find out.
 *
 * One form per settings group, saved independently. Splitting the writes means
 * a validation failure in the hero copy cannot block saving the WhatsApp
 * number, and the two rows never race each other.
 *
 * The forms are generated from the group's Zod schema rather than hand-written,
 * so a section with four cards and fourteen fields needs no bespoke UI code —
 * only a schema. Two forms predate this and were deleted when it landed.
 */
export function AdminShell() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('overview')
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [who, setWho] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Media is loaded here rather than inside <AdminMedia> so the Overview tiles
  // and the Images tab read one source of truth.
  const { media, error: mediaError, applyChange } = useAdminMedia()

  useEffect(() => {
    // A ref, not a `let`: the linter narrows a closure-mutated `let` to the
    // literal `false` and then flags `if (cancelled)` as dead code, which it is
    // not — React sets it in the cleanup below.
    const cancelled = { current: false }
    void (async () => {
      try {
        const [s, me] = await Promise.all([
          getAdminSettingsFn(),
          currentAdminFn(),
        ])
        if (cancelled.current) return
        setSettings(s.settings)
        setWho(me?.displayName ?? me?.email ?? null)
      } catch (err) {
        if (cancelled.current) return
        // A 401 here means the session lapsed mid-visit: send them back to login.
        if (isUnauthorized(err)) {
          await router.navigate({ to: '/admin/login' })
          return
        }
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load settings',
        )
      }
    })()
    return () => {
      cancelled.current = true
    }
  }, [router])

  async function signOut() {
    await logoutFn()
    await router.invalidate()
    await router.navigate({ to: '/admin/login' })
  }

  const active = TABS.find((t) => t.key === tab) ?? TABS[0]

  // Computed once here so the sidebar badges and the Overview checklist can
  // never disagree — they read the same array.
  const checks = settings ? collectChecks(settings, media) : []
  const outstanding = (key: TabKey) =>
    checks.filter((c) => c.tab === key && c.severity === 'warn').length

  const isGroupTab = (key: TabKey): key is SettingsGroupKey =>
    key !== 'overview' && key !== 'images'

  return (
    <div className="admin-shell min-h-svh bg-[var(--admin-page)] lg:flex">
      <Sidebar
        tab={tab}
        onTab={setTab}
        who={who}
        onSignOut={signOut}
        outstanding={outstanding}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Section switcher, in place of the sidebar on narrow screens. */}
        <div className="border-b border-[var(--admin-border)] bg-[var(--admin-panel)] lg:hidden">
          <div className="flex gap-1 overflow-x-auto px-4 py-3">
            {TABS.map((t) => (
              <TabChip
                key={t.key}
                tab={t}
                active={t.key === tab}
                onPick={setTab}
              />
            ))}
          </div>
        </div>

        <header className="border-b border-[var(--admin-border)] bg-[var(--admin-panel)] px-6 py-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono-metric text-[10px] uppercase tracking-[0.24em] text-[#7a8a80]">
                Content Manager
              </p>
              <h1 className="font-display text-2xl uppercase text-[#f5efe0]">
                {active.title}
              </h1>
              <p className="mt-1.5 text-[13px] text-[#7a8a80]">{active.blurb}</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] px-4 py-2 font-mono-metric text-[11px] uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              View the site
              <ExternalLink size={13} aria-hidden />
            </a>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10">
          {loadError ? (
            <ErrorNote>{loadError}</ErrorNote>
          ) : !settings ? (
            <p className="text-[#7a8a80]">Loading settings…</p>
          ) : tab === 'overview' ? (
            <Overview
              settings={settings}
              media={media}
              mediaError={mediaError}
              checks={checks}
              onGoTo={setTab}
            />
          ) : tab === 'images' ? (
            mediaError ? (
              <ErrorNote>{mediaError}</ErrorNote>
            ) : media ? (
              <AdminMedia media={media} onChanged={applyChange} />
            ) : (
              <p className="text-[#7a8a80]">Loading images…</p>
            )
          ) : isGroupTab(tab) ? (
            <ContentForm
              group={tab}
              schema={SITE_SETTINGS_SHAPE[tab] as ZodType}
              value={settings[tab]}
              onChange={(next) =>
                setSettings((s) => (s ? { ...s, [tab]: next } : s))
              }
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}

function Sidebar({
  tab,
  onTab,
  who,
  onSignOut,
  outstanding,
}: {
  tab: TabKey
  onTab: (key: TabKey) => void
  who: string | null
  onSignOut: () => void
  outstanding: (key: TabKey) => number
}) {
  return (
    <aside className="hidden shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-panel)] lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-64 lg:flex-col">
      <div className="border-b border-[var(--admin-border)] px-6 py-5">
        <p className="font-mono-metric text-[10px] uppercase tracking-[0.24em] text-[#7a8a80]">
          Private Access
        </p>
        <h1 className="font-display text-xl uppercase text-[#f5efe0]">
          Site Admin
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {TABS.map((t) => (
          <TabButton
            key={t.key}
            tab={t}
            active={t.key === tab}
            onPick={onTab}
            count={outstanding(t.key)}
          />
        ))}
      </nav>

      <div className="border-t border-[var(--admin-border)] p-4">
        {who ? (
          <p className="mb-3 truncate font-mono-metric text-[11px] text-[#b8c4bb]">
            {who}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] px-4 py-2.5 font-mono-metric text-[11px] uppercase tracking-wider text-[#b8c4bb] transition-colors hover:border-red-400/60 hover:text-red-300"
        >
          <LogOut size={13} aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function TabButton({
  tab,
  active,
  onPick,
  count,
}: {
  tab: (typeof TABS)[number]
  active: boolean
  onPick: (key: TabKey) => void
  count: number
}) {
  const Icon = tab.icon
  return (
    <button
      type="button"
      onClick={() => onPick(tab.key)}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
        active
          ? 'bg-[#d4af37] font-bold uppercase tracking-wide text-[#071a12]'
          : 'text-[#b8c4bb] hover:bg-[var(--admin-row-hover)] hover:text-[#f5efe0]'
      }`}
    >
      <Icon size={15} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{tab.label}</span>
      {count > 0 ? (
        <span
          title={`${count} item${count === 1 ? '' : 's'} needing attention`}
          className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono-metric text-[10px] leading-none ${
            active
              ? 'bg-[#071a12]/25 text-[#071a12]'
              : 'bg-[#d4af37] text-[#071a12]'
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

function TabChip({
  tab,
  active,
  onPick,
}: {
  tab: (typeof TABS)[number]
  active: boolean
  onPick: (key: TabKey) => void
}) {
  const Icon = tab.icon
  return (
    <button
      type="button"
      onClick={() => onPick(tab.key)}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-mono-metric text-[11px] uppercase tracking-wider transition-colors ${
        active
          ? 'bg-[#d4af37] font-bold text-[#071a12]'
          : 'text-[#b8c4bb] hover:bg-[var(--admin-row-hover)]'
      }`}
    >
      <Icon size={13} aria-hidden />
      {tab.label}
    </button>
  )
}

/* ---------------------------------------------------------------- overview */

function Overview({
  settings,
  media,
  mediaError,
  checks,
  onGoTo,
}: {
  settings: SiteSettings
  media: ReturnType<typeof useAdminMedia>['media']
  mediaError: string | null
  checks: Check[]
  onGoTo: (key: TabKey) => void
}) {
  const entries = media?.entries ?? []
  const live = entries.filter((e) => e.url).length
  const described = entries.filter((e) => e.url && e.altText.trim()).length
  const contactOk = contactSettingsSchema.safeParse(settings.contact).success
  const sectionCount = SETTINGS_GROUPS.length

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon={ScanText}
          label="Sections editable"
          value={String(sectionCount)}
          note="every section has a form"
          tone="good"
        />
        <Tile
          icon={Images}
          label="Images live"
          value={media ? `${live}/${entries.length}` : '—'}
          note={
            media
              ? `${described} of ${live} described`
              : 'slots with an upload'
          }
          tone={live === entries.length && live > 0 ? 'good' : 'plain'}
          meter={live === 0 ? 0 : described / live}
        />
        <Tile
          icon={MessageCircle}
          label="WhatsApp"
          value={contactOk ? 'Live' : 'Not set'}
          note={
            settings.contact.whatsappNumber
              ? `wa.me/${settings.contact.whatsappNumber}`
              : 'no number configured'
          }
          tone={contactOk ? 'good' : 'warn'}
        />
        <Tile
          icon={Upload}
          label="Uploads"
          value={media ? (media.available ? 'Open' : 'Closed') : '—'}
          note={
            mediaError
              ? 'could not check'
              : media?.available
                ? 'accepts jpg, png, webp'
                : (media?.unavailableReason ?? '')
          }
          tone={mediaError ? 'warn' : media?.available ? 'good' : 'warn'}
        />
      </div>

      <section>
        <h2 className="mb-4 font-mono-metric text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">
          Needs attention
        </h2>
        {mediaError ? (
          <ErrorNote>{mediaError}</ErrorNote>
        ) : !media ? (
          <p className="text-[#7a8a80]">Checking the image slots…</p>
        ) : checks.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#2e7d5b]/50 bg-[#0e2419] p-5">
            <CircleCheckBig
              size={17}
              className="mt-0.5 shrink-0 text-emerald-300"
              aria-hidden
            />
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-emerald-200">
                Nothing outstanding
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-emerald-100/80">
                Every section has content and every uploaded image is described.
                Changes you save appear on the site immediately.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {checks.map((check) => (
              <li key={check.id}>
                <button
                  type="button"
                  onClick={() => onGoTo(check.tab)}
                  className="flex w-full items-start gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 text-left transition-colors hover:border-[#d4af37]/50"
                >
                  {check.severity === 'warn' ? (
                    <TriangleAlert
                      size={17}
                      className="mt-0.5 shrink-0 text-amber-300"
                      aria-hidden
                    />
                  ) : (
                    <Info
                      size={17}
                      className="mt-0.5 shrink-0 text-sky-300"
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-[#f5efe0]">
                      {check.title}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#7a8a80]">
                      {check.detail}
                    </span>
                  </span>
                  <span className="shrink-0 self-center font-mono-metric text-[10px] uppercase tracking-wider text-[#d4af37]">
                    Fix →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
        <h2 className="font-mono-metric text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">
          Every section, and where it shows up
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {WHERE_IT_SHOWS.map((row) => (
            <div
              key={row.field}
              className="flex flex-wrap items-baseline gap-x-2 text-[13px]"
            >
              <dt className="font-semibold text-[#f5efe0]">{row.field}</dt>
              <dd className="text-[#7a8a80]">→ {row.where}</dd>
            </div>
          ))}
        </dl>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 font-mono-metric text-[11px] uppercase tracking-wider text-[#d4af37] underline-offset-4 hover:underline"
        >
          View the site
          <ExternalLink size={12} aria-hidden />
        </a>
      </section>
    </div>
  )
}

const WHERE_IT_SHOWS = [
  { field: 'WhatsApp number', where: 'the floating button, bottom-right of every page' },
  { field: 'Hero statement', where: 'the opening line on the home page' },
  { field: 'Hero portrait', where: 'the standing photo on the home page' },
  { field: 'Signature', where: 'the header and the footer' },
  { field: 'Menu', where: 'the full-screen navigation overlay' },
  { field: 'Footer', where: 'the footer columns and copyright bar' },
  { field: 'Milestones', where: 'the four counters under the hero' },
  { field: 'About', where: 'the thesis section and the three pillars' },
  { field: 'Ventures', where: 'the four business cards' },
  { field: 'Honors Deck', where: 'the interactive accolades deck' },
  { field: 'Keynotes', where: 'the speaking engagements section' },
  { field: 'Governance', where: 'the founder roles section' },
  { field: 'Perspectives', where: 'the three articles' },
  { field: 'Books', where: 'the reading shelf and featured quote' },
  { field: 'Quote', where: 'the pull-quote between sections' },
  { field: 'Advisory Form', where: 'the enquiry form copy' },
] as const

type Check = {
  id: string
  severity: 'warn' | 'info'
  title: string
  detail: string
  tab: TabKey
}

/**
 * Derived from the same schemas the save button validates against, so the
 * checklist cannot disagree with what a save would actually accept.
 *
 * The section checks are written as loops rather than one block per section:
 * with fourteen sections, a hand-written checklist is fourteen places to forget
 * to update, and the failures are silent — a blank heading just renders blank.
 */
function collectChecks(
  settings: SiteSettings,
  media: ReturnType<typeof useAdminMedia>['media'],
): Check[] {
  const checks: Check[] = []
  if (!media) return checks

  const entries = media.entries
  const live = entries.filter((e) => e.url)
  const unnamed = live.filter((e) => !e.altText.trim())

  if (live.length === 0) {
    checks.push({
      id: 'no-images',
      severity: 'info',
      title: 'No images uploaded',
      detail:
        'Every slot is still using its bundled asset, which is fine — upload your own photography whenever you are ready.',
      tab: 'images',
    })
  }
  if (unnamed.length > 0) {
    checks.push({
      id: 'missing-alt',
      severity: 'warn',
      title:
        unnamed.length === 1
          ? 'One image has no alt text'
          : `${unnamed.length} images have no alt text`,
      detail: `Screen readers announce ${unnamed.length === 1 ? 'it' : 'them'} as an unnamed image. ${unnamed
        .map((e) => media.slots[e.slot].label)
        .join(', ')}.`,
      tab: 'images',
    })
  }
  if (!media.available) {
    checks.push({
      id: 'uploads-closed',
      severity: 'warn',
      title: 'Uploads are switched off',
      detail: media.unavailableReason ?? 'The server is not accepting uploads.',
      tab: 'images',
    })
  }

  for (const group of SETTINGS_GROUPS) {
    const value = settings[group.key] as Record<string, unknown>

    // Any group whose own schema rejects its stored value is broken; say so
    // rather than letting the page render something half-empty.
    if (!SITE_SETTINGS_SHAPE[group.key].safeParse(value).success) {
      checks.push({
        id: `invalid-${group.key}`,
        severity: 'warn',
        title: `${group.label} has invalid content`,
        detail: `The saved ${group.label.toLowerCase()} data no longer matches its schema, so the site is showing the built-in defaults for it. Re-save the tab to repair it.`,
        tab: group.key,
      })
      continue
    }

    const heading = value.heading
    if (typeof heading === 'string' && !heading.trim()) {
      checks.push({
        id: `empty-heading-${group.key}`,
        severity: 'warn',
        title: `The ${group.label} heading is empty`,
        detail: 'That section opens with a blank headline.',
        tab: group.key,
      })
    }

    for (const [key, list] of Object.entries(value)) {
      if (
        Array.isArray(list) &&
        list.length === 0 &&
        key !== 'featuredIds' &&
        key !== 'suffix' &&
        typeof list !== 'string'
      ) {
        checks.push({
          id: `empty-list-${group.key}-${key}`,
          severity: 'warn',
          title: `${group.label}: nothing in "${key}"`,
          detail: `That list is empty, so nothing from it renders on the site.`,
          tab: group.key,
        })
      }
    }
  }

  const { whatsappNumber, contactEmail } = settings.contact
  if (!contactSettingsSchema.safeParse(settings.contact).success) {
    checks.push({
      id: 'bad-whatsapp',
      severity: 'warn',
      title: 'The WhatsApp button is not working',
      detail: whatsappNumber
        ? `"${whatsappNumber}" is not a valid number — country code and digits only, no + or spaces.`
        : 'No number is set, so the floating button on every page goes nowhere.',
      tab: 'contact',
    })
  }
  if (!contactEmail.trim()) {
    checks.push({
      id: 'no-email',
      severity: 'info',
      title: 'No public contact email',
      detail: 'Optional, but the contact section is empty without one.',
      tab: 'contact',
    })
  }

  return checks
}

function Tile({
  icon: Icon,
  label,
  value,
  note,
  tone,
  meter,
}: {
  icon: typeof Images
  label: string
  value: string
  note: string
  tone: 'good' | 'warn' | 'plain'
  meter?: number
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-300'
      : tone === 'warn'
        ? 'text-amber-300'
        : 'text-[#f5efe0]'
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#7a8a80]" aria-hidden />
        <p className="font-mono-metric text-[10px] uppercase tracking-[0.18em] text-[#7a8a80]">
          {label}
        </p>
      </div>
      <p className={`mt-3 font-display text-3xl uppercase ${toneClass}`}>
        {value}
      </p>
      {meter !== undefined ? (
        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--admin-border)]"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-[#d4af37] transition-[width]"
            style={{
              width: `${Math.round(Math.min(1, Math.max(0, meter)) * 100)}%`,
            }}
          />
        </div>
      ) : null}
      <p className="mt-3 truncate text-[12px] text-[#7a8a80]" title={note}>
        {note}
      </p>
    </div>
  )
}