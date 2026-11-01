// Made-up extra businesses for trying the business switcher in dev (seedFromCsv in src/main.tsx loads them next to the
// main test business, each in its own in-memory folder). Every name and IČ is invented. Each business shows another case:
// a VAT payer with many invoices, a non-payer, foreign currencies, a small one with few invoices, and a new one with a very
// long name and no invoices. Invoices are written in the previous service's CSV format and go through importCsv, so the
// data looks like an imported folder. Dates count back from today, so some invoices are always overdue or not yet due.

export interface FixtureBusiness {
  /** The folder name scripts/testdata.mjs writes it to. */
  folder: string
  name: string
  ic: string
  vatMode: 'payer' | 'nonPayer'
  city: string
  /** The supplier's other details; empty for the new business, so its "your details are missing" check shows. */
  street: string
  zip: string
  email: string
  phone: string
  account: string
  bankCode: string
  customersCsv: string
  invoicesCsv: string
}

const CUSTOMER_HEADER = 'Firma,IČ,DIČ,Ulice,PSČ,Město,Stát,E-mailová adresa,Další příjemci,Telefon,www,Titul,Jméno,Příjmení,Mobil,Číslo účtu,Kód banky,IBAN'
const INVOICE_HEADER = 'Číslo dokladu,Popis,Číslo objednávky,Řada,Název/Jméno,IČ,DIČ,Vystaveno,Splatnost,Datum platby,Celkem,Měna,Stav úhrady,Uhrazená částka,Variabilní symbol,Exportováno,Odesláno odběrateli,Odesláno účetnímu'

/** Small seeded PRNG (mulberry32), so the same seed gives the same business every time. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
const us = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

interface Client { name: string; ic: string; city: string; country: string; currency: string }
interface Spec {
  folder: string
  name: string
  street?: string
  zip?: string
  phone?: string
  account?: string
  bankCode?: string
  ic: string
  vatMode: 'payer' | 'nonPayer'
  city: string
  seed: number
  prefix: string
  clients: Client[]
  services: string[]
  /** How many invoices, over how many months back, and the range of amounts in the client's currency. */
  invoices: number
  months: number
  amount: [number, number]
}

const cz = (name: string, ic: string, city: string): Client => ({ name, ic, city, country: 'Česká republika', currency: 'Kč' })
const abroad = (name: string, city: string, country: string, currency: string): Client => ({ name, ic: '', city, country, currency })

const SPECS: Spec[] = [
  {
    folder: 'studio-lipova', street: 'Lipová 12', zip: '602 00', phone: '+420 600 000 001', account: '1000000011', bankCode: '0100', name: 'Studio Lipová s.r.o.', ic: '44444440', vatMode: 'payer', city: 'Brno', seed: 11, prefix: 'SL', invoices: 64, months: 26, amount: [8000, 95000],
    services: ['Webové stránky', 'Správa e-shopu', 'Grafický návrh kampaně', 'Fotografie produktů', 'Copywriting', 'Školení redaktorů', 'Hosting a údržba'],
    clients: [
      cz('Pekárna Zlatý klas s.r.o.', '50000010', 'Brno'), cz('Hotel Na Vyhlídce a.s.', '50000020', 'Znojmo'), cz('Truhlářství Dub s.r.o.', '50000030', 'Blansko'),
      cz('Zahradnictví Pod Lesem s.r.o.', '50000040', 'Tišnov'), cz('Moravská vinotéka s.r.o.', '50000050', 'Mikulov'), cz('Kolo Servis Brno s.r.o.', '50000060', 'Brno'),
      cz('Jazyková škola Mosty s.r.o.', '50000070', 'Brno'), cz('Optika Jasný pohled s.r.o.', '50000080', 'Vyškov'), cz('Stavebniny Kámen a.s.', '50000090', 'Kuřim'),
      cz('Veterinární klinika Tlapka s.r.o.', '50000100', 'Brno'), cz('Divadlo Malá scéna, z.ú.', '50000110', 'Brno'), cz('Cukrárna U Anděla s.r.o.', '50000120', 'Boskovice'),
      cz('Autodoprava Rychlík s.r.o.', '50000130', 'Hodonín'), abroad('Donau Media GmbH', 'Wien', 'Rakousko', 'EUR'),
    ],
  },
  {
    folder: 'petr-maly', street: 'Dolní náměstí 7', zip: '779 00', phone: '+420 600 000 002', account: '1000000029', bankCode: '0800', name: 'Petr Malý', ic: '55555550', vatMode: 'nonPayer', city: 'Olomouc', seed: 22, prefix: 'PM', invoices: 36, months: 20, amount: [2500, 28000],
    services: ['Svatební focení', 'Portréty', 'Fotografie interiérů', 'Produktové foto', 'Retuš fotografií', 'Firemní akce'],
    clients: [
      cz('Hana Dvořáková', '', 'Olomouc'), cz('Realitka Domov s.r.o.', '50000210', 'Olomouc'), cz('Svatební salon Bílá s.r.o.', '50000220', 'Prostějov'),
      cz('Restaurace U Tří lip s.r.o.', '50000230', 'Přerov'), cz('Nábytek Forma s.r.o.', '50000240', 'Šternberk'), cz('Tomáš Krejčí', '', 'Olomouc'),
      cz('Spolek přátel hradu, z.s.', '50000250', 'Bouzov'), cz('E-shop Hrnek s.r.o.', '50000260', 'Litovel'), cz('Taneční studio Krok, z.s.', '50000270', 'Olomouc'),
    ],
  },
  {
    folder: 'lingua-bridge', street: 'Vinohradská 40', zip: '120 00', phone: '+420 600 000 003', account: '1000000037', bankCode: '2010', name: 'Lingua Bridge s.r.o.', ic: '66666660', vatMode: 'payer', city: 'Praha', seed: 33, prefix: 'LB', invoices: 40, months: 18, amount: [300, 4200],
    services: ['Překlad smlouvy', 'Tlumočení jednání', 'Lokalizace aplikace', 'Korektura textů', 'Soudní překlad'],
    clients: [
      abroad('Nordic Apps AB', 'Stockholm', 'Švédsko', 'EUR'), abroad('Hartmann Consulting GmbH', 'München', 'Německo', 'EUR'),
      abroad('Maple Leaf Games Inc.', 'Toronto', 'Kanada', 'USD'), abroad('Thames Legal LLP', 'London', 'Spojené království', 'GBP'),
      abroad('Alpine Tours AG', 'Bern', 'Švýcarsko', 'EUR'), cz('Advokátní kancelář Brož a partneři', '50000310', 'Praha'),
    ],
  },
  {
    folder: 'kavarna-u-mlyna', street: 'Mlýnská 3', zip: '397 01', phone: '+420 600 000 004', account: '1000000045', bankCode: '0300', name: 'Kavárna U Mlýna', ic: '77777770', vatMode: 'nonPayer', city: 'Písek', seed: 44, prefix: 'KM', invoices: 6, months: 8, amount: [1200, 9000],
    services: ['Catering na poradu', 'Pronájem salonku', 'Dorty na objednávku'],
    clients: [cz('Městská knihovna Písek', '50000410', 'Písek'), cz('Gymnázium Písek', '50000420', 'Písek'), cz('Jitka Horáková', '', 'Písek')],
  },
  {
    folder: 'atelier-novakova', name: 'Ateliér architektury a interiérového designu Nováková & partneři s.r.o.', ic: '88888880', vatMode: 'payer', city: 'Liberec', seed: 55, prefix: 'AN',
    invoices: 0, months: 0, amount: [0, 0], services: [], clients: [],
  },
]

