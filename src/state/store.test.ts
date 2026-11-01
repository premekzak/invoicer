import { beforeEach, describe, expect, it, vi } from 'vitest'
import { newInvoice } from '@/domain/invoice'
import { LockedError, tampered } from '@/domain/lock'
import { SCHEMA_VERSION, Settings } from '@/domain/schema'
import { MemoryAdapter } from '@/storage/memory'
import { useStore } from './store'

const settings = Settings.parse({ schemaVersion: SCHEMA_VERSION, supplier: { name: 'Test' }, vatMode: 'nonPayer' })
const customer = {
  id: 'c1', name: 'Acme', ic: '', dic: '', address: { street: '', zip: '', city: '', country: '' },
  email: '', cc: [], phone: '', web: '', contactName: '', reverseCharge: false, note: '', archived: false,
}

describe('store', () => {
  let a: MemoryAdapter
  beforeEach(async () => {
    a = new MemoryAdapter()
    await useStore.getState().open(a)
  })

  it('goes to onboarding for an empty folder, then saves', async () => {
    expect(useStore.getState().phase.kind).toBe('onboarding')
    useStore.getState().saveSettings(settings)
    useStore.getState().upsertCustomer(customer)
    expect(useStore.getState().saveState).toBe('pending')
    await useStore.getState().flush()
    expect(useStore.getState().saveState).toBe('saved')
    expect(JSON.parse(a.files.get('customers.json')!.text).customers[0].name).toBe('Acme')
    await useStore.getState().reload()
    expect(useStore.getState().phase.kind).toBe('ready')
    await vi.waitFor(() => expect(a.files.get('AGENTS.md')?.text).toContain('Read only'))
  })

  it('asks for a moved folder instead of starting onboarding in it', async () => {
    const moved = Object.assign(new MemoryAdapter(), { exists: async () => false })
    await useStore.getState().open(moved)
    expect(useStore.getState().phase).toEqual({ kind: 'missingFolder', folder: moved.name })
  })

  it('never lets a slower folder load land on top of a newer one', async () => {
    // The remembered folder starts loading at start-up; meanwhile another folder is opened. The slow one finishes last.
    const slow = new MemoryAdapter('slow')
    await slow.write('settings.json', JSON.stringify({ ...settings, supplier: { ...settings.supplier, name: 'Slow' } }))
    let release!: () => void
    const gate = new Promise<void>((r) => { release = r })
    const read = slow.read.bind(slow)
    slow.read = async (f) => { await gate; return read(f) }
    const fast = new MemoryAdapter('fast')
    await fast.write('settings.json', JSON.stringify({ ...settings, supplier: { ...settings.supplier, name: 'Fast' } }))

    const slowOpen = useStore.getState().open(slow)
    await useStore.getState().open(fast)
    release()
    await slowOpen
    expect(useStore.getState().adapter).toBe(fast)
    expect(useStore.getState().settings?.supplier.name).toBe('Fast')
  })

  it('detects a conflict and can overwrite on request', async () => {
    useStore.getState().upsertCustomer(customer)
    await useStore.getState().flush()
    a.touch('customers.json', '{"schemaVersion":1,"customers":[]}')
    useStore.getState().upsertCustomer({ ...customer, name: 'Acme 2' })
    await useStore.getState().flush()
    expect(useStore.getState()).toMatchObject({ saveState: 'conflict', conflictFile: 'customers' })
    await useStore.getState().forceSave()
    expect(useStore.getState().saveState).toBe('saved')
    expect(a.files.get('customers.json')!.text).toContain('Acme 2')
  })

  it('demo mode shows anonymized data, never writes the real folder, and restores it on exit', async () => {
    const st = () => useStore.getState()
    st().saveSettings(settings)
    st().upsertCustomer(customer)
    await st().flush()
    const before = JSON.stringify([...a.files])

    await st().enterDemo('Demo')
    expect(st().demo).toBe(true)
    expect(st().adapter).not.toBe(a)
    expect(st().customers[0]!.name).not.toBe('Acme')
    st().upsertCustomer({ ...st().customers[0]!, note: 'changed in demo' })
    await st().flush()
    expect(JSON.stringify([...a.files])).toBe(before)

    await st().exitDemo()
    expect(st()).toMatchObject({ demo: false, adapter: a })
    expect(st().customers[0]!.name).toBe('Acme')
    expect(st().customers[0]!.note).toBe('')
  })

  it('saves pending changes to the old business before switching to another', async () => {
    useStore.getState().saveSettings(settings)
    useStore.getState().upsertCustomer(customer)
    const b = new MemoryAdapter('second')
    await useStore.getState().switchTo(b)
    // The first business got its last edit; the second starts empty, with its own onboarding.
    expect(JSON.parse(a.files.get('customers.json')!.text).customers[0].name).toBe('Acme')
    expect(useStore.getState()).toMatchObject({ adapter: b, previous: a, customers: [], phase: { kind: 'onboarding' } })
    expect(b.files.size).toBe(0)
  })

  it('does not switch businesses in demo mode', async () => {
    useStore.getState().saveSettings(settings)
    await useStore.getState().flush()
    await useStore.getState().reload()
    await useStore.getState().enterDemo('demo')
    await expect(useStore.getState().switchTo(new MemoryAdapter('second'))).rejects.toThrow('demo')
    await useStore.getState().exitDemo()
    expect(useStore.getState().adapter).toBe(a)
  })

  it('keeps issued invoices as issued: no locked change without unlocking, no deleting', async () => {
    const st = () => useStore.getState()
    st().saveSettings(settings)
    const draft = { ...newInvoice(settings, [], customer, '2026-03-01'), lines: [{ description: 'Práce', quantity: 1, unit: '', unitPrice: 100000, vatRate: 0 }] }
    st().upsertInvoice(draft)
    const issued = st().upsertInvoice({ ...draft, status: 'issued' })
    expect(issued.fingerprint).toBeTruthy()
    expect(() => st().upsertInvoice({ ...issued, number: '99' })).toThrow(LockedError)
    expect(() => st().upsertInvoices([{ ...issued, lines: [] }])).toThrow(LockedError)
    expect(() => st().removeInvoice(issued.id)).toThrow(LockedError)
    expect(st().invoices[0]).toBe(issued)
    st().upsertInvoices([{ ...issued, status: 'paid', paidDate: '2026-03-05' }])
    expect(st().invoices[0]!.status).toBe('paid')
    expect(st().upsertInvoice({ ...st().invoices[0]!, number: '99' }, { unlocked: true }).amended).toHaveLength(1)
  })

  it('fingerprints issued invoices from before fingerprints when the folder opens, and notices a hand edit', async () => {
    const st = () => useStore.getState()
    const old = { ...newInvoice(settings, [], customer, '2026-03-01'), status: 'issued', lines: [{ description: 'Práce', quantity: 1, unit: '', unitPrice: 100000, vatRate: 0 }] }
    delete (old as { fingerprint?: string }).fingerprint
    await a.write('settings.json', JSON.stringify(settings))
    await a.write('invoices.json', JSON.stringify({ schemaVersion: SCHEMA_VERSION, invoices: [old] }))
    await st().reload()
    expect(st().invoices[0]!.fingerprint).toBeTruthy()
    await st().flush()
    const file = JSON.parse(a.files.get('invoices.json')!.text)
    expect(file.invoices[0].fingerprint).toBe(st().invoices[0]!.fingerprint)
    // Someone edits the amount in the file; the fingerprint stays, so Invojka notices.
    file.invoices[0].lines[0].unitPrice = 1
    a.touch('invoices.json', JSON.stringify(file))
    await st().reload()
    expect(tampered(st().invoices[0]!)).toBe(true)
  })
})
