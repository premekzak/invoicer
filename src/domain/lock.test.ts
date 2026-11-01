import { describe, expect, it } from 'vitest'
import { checkData } from './check'
import { invoiceHistory, newInvoice } from './invoice'
import { checkRemoval, checkedChange, fingerprint, LockedError, sealed, tampered } from './lock'
import { Invoice, SCHEMA_VERSION, Settings } from './schema'

const settings = Settings.parse({ schemaVersion: SCHEMA_VERSION, supplier: { name: 'Test' }, vatMode: 'nonPayer' })
const customer = {
  id: 'c1', name: 'Acme', ic: '', dic: '', address: { street: '', zip: '', city: '', country: '' },
  email: '', cc: [], phone: '', web: '', contactName: '', reverseCharge: false, note: '', archived: false,
}
const draft = (): Invoice => ({ ...newInvoice(settings, [], customer, '2026-03-01'), lines: [{ description: 'Práce', quantity: 2, unit: 'h', unitPrice: 100000, vatRate: 0 }] })
const issue = (d = draft()) => checkedChange(d, { ...d, status: 'issued' })

describe('locking issued documents', () => {
  it('lets a draft change freely and fingerprints it when issued', () => {
    const d = draft()
    const edited = checkedChange(d, { ...d, lines: [{ ...d.lines[0]!, unitPrice: 5 }] })
    expect(edited.fingerprint).toBeUndefined()
    const issued = issue(edited)
    expect(issued.fingerprint).toBe(fingerprint(issued))
    expect(tampered(issued)).toBe(false)
  })

  it('refuses a change of what is printed, unless unlocked', () => {
    const issued = issue()
    const changed = { ...issued, lines: [{ ...issued.lines[0]!, unitPrice: 1 }] }
    expect(() => checkedChange(issued, changed)).toThrow(LockedError)
    expect(() => checkedChange(issued, { ...issued, number: '99' })).toThrow(/number/)
    expect(() => checkedChange(issued, { ...issued, customerSnapshot: { ...issued.customerSnapshot, name: 'Other' } })).toThrow(LockedError)
    const saved = checkedChange(issued, changed, { unlocked: true, on: '2026-03-02' })
    expect(saved.amended).toEqual(['2026-03-02'])
    expect(tampered(saved)).toBe(false)
    // A second unlocked save the same day is one entry in the history.
    expect(checkedChange(saved, { ...saved, number: '99' }, { unlocked: true, on: '2026-03-02' }).amended).toEqual(['2026-03-02'])
  })

  it('lets the status, payment, notes and tags change on a locked document', () => {
    const issued = issue()
    const paid = checkedChange(issued, { ...issued, status: 'paid', paidDate: '2026-03-10', paidAmount: 200000, note: 'Díky', privateNote: 'x', tags: ['web'], exchangeRate: 25 })
    expect(paid.fingerprint).toBe(issued.fingerprint)
    expect(paid.amended).toEqual([])
    expect(checkedChange(paid, { ...paid, status: 'cancelled' }).status).toBe('cancelled')
  })

  it('never lets an issued document go back to a draft or be deleted', () => {
    const issued = issue()
    expect(() => checkedChange(issued, { ...issued, status: 'draft' })).toThrow(LockedError)
    expect(() => checkRemoval(issued)).toThrow(LockedError)
    expect(() => checkRemoval(draft())).not.toThrow()
  })

  it('keeps the stored fingerprint and edit days, whatever the caller sends', () => {
    const issued = issue()
    const forged = checkedChange(issued, { ...issued, status: 'paid', paidDate: '2026-03-10', fingerprint: 'v1:forged', amended: [] })
    expect(forged.fingerprint).toBe(issued.fingerprint)
  })

  it('notices a change made in the file, keeps noticing it, and an unlocked save accepts it', () => {
    const issued = issue()
    const edited: Invoice = { ...issued, lines: [{ ...issued.lines[0]!, quantity: 20 }] } // e.g. invoices.json edited by hand
    expect(tampered(edited)).toBe(true)
    const issues = checkData({ settings, customers: [customer], invoices: [edited] })
    expect(issues.map((i) => i.code)).toContain('invoice.changedAfterIssue')
    // Marking it paid doesn't bless the change.
    const paid = checkedChange(edited, { ...edited, status: 'paid', paidDate: '2026-03-10' })
    expect(tampered(paid)).toBe(true)
    const accepted = checkedChange(paid, paid, { unlocked: true, on: '2026-03-11' })
    expect(tampered(accepted)).toBe(false)
    expect(invoiceHistory(accepted, [accepted]).map((e) => e.type)).toContain('amended')
  })

  it('gives the same fingerprint to the same document however it was built', () => {
    const issued = issue()
    // Read back from disk: keys in another order, defaults filled in by the schema.
    const fromDisk = Invoice.parse(JSON.parse(JSON.stringify({ ...issued, customerSnapshot: { address: issued.customerSnapshot.address, name: 'Acme', dic: '', ic: '' } })))
    expect(fingerprint(fromDisk)).toBe(issued.fingerprint)
    expect(tampered(fromDisk)).toBe(false)
  })

  it('fingerprints issued documents from before fingerprints, and leaves drafts alone', () => {
    const old = { ...draft(), status: 'issued' as const }
    expect(sealed(old).fingerprint).toBe(fingerprint(old))
    const d = draft()
    expect(sealed(d)).toBe(d)
  })
})
