import { today } from './id'
import { Invoice } from './schema'

/**
 * Issued documents can't change by accident (the owner, 2026-10-28). The store runs every saved invoice through
 * `checkedChange`: once a document is issued, the fields below change only after "Odemknout" (an unlocked save), and
 * such a save is recorded in `amended`. Issuing stores a fingerprint of these fields, so a change made outside Invojka
 * (by hand or by another program in `invoices.json`) shows up as `tampered`. It's evidence, not protection: the files
 * are the user's own, and anyone can edit them.
 */
export const LOCKED_FIELDS = [
  'kind', 'number', 'variableSymbol', 'orderNumber', 'customerId', 'customerSnapshot', 'issueDate', 'dueDate',
  'taxableSupplyDate', 'currency', 'language', 'paymentMethod', 'vatMode', 'reverseCharge', 'lines',
  'correctsId', 'correctsNumber', 'correctionReason', 'advanceId', 'advanceNumber', 'advanceAmount', 'advanceTaxDocNumber', 'advanceVat',
] as const satisfies readonly (keyof Invoice)[]

export class LockedError extends Error {}

/** JSON with keys sorted at every level, so the same values give the same text however the object was built. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`
  if (v && typeof v === 'object') {
    const keys = Object.keys(v).filter((k) => (v as Record<string, unknown>)[k] !== undefined).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(',')}}`
  }
  return JSON.stringify(v) ?? 'null'
}

/** cyrb53: a fast 53-bit string hash. Enough to notice a change; not meant to stop someone who wants to forge one. */
function hash(s: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
}

/** The locked fields with the schema's defaults filled in, so an invoice built in the app and one read from disk match. */
function lockedPart(inv: Invoice): Record<string, unknown> {
  const full = Invoice.safeParse(inv).data ?? inv
  return Object.fromEntries(LOCKED_FIELDS.map((k) => [k, full[k]]))
}

/** "v1:" names the field list, so a later list can tell old fingerprints apart. */
export const fingerprint = (inv: Invoice): string => `v1:${hash(canonical(lockedPart(inv)))}`

/** The locked fields that differ between two versions of a document. */
export function lockedChanges(before: Invoice, after: Invoice): string[] {
  const a = lockedPart(before), b = lockedPart(after)
  return LOCKED_FIELDS.filter((k) => canonical(a[k]) !== canonical(b[k]))
}

/** An issued document whose locked fields no longer match the fingerprint taken when it was issued. */
export const tampered = (inv: Invoice): boolean => inv.status !== 'draft' && !!inv.fingerprint && inv.fingerprint !== fingerprint(inv)

/** An issued document without a fingerprint gets one (data from before fingerprints, and imported history). */
export const sealed = (inv: Invoice): Invoice => (inv.status === 'draft' || inv.fingerprint ? inv : { ...inv, fingerprint: fingerprint(inv) })

/**
 * The invoice as it may be saved over `before` (undefined for a new one), or a `LockedError`. A draft changes freely;
 * issuing takes the fingerprint; an issued document keeps its locked fields unless `unlocked`, and then the new values
 * get a new fingerprint and today goes into `amended` (also when an unlocked save accepts a change made outside Invojka). The fingerprint and `amended` always come from `before`,
 * never from the caller, so a save can't hide an earlier change.
 */
export function checkedChange(before: Invoice | undefined, after: Invoice, opts: { unlocked?: boolean; on?: string } = {}): Invoice {
  const wasIssued = !!before && before.status !== 'draft'
  if (after.status === 'draft') {
    if (wasIssued) throw new LockedError(`${before.number} is issued; it can't go back to a draft.`)
    return { ...after, fingerprint: undefined, amended: [] }
  }
  if (!wasIssued) return { ...after, fingerprint: fingerprint(after), amended: [] }
  const changed = lockedChanges(before, after)
  // An unlocked save of a document changed outside Invojka accepts that change, even when the save itself changes nothing.
  if (!changed.length && !(opts.unlocked && tampered(before))) return { ...after, fingerprint: before.fingerprint ?? fingerprint(after), amended: before.amended }
  if (!opts.unlocked) throw new LockedError(`${before.number} is ${before.status}; ${changed.join(', ')} can't change without unlocking it.`)
  const on = opts.on ?? today()
  return { ...after, fingerprint: fingerprint(after), amended: before.amended.at(-1) === on ? before.amended : [...before.amended, on] }
}

/** Only a draft can be deleted; an issued document is cancelled or corrected instead, so its number stays taken. */
export function checkRemoval(inv: Invoice | undefined) {
  if (inv && inv.status !== 'draft') throw new LockedError(`${inv.number} is ${inv.status}; only a draft can be deleted.`)
}
