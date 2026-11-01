import { describe, expect, it } from 'vitest'
import { checkData } from '@/domain/check'
import { MemoryAdapter } from '@/storage/memory'
import { loadAll } from '@/storage/repo'
import { testFolders } from './testFolders'

// The folders `npm run testdata` writes must open in the app like any data folder.
describe.each(testFolders().map((f) => [f.folder, f] as const))('test folder %s', (_, folder) => {
  it('loads through the app reader, with no errors in the data check', async () => {
    const adapter = new MemoryAdapter()
    for (const [file, text] of Object.entries(folder.files)) await adapter.write(file, text)
    const data = await loadAll(adapter)
    expect(data.settings?.supplier.name).toBe(folder.name)
    const errors = checkData({ settings: data.settings!, customers: data.customers, invoices: data.invoices }).filter((i) => i.level === 'error')
    expect(errors).toEqual([])
  })
})
