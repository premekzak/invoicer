/**
 * Invoices that just changed (issued, marked paid, paid from a bank statement), so the list can light their rows up once
 * when you next see it. Kept in memory only, for half a minute.
 */
const changed = new Map<string, number>()
const WINDOW = 30_000

export function markChanged(ids: string[]) {
  const now = Date.now()
  for (const id of ids) changed.set(id, now)
}

export function recentlyChanged(id: string): boolean {
  const at = changed.get(id)
  return at !== undefined && Date.now() - at < WINDOW
}
