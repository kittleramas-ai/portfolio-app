import { sql } from 'drizzle-orm'

export function indiaDateTimeSql() {
  return sql`DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 330 MINUTE)`
}

export function formatIndiaTimestamp(date: Date): string {
  const indiaTime = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
  return `${indiaTime.toISOString().slice(0, -1)}+05:30`
}
