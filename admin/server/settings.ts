import { eq, inArray } from 'drizzle-orm'
import type { ZodType } from 'zod'

import { getDb } from '../../src/db/index.ts'
import { siteSetting } from '../../src/db/schema.ts'
import {
  DEFAULT_SITE_SETTINGS,
  SETTINGS_GROUP_KEYS,
  SITE_SETTINGS_SHAPE,
} from './settings-schema.ts'
import type {
  ContactSettings,
  HeroSettings,
  SettingsGroupKey,
  SiteSettings,
} from './settings-schema.ts'

/**
 * Schema per settings group, keyed by the group name.
 *
 * A mapped type rather than a plain `Record`: the section schemas have
 * structurally different output types, and pinning the map to `SiteSettings[K]`
 * is what lets `readGroup` return `SiteSettings[TGroup]` instead of a union.
 */
const GROUP_SCHEMAS = SITE_SETTINGS_SHAPE as {
  [K in SettingsGroupKey]: ZodType<SiteSettings[K]>
}

/**
 * Read all settings, filling gaps from the schema defaults.
 *
 * A missing or unparseable row falls back to defaults rather than throwing: a
 * corrupt settings row must not take the public site down. The stored value is
 * validated on the way out too, so a hand-edited row with the wrong shape
 * degrades to defaults instead of leaking garbage into the page.
 *
 * Loops over the group registry, so a newly added section is read here for free.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb()

  const rows = await db
    .select()
    .from(siteSetting)
    .where(inArray(siteSetting.key, SETTINGS_GROUP_KEYS))
    .catch(() => [] as Array<typeof siteSetting.$inferSelect>)

  const byKey = new Map(rows.map((r) => [r.key, r]))

  const readGroup = <TGroup extends SettingsGroupKey>(
    key: TGroup,
  ): SiteSettings[TGroup] => {
    const fallback = () => structuredClone(DEFAULT_SITE_SETTINGS[key])
    const row = byKey.get(key)
    if (!row) return fallback()

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(row.value)
    } catch {
      return fallback()
    }

    const parsed = GROUP_SCHEMAS[key].safeParse(parsedJson)
    if (!parsed.success) return fallback()

    // Merge over defaults so a row saved before a new field existed still
    // picks up that field's default instead of rendering `undefined`.
    return { ...fallback(), ...parsed.data }
  }

  return Object.fromEntries(
    SETTINGS_GROUP_KEYS.map((key) => [key, readGroup(key)]),
  ) as SiteSettings
}

/**
 * Persist one settings group.
 *
 * `value` is validated here against the group's own schema. The admin UI also
 * validates before calling, but this is the boundary that matters: it is what
 * stops a crafted request writing a shape no component expects. Validating in
 * two places is deliberate — the client copy gives the manager an inline error,
 * this one is the guarantee.
 */
export async function saveSettingsGroup<TGroup extends SettingsGroupKey>(
  groupKey: TGroup,
  value: unknown,
  updatedBy: string | null,
): Promise<SiteSettings[TGroup]> {
  // Indexed by the group name, so each caller gets its own schema back with the
  // right type. (A `groupKey === 'contact' ? a : b` conditional widens to a
  // union; an indexed lookup keyed by a generic does not narrow cleanly either,
  // hence the explicit parse-and-return below.)
  const parsed = GROUP_SCHEMAS[groupKey].parse(value) as SiteSettings[TGroup]

  const db = getDb()
  const now = new Date()

  // INSERT ... ON CONFLICT DO UPDATE — one statement, no read-modify-write, so
  // two concurrent saves to the same group cannot lose one another.
  await db
    .insert(siteSetting)
    .values({
      key: groupKey,
      value: JSON.stringify(parsed),
      groupKey,
      updatedAt: now,
      updatedBy,
    })
    .onConflictDoUpdate({
      target: siteSetting.key,
      set: {
        value: JSON.stringify(parsed),
        updatedAt: now,
        updatedBy,
      },
    })

  return parsed
}

export async function getSettingRow(key: string) {
  const db = getDb()
  const rows = await db
    .select()
    .from(siteSetting)
    .where(eq(siteSetting.key, key))
    .limit(1)
  return rows[0] ?? null
}

export type { ContactSettings, HeroSettings, SiteSettings }