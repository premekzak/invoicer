import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Invoice } from '@/domain/schema'
import { monthlyRevenue, yearlyRevenue } from '@/domain/stats'
import { RunResult } from '@/features/rates/RatesPanel'
import { useRates } from '@/features/rates/useRates'
import { useStore } from '@/state/store'
import { BarChart } from '@/ui/BarChart'
import { useFormat } from '@/ui/format'
import { Card } from '@/ui/primitives'
import { Segmented } from '@/ui/Segmented'

const pct = (a: number, b: number) => {
  if (!b) return undefined
  const p = Math.round(((a - b) / b) * 100)
  return `${p > 0 ? '+' : ''}${p} %`
}

/** Everything both charts need: the data for this year, last year and every year, and the shared formatting. */
function useRevenue(today: string, only?: Invoice[]) {
  const f = useFormat()
  const all = useStore((s) => s.invoices)
  const invoices = only ?? all
  const year = Number(today.slice(0, 4))
  const month = Number(today.slice(5, 7)) - 1

  const locale = f.lang === 'cs' ? 'cs-CZ' : 'en-GB'
  const compact = useMemo(() => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }), [locale])
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2000, i, 1)).replace('.', '')),
    [locale],
  )

  const { thisYear, lastYear, yearly } = useMemo(() => ({
    thisYear: monthlyRevenue(invoices, year),
    lastYear: monthlyRevenue(invoices, year - 1),
    yearly: yearlyRevenue(invoices, year),
  }), [invoices, year])

  // Months after the current one haven't happened yet: no bar rather than a misleading zero.
  const current = thisYear.values.map((v, i) => (i <= month ? v : null))
  // A customer billed only in earlier years would get an empty month chart.
  const recent = current.some((v) => v) || lastYear.values.some((v) => v)

  return { today, year, month, months, current, lastYear: lastYear.values, yearly, recent, axis: (minor: number) => compact.format(minor / 100) }
}
type Revenue = ReturnType<typeof useRevenue>

function MonthChart({ r }: { r: Revenue }) {
  const { t } = useTranslation()
  const f = useFormat()
  return (
    <BarChart
      categories={r.months}
      series={[
        { key: 'this', label: String(r.year), color: 'var(--color-series-1)', end: 'var(--color-series-1-end)', values: r.current },
        { key: 'last', label: String(r.year - 1), color: 'var(--color-series-2)', end: 'var(--color-series-2-end)', values: r.lastYear },
      ]}
      formatAxis={r.axis}
      formatValue={(v) => f.money(v)}
      partial={{ indexes: [r.month], note: t('home.ytd', { date: f.date(r.today) }) }}
      tooltipExtra={(i) => {
        const p = r.current[i] != null ? pct(r.current[i]!, r.lastYear[i]) : undefined
        return p && t('home.vsLastYear', { pct: p, year: r.year - 1 })
      }}
      tableLabel={t('home.table')}
      chartLabel={t('home.chart')}
    />
  )
}

function YearChart({ r }: { r: Revenue }) {
  const { t } = useTranslation()
  const f = useFormat()
  const { years, values } = r.yearly
  return (
    <BarChart
      categories={years.map(String)}
      tickFormat={(y) => (years.length <= 8 ? y : `’${y.slice(2)}`)}
      series={[{ key: 'rev', label: t('home.byYear'), color: 'var(--color-series-1)', end: 'var(--color-series-1-end)', values }]}
      formatAxis={r.axis}
      formatValue={(v) => f.money(v)}
      partial={{ indexes: [years.length - 1], note: t('home.ytd', { date: f.date(r.today) }) }}
      labelIndexes={[values.indexOf(Math.max(...values)), years.length - 1]}
      tooltipExtra={(i) => {
        const p = i > 0 ? pct(values[i], values[i - 1]) : undefined
        return p && t('home.vsLastYear', { pct: p, year: years[i - 1] })
      }}
      tableLabel={t('home.table')}
      chartLabel={t('home.chart')}
    />
  )
}

/** The note under the charts when invoices in a foreign currency have no rate yet, with a way to fill them. */
function MissingRates({ r, className }: { r: Revenue; className?: string }) {
  const { t } = useTranslation()
  const rates = useRates()
  const missing = r.yearly.missingRate
  if (!(missing.count > 0 || rates.run.busy || rates.run.filled !== undefined)) return null
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle ${className ?? ''}`}>
      {missing.count > 0 && <span>{t('home.missingRate', { count: missing.count, currencies: missing.currencies.join(', ') })}</span>}
      {missing.count > 0 && !rates.run.busy && (
        <>
          <button className="font-medium text-link underline underline-offset-2 decoration-line-strong hover:decoration-current" onClick={() => void rates.fillFromEcb()}>{t('rates.fillNow')}</button>
          <a href="#/settings?tab=rates" className="hover:underline">{t('rates.otherOptions')}</a>
        </>
      )}
      <RunResult run={rates.run} />
    </div>
  )
}

/** Revenue by month (against the year before) and by year, side by side. `invoices` narrows it, e.g. to one customer. */
export function RevenueCharts({ today, invoices }: { today: string; invoices?: Invoice[] }) {
  const { t } = useTranslation()
  const r = useRevenue(today, invoices)
  return (
    <div className="grid grid-cols-5 gap-x-6 gap-y-4 mobile-stack">
      {r.recent && <section className="col-span-3">
        <h2 className="mb-3 font-display text-2xl font-semibold">{t('home.byMonth')}</h2>
        <Card className="px-6 py-5"><MonthChart r={r} /></Card>
      </section>}
      {/* Without months to show, the years alone, full width. */}
      <section className={r.recent ? 'col-span-2' : 'col-span-5'}>
        <h2 className="mb-3 font-display text-2xl font-semibold">{t('home.byYear')}</h2>
        <Card className="px-6 py-5"><YearChart r={r} /></Card>
      </section>
      <MissingRates r={r} className="col-span-5 -mt-2" />
    </div>
  )
}

/** One revenue box with a switch between months and years (Home, the owner, 2026-11-01). */
export function RevenueSwitch({ today, className }: { today: string; className?: string }) {
  const { t } = useTranslation()
  const r = useRevenue(today)
  const [view, setView] = useState<'months' | 'years'>('months')
  // Nothing billed this year or last: the month view would be empty, so the years show and the switch goes.
  const shown = r.recent ? view : 'years'
  return (
    <section className={`flex flex-col ${className ?? ''}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="font-display text-2xl font-semibold">{t('home.revenue')}</h2>
        {r.recent && <Segmented label={t('home.revenueView')} value={view} onChange={setView}
          options={[['months', t('home.viewMonths')], ['years', t('home.viewYears')]]} />}
      </div>
      {/* The note sits inside the box, so the box and the invoice list next to it end on one line. */}
      <Card className="flex flex-1 flex-col justify-between gap-3 px-6 py-5">
        {shown === 'months' ? <MonthChart r={r} /> : <YearChart r={r} />}
        <MissingRates r={r} />
      </Card>
    </section>
  )
}
