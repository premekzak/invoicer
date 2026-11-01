import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { DesktopNotice } from './ui/DesktopNotice'
import { ErrorBoundary } from './ui/ErrorBoundary'
import './i18n'
import './index.css'
import { loadUiFonts } from './pdf/fonts'

loadUiFonts()

// The public showcase build opens on made-up data in memory (src/showcase/boot.ts).
if (import.meta.env.MODE === 'showcase') void import('./showcase/boot').then((m) => m.bootShowcase())

// Dev-only hooks so browser automation can run the app against in-memory storage (no folder dialog).
if (import.meta.env.DEV) {
  void Promise.all([import('./state/store'), import('./storage/memory'), import('./import/csv'), import('./domain/schema'), import('./domain/check'), import('./import/fixtureBusinesses')]).then(
    ([{ useStore }, { MemoryAdapter, memoryBusinesses }, { importCsv }, { Settings, SCHEMA_VERSION }, { checkData }, { fixtureBusinesses }]) => {
      const openMemory = () => useStore.getState().open(new MemoryAdapter())
      /** Load the repo's sample CSVs (served by the dev server) into a fresh in-memory folder. */
      const seedFromCsv = async (vatMode: 'payer' | 'nonPayer' = 'nonPayer') => {
        // The real export is git-ignored; without it (or when the dev server answers with index.html) use the made-up fixture.
        const [real, fixture] = await Promise.all([
          Promise.all(['/customers.csv', '/invoices.csv'].map((u) => fetch(u).then((r) => (r.ok ? r.text() : '')))),
          import('./import/fixture'),
        ])
        const hasReal = real.every((t) => t && !t.trimStart().startsWith('<'))
        const [c, i] = hasReal ? real : [fixture.fixtureCustomersCsv, fixture.fixtureInvoicesCsv]
        // Each business in its own in-memory folder, listed by the business switcher. "Test Dodavatel" is the main one and
        // opens last; the others are made up (src/import/fixtureBusinesses.ts).
        memoryBusinesses.length = 0
        const fill = async (name: string, ic: string, city: string, mode: typeof vatMode, customersCsv: string, invoicesCsv: string) => {
          const adapter = new MemoryAdapter(`test-${memoryBusinesses.length + 1}`)
          memoryBusinesses.push({ adapter, label: name })
          await useStore.getState().open(adapter)
          const s = useStore.getState()
          s.saveSettings(Settings.parse({ schemaVersion: SCHEMA_VERSION, supplier: { name, ic, address: { city, country: 'Česká republika' } }, vatMode: mode }))
          s.replaceAll(importCsv(customersCsv, invoicesCsv, mode))
          await s.flush()
          return adapter
        }
        const main = await fill('Test Dodavatel', '', '', vatMode, c, i)
        for (const b of fixtureBusinesses()) await fill(b.name, b.ic, b.city, b.vatMode, b.customersCsv, b.invoicesCsv)
        await useStore.getState().open(main)
        useStore.getState().setPhase({ kind: 'ready' })
      }
      /** List what's wrong with the data that's open now (errors, then warnings) in a console table. */
      const check = () => {
        const { settings, customers, invoices } = useStore.getState()
        if (!settings) return console.warn('No data open.')
        const issues = checkData({ settings, customers, invoices }).sort((a, b) => a.level.localeCompare(b.level))
        console.table(issues)
        return issues
      }
      Object.assign(window, { __invojka: { useStore, openMemory, seedFromCsv, check } })
    },
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The last line of defence; each screen also has its own boundary (App.tsx), so the header stays usable. */}
    <ErrorBoundary>
      <App />
      <DesktopNotice />
    </ErrorBoundary>
  </StrictMode>,
)
