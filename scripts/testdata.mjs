// Writes the made-up test businesses as real data folders: `npm run testdata` (into testdata/, git-ignored) or
// `npm run testdata -- <folder>`. Open each subfolder once in Invojka ("Přidat další firmu", or the folder picker on the
// welcome screen); the business switcher then remembers them like any business, across reloads.
//
// Running it again rewrites settings.json, customers.json, invoices.json and AGENTS.md in each subfolder (so the dates
// count from today again and edits made while testing are gone); other files, such as saved PDFs, are left alone.
// The data comes from src/import/testFolders.ts, loaded through Vite so the app's own code writes the files.
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createServer } from 'vite'

const target = resolve(process.argv[2] ?? 'testdata')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { testFolders } = await vite.ssrLoadModule('/src/import/testFolders.ts')
  for (const { folder, name, files } of testFolders()) {
    const dir = join(target, folder)
    await mkdir(dir, { recursive: true })
    for (const [file, text] of Object.entries(files)) await writeFile(join(dir, file), text)
    console.log(`${dir}  ${name}`)
  }
} finally {
  await vite.close()
}
