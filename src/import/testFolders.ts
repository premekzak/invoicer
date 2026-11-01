// Test data folders on disk: the made-up businesses of fixtureBusinesses.ts (and the small fixture.ts export as "Test
// Dodavatel"), each turned into the files of a real data folder. scripts/testdata.mjs writes them; the owner opens each
// folder once in the app, and the business switcher keeps them like any business. Nothing here touches the browser.
import { AGENT_GUIDE, AGENT_GUIDE_FILE } from '@/domain/agentGuide'
import { SCHEMA_VERSION, Settings, type Invoice } from '@/domain/schema'
import { computeTotals } from '@/domain/vat'
import { serialize } from '@/storage/repo'
import { fixtureCustomersCsv, fixtureInvoicesCsv } from './fixture'
import { fixtureBusinesses, type FixtureBusiness } from './fixtureBusinesses'
import { importCsv } from './csv'

/** EU countries among the made-up clients: a VAT payer's services to them are reverse charge. */
const EU = /rakous|švéd|němec|německ/i

export interface TestFolder { folder: string; name: string; files: Record<string, string> }

function folderOf(b: FixtureBusiness): TestFolder {
  const settings = Settings.parse({
    schemaVersion: SCHEMA_VERSION, vatMode: b.vatMode,
    supplier: {
      name: b.name, ic: b.ic, dic: b.vatMode === 'payer' && b.ic ? `CZ${b.ic}` : '',
      address: { street: b.street, zip: b.zip, city: b.city, country: 'Česká republika' },
      email: b.email, phone: b.phone, bank: { account: b.account, bankCode: b.bankCode },
    },
  })
  const { customers, invoices } = importCsv(b.customersCsv, b.invoicesCsv, b.vatMode)
  for (const c of customers) if (b.vatMode === 'payer' && EU.test(c.address.country ?? '')) c.reverseCharge = true
  const byId = new Map(customers.map((c) => [c.id, c]))
  // The CSV import keeps a single line at 0 % with the recorded total. Made-up data can do better: a payer's domestic
  // invoice gets 21 % VAT on a base worked back from the total, an EU client reverse charge, the rest no VAT.
  const priced = invoices.map((inv): Invoice => {
    const customer = inv.customerId ? byId.get(inv.customerId) : undefined
    const reverseCharge = b.vatMode === 'payer' && !!customer?.reverseCharge
    const domestic = inv.currency === 'CZK'
    const line = inv.lines[0]!
    const lines = b.vatMode === 'payer' && domestic
      ? [{ ...line, unitPrice: Math.round(line.unitPrice / 1.21), vatRate: 21 }]
      : [{ ...line, vatRate: b.vatMode === 'payer' && reverseCharge ? 21 : 0 }]
    const total = computeTotals(lines, inv.vatMode, reverseCharge).total
    return { ...inv, lines, reverseCharge, recordedTotal: undefined, paidAmount: inv.status === 'paid' ? total : undefined }
  })
  return {
    folder: b.folder, name: b.name,
    files: {
      'settings.json': serialize('settings', settings),
      'customers.json': serialize('customers', customers),
      'invoices.json': serialize('invoices', priced),
      [AGENT_GUIDE_FILE]: AGENT_GUIDE,
    },
  }
}

export function testFolders(): TestFolder[] {
  const main: FixtureBusiness = {
    folder: 'test-dodavatel', name: 'Test Dodavatel', ic: '', vatMode: 'nonPayer', city: '', street: '', zip: '', email: '', phone: '',
    account: '', bankCode: '', customersCsv: fixtureCustomersCsv, invoicesCsv: fixtureInvoicesCsv,
  }
  return [main, ...fixtureBusinesses()].map(folderOf)
}