function build(spec: Spec): FixtureBusiness {
  const r = rng(spec.seed)
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]!
  const customers = spec.clients.map((c, i) =>
    [c.name, c.ic, c.ic ? `CZ${c.ic}` : '', `${['Lipová', 'Nádražní', 'Školní', 'Husova', 'Zahradní'][i % 5]} ${i + 3}`, '', c.city, c.country,
      `info${i + 1}@example.com`, '', '', '', '', '', '', '', '', '', ''].map(q).join(','))
  const today = new Date()
  // Spread the invoices over the months, oldest first, so the numbers rise with the dates.
  const dates = Array.from({ length: spec.invoices }, () => addDays(today, -Math.floor(r() * spec.months * 30.4) - 1)).sort((a, b) => +a - +b)
  const perYear = new Map<number, number>()
  const invoices = dates.map((issued) => {
    const c = pick(spec.clients)
    const year = issued.getFullYear()
    const n = (perYear.get(year) ?? 0) + 1
    perYear.set(year, n)
    const number = `${year}${String(n).padStart(4, '0')}`
    const due = addDays(issued, 14)
    const age = (+today - +issued) / 86400000
    // Old invoices are almost all paid; a few stay overdue. The last month's are mostly still open.
    const paid = age > 45 ? r() < 0.93 : age > 14 ? r() < 0.6 : r() < 0.25
    const paidOn = paid ? addDays(issued, Math.min(Math.floor(age) - 1, 3 + Math.floor(r() * 20))) : undefined
    const [lo, hi] = spec.amount
    const step = c.currency === 'Kč' ? 100 : 10
    const total = (Math.round((lo + r() * (hi - lo)) / step) * step).toFixed(2)
    return [number, pick(spec.services), '', 'Výchozí', c.name, c.ic, c.ic ? `CZ${c.ic}` : '', us(issued), us(due), paidOn ? us(paidOn) : '',
      total, c.currency, paid ? 'Uhrazeno' : 'Neuhrazeno', paid ? total : '0.00', number, 'Ne', 'Neodesláno', 'Ne'].map(q).join(',')
  })
  return {
    folder: spec.folder, name: spec.name, ic: spec.ic, vatMode: spec.vatMode, city: spec.city,
    street: spec.street ?? '', zip: spec.zip ?? '', email: spec.street ? `fakturace@${spec.folder}.example.com` : '', phone: spec.phone ?? '',
    account: spec.account ?? '', bankCode: spec.bankCode ?? '',
    customersCsv: '﻿' + [CUSTOMER_HEADER, ...customers].join('\n'),
    invoicesCsv: '﻿' + [INVOICE_HEADER, ...invoices.reverse()].join('\n'),
  }
}

export const fixtureBusinesses = (): FixtureBusiness[] => SPECS.map(build)
