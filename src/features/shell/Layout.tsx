import { ChartBarIcon, Cog6ToothIcon, DocumentTextIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/solid'
import { Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/state/store'
import { Logo, WORDMARK } from '@/ui/Logo'
import { cn } from '@/ui/primitives'
import { BusinessSwitcher } from './BusinessSwitcher'
import { ConflictBanner, SaveStatus } from './SaveStatus'

const items = [
  { key: 'home', path: '/', icon: HomeIcon },
  { key: 'invoices', path: '/invoices', icon: DocumentTextIcon },
  { key: 'customers', path: '/customers', icon: UsersIcon },
  { key: 'stats', path: '/stats', icon: ChartBarIcon },
  { key: 'settings', path: '/settings', icon: Cog6ToothIcon },
] as const

/**
 * Phones (the owner, 2026-10-18): the pages as a list under the header, opened from the menu button. It sits in the page
 * flow, so it pushes the page down rather than covering it; choosing a page or Escape closes it.
 */
function MobileMenu({ section, onClose }: { section: string; onClose: () => void }) {
  const { t } = useTranslation()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <nav id="mobile-menu" className="border-b border-line bg-surface py-1 font-nav font-medium md:hidden">
      {items.map(({ key, path, icon: Icon }) => (
        <a key={key} href={`#${path}`} onClick={onClose} aria-current={section === key ? 'page' : undefined}
          className={cn('flex items-center gap-3 px-4 py-3 text-sm leading-label transition-colors',
            section === key ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:bg-tint hover:text-fg')}>
          <Icon className="size-4 text-accent" /> {t(`nav.${key}`)}
        </a>
      ))}
    </nav>
  )
}

export function Layout({ section, children }: { section: string; children: ReactNode }) {
  const { t } = useTranslation()
  const { demo } = useStore()
  const [menu, setMenu] = useState(false)
  // A page change (also by the back button) closes the phone menu.
  useEffect(() => setMenu(false), [section])
  return (
    <div className="flex min-h-screen flex-col">
      {/* The header, one row the colour of the page (the owner, 2026-10-17 replacing the sidebar, 2026-10-31 all in one line on
          the left): the logo, then the pages (a menu button on phones), the business with its save tick on the right. "Nová faktura" lives on the invoice list and in Home's blue tile. */}
      <header className="scheme-header bg-header text-header-fg">
        {/* 44 px tall; the logo and wordmark at the size of the page links (the owner, 2026-10-31), the links right after them. */}
        <div className="mx-auto flex max-w-6xl items-center gap-x-3 px-4 md:gap-x-5 md:px-8">
          <a href="#/" className="flex h-11 shrink-0 items-center gap-1.5" title={t('nav.home')}>
            <Logo className="size-4" />
            <span className="font-sans text-sm font-bold">{WORDMARK}</span>
          </a>
          {/* Plain text links, no tabs or icons (the owner, 2026-10-31: "ať je to co nejjednodušší"): Inter 500 at 14 px, the
              inactive ones in the muted header text, the current one a rounded rectangle in `header-active` (`rounded-md`, the owner chose it over a pill) with full header text in 600, so it is
              told apart by more than colour. */}
          <nav className="hidden items-center gap-1 font-nav font-medium md:flex">
            {items.map(({ key, path }) => (
              <a
                key={key}
                href={`#${path}`}
                aria-current={section === key ? 'page' : undefined}
                className={cn(
                  'flex h-8 items-center rounded-md px-3 text-sm leading-label whitespace-nowrap transition-colors',
                  section === key ? 'bg-header-active font-semibold text-header-fg' : 'text-header-muted hover:text-header-fg',
                )}
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex h-11 min-w-0 items-center gap-1">
            {/* Demo mode looks exactly like real data, for screenshots (the owner, 2026-10-18); it is switched off in Settings → Aplikace. */}
            <SaveStatus />
            <BusinessSwitcher />
          </div>
          <button type="button" className="-mr-2 flex size-11 items-center justify-center text-header-fg md:hidden"
            aria-expanded={menu} aria-controls="mobile-menu" aria-label={t(menu ? 'common.close' : 'nav.menu')} onClick={() => setMenu(!menu)}>
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>
      {menu && <MobileMenu section={section} onClose={() => setMenu(false)} />}
      <main className="flex-1">
        {/* Remount on demo toggle so no editor keeps a draft from the other data set. */}
        <div key={`${section}:${demo}`} className="animate-rise mx-auto max-w-6xl px-4 pt-6 pb-8 md:px-8 md:pt-8">{children}</div>
      </main>
      {/* Espresso with a very slight gradient (the owner's request, 2026-10-17); `on-inverse` gives the logo its dark-mode
          colours (an orange receipt), which stay visible on espresso. */}
      <footer className="scheme-footer on-inverse mt-16 text-footer-fg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-8 md:px-8">
          <div className="flex items-center gap-3">
            <Logo className="size-7" />
            <div>
              <div className="font-sans text-lg font-bold">{WORDMARK}</div>
              <div className="text-xs text-footer-muted">{t('app.tagline')}</div>
            </div>
          </div>
          <div className="text-xs text-footer-muted md:text-right">
            <div>{t('app.footerNote')}</div>
            <a href="https://invojka.cz" target="_blank" rel="noopener noreferrer" className="font-medium text-footer-fg underline underline-offset-2 decoration-footer-muted hover:decoration-current">invojka.cz</a>
          </div>
        </div>
      </footer>
      <ConflictBanner />
    </div>
  )
}
