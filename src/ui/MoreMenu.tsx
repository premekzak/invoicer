import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './primitives'

export type MoreItem = { key: string; icon: ReactNode; label: string; onClick: () => void }

/**
 * "Více": the rarer actions of a screen, so its row keeps only the frequent ones (the design kit's order: main, secondary,
 * destructive, then this menu). The invoice editor puts cancel, credit note and mark unpaid here, as Fakturoid does; the
 * invoice list the export for the accountant and the bank statement import.
 */
export function MoreMenu({ items, size }: { items: MoreItem[]; size?: 'sm' | 'md' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', esc) }
  }, [open])
  if (!items.length) return null
  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size={size} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal className="size-4" /> {t('editor.more')}
      </Button>
      {open && (
        <div role="menu" className="animate-rise absolute right-0 z-20 mt-1 min-w-52 rounded-xl border border-line bg-surface p-1">
          {items.map((it) => (
            <button key={it.key} type="button" role="menuitem" onClick={() => { setOpen(false); it.onClick() }}
              className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-left text-sm leading-label whitespace-nowrap hover:bg-tint">
              {it.icon} {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
