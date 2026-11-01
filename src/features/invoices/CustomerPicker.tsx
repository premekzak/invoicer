import { ChevronsUpDown, Plus } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { nameKey } from '@/domain/id'
import type { Customer } from '@/domain/schema'
import { cn } from '@/ui/primitives'

const NO_RECENT: string[] = []

/** Searchable customer select, keyboard-friendly (↑ ↓ Enter Esc). */
export function CustomerPicker({ customers, value, name, onChange, onCreate, autoFocus, recent = NO_RECENT, ...aria }: {
  customers: Customer[]; value: string | null; onChange: (c: Customer) => void
  /** Ids of the customers invoiced last; with nothing typed they come first, under their own heading. */
  recent?: string[]
  /** The name to show for the picked customer: the invoice's printed name, which an issued invoice keeps after the customer is renamed. */
  name?: string
  /** Create a customer with the typed name (offered when nothing matches exactly). */
  onCreate?: (name: string) => void
  autoFocus?: boolean
  /** Passed on to the text input by `Labeled`. */
  id?: string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const selected = customers.find((c) => c.id === value)

  const { list, recentCount } = useMemo(() => {
    const k = nameKey(q)
    const all = customers
      .filter((c) => !c.archived && (!k || nameKey(c.name).includes(k) || c.ic.includes(q.trim())))
      .sort((a, b) => a.name.localeCompare(b.name))
    // Before anything is typed, the customers invoiced last go first; only worth a heading when the list is longer.
    const top = k ? [] : recent.map((id) => all.find((c) => c.id === id)).filter((c): c is Customer => !!c)
    if (top.length === 0 || all.length <= top.length) return { list: all.slice(0, 50), recentCount: 0 }
    return { list: [...top, ...all.filter((c) => !top.includes(c))].slice(0, 50), recentCount: top.length }
  }, [customers, q, recent])

  useEffect(() => setActive(0), [q])
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const pick = (c: Customer) => { onChange(c); setOpen(false); setQ('') }
  const typed = q.trim()
  const canCreate = !!onCreate && !!typed && !customers.some((c) => nameKey(c.name) === nameKey(typed))
  const create = () => { onCreate!(typed); setOpen(false); setQ('') }

  return (
    <div ref={ref} className="relative">
      <div className="control flex h-9 items-center px-3">
        <input
          {...aria}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-fg-subtle"
          placeholder={selected ? name || selected.name : t('editor.pickCustomer')}
          value={open ? q : selected ? name || selected.name : ''}
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, list.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
            else if (e.key === 'Enter' && list[active]) { e.preventDefault(); pick(list[active]) }
            else if (e.key === 'Enter' && canCreate) { e.preventDefault(); create() }
            else if (e.key === 'Escape') setOpen(false)
          }}
        />
        <ChevronsUpDown className="size-4 text-fg-subtle" />
      </div>
      {open && (
        <div className="animate-rise absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-line bg-surface p-1">
          {list.length === 0 && !canCreate && <div className="px-3 py-2 text-sm text-fg-muted">{t('editor.noCustomer')}</div>}
          {list.map((c, i) => (
            <Fragment key={c.id}>
              {recentCount > 0 && (i === 0 || i === recentCount) && (
                <div className={cn('px-3 pt-2 pb-1 text-xs text-fg-muted', i > 0 && 'mt-1 border-t border-line')}>
                  {t(i === 0 ? 'editor.recentCustomers' : 'editor.allCustomers')}
                </div>
              )}
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => pick(c)}
                className={cn('flex w-full items-center justify-between rounded-xs px-3 py-2 text-left text-sm leading-label', i === active && 'bg-surface-2')}>
                <span className="truncate">{c.name}</span>
                <span className="ml-3 shrink-0 tabular-nums text-xs text-fg-subtle">{c.ic || c.address.country}</span>
              </button>
            </Fragment>
          ))}
          {canCreate && (
            <button type="button" onClick={create}
              className={cn('flex w-full items-center gap-2 rounded-xs px-3 py-2 text-left text-sm leading-label text-link hover:bg-tint', list.length === 0 && 'bg-surface-2')}>
              <Plus className="size-4" /> {t('customers.create', { name: typed })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
