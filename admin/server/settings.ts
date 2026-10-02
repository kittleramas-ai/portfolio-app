import { eq, inArray } from 'drizzle-orm'

import { getDb } from '../../src/db/index.ts'
import { siteSetting } from '../../src/db/schema.ts'
import {
  DEFAULT_SITE_SETTINGS,
  contactSettingsSchema,
  heroSettingsSchema,
  SETTINGS_GROUPS,
  type ContactSettings,
  type HeroSettings,
  type SettingsGroupKey,
  type SiteSettings,
} from './settings-schema.ts'

/**
 * Read all settings, filling gaps from the schema defaults.
 *
 * A missing or unparseable row falls back to defaults rather than throwing: a
 * corrupt settings row must not take the public site down. The stored value is
 * validated on the way out too, so a hand-edited row with the wrong shape
 * degrades to defaults instead of leaking garbage into the page.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb()
  const groupKeys = SETTINGS_GROUPS.map((g) => g.key)

  const rows = await db
    .select()
    .from(siteSetting)
    .where(inArray(siteSetting.key, groupKeys))
    .catch(() => [] as Array<typeof siteSetting.$inferSelect>)

  const byKey = new Map(rows.map((r) => [r.key, r]))

  const readGroup = <K extends SettingsGroupKey>(
    key: K,
    schema: { safeParse: (v: unknown) => { success: boolean; data?: SiteSettings[K] } },
  ): SiteSettings[K] => {
    const row = byKey.get(key)
    if (!row) return structuredClone(DEFAULT_SITE_SETTINGS[key])
    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(row.value)
    } catch {
      return structuredClone(DEFAULT_SITE_SETTINGS[key])
    }
    const parsed = schema.safeParse(parsedJson)
    if (!parsed.success || parsed.data === undefined) {
      return structuredClone(DEFAULT_SITE_SETTINGS[key])
    }
    // Merge over defaults so a row saved before a new field existed still
    // picks up that field's default instead of rendering `undefined`.
    return { ...structuredClone(DEFAULT_SITE_SETTINGS[key]), ...parsed.data }
  }

  return {
    contact: readGroup('contact', contactSettingsSchema),
    hero: readGroup('hero', heroSettingsSchema),
  }
}

/**
 * Persist one settings group.
 *
 * `value` is re-validated here even though the API handler already validated
 * the request body — defence in depth, so a future caller cannot bypass the
 * schema by writing straight to this function.
 */
export async function saveSettingsGroup<K extends SettingsGroupKey>(
  groupKey: K,
  value: SiteSettings[K],
  updatedBy: string | null,
): Promise<SiteSettings[K]> {
  const schema = groupKey === 'contact' ? contactSettingsSchema : heroSettingsSchema
  const validated = schema.parse(value) as SiteSettings[K]

  const db = getDb()
  const now = new Date()

  // INSERT ... ON CONFLICT DO UPDATE — one statement, no read-modify-write, so
  // two concurrent saves to the same group cannot lose one another.
  await db
    .insert(siteSetting)
    .values({
      key: groupKey,
      value: JSON.stringify(validated),
      groupKey,
      updatedAt: now,
      updatedBy,
    })
    .onConflictDoUpdate({
      target: siteSetting.key,
      set: {
        value: JSON.stringify(validated),
        updatedAt: now,
        updatedBy,
      },
    })

  return validated
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