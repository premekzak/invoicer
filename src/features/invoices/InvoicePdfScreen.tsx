import { BellRing, Check, Download, FileText, FolderDown, Loader2, Mail, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmailKind } from '@/domain/email'
import { today } from '@/domain/id'
import { displayStatus } from '@/domain/invoice'
import { hasQrPayment } from '@/domain/payment'
import { pdfPath, renderPdf } from '@/pdf'
import { useStore } from '@/state/store'
import { BackButton } from '@/ui/BackButton'
import { StatusBadge, useFormat } from '@/ui/format'
import { Button, Card } from '@/ui/primitives'
import { navigate, type Route } from '@/ui/router'
import { EmailDialog } from './EmailDialog'
import { downloadBlob, savePdfToFolder } from './PdfPreview'

type Saving = { state: 'saving' } | { state: 'saved'; path: string } | { state: 'failed'; message: string }

/** Issues already confirmed and saved in this visit, by invoice id. */
const issueHandled = new Set<string>()

const TITLE = { invoice: 'editor.title', proforma: 'editor.proformaTitle', creditNote: 'editor.creditTitle', advanceTaxDoc: 'editor.taxDocTitle' } as const

/**
 * An issued document's PDF as a screen of its own (the owner, 2026-11-01, instead of the preview window): the PDF on
 * the left, and on the right what just happened and what comes next. Issuing lands here with `?issued=1`, which stores
 * the PDF in the data folder and says where it went.
 */
export function InvoicePdfScreen({ route }: { route: Route }) {
  const { t } = useTranslation()
  const f = useFormat()
  const { invoices, settings, adapter, upsertInvoice } = useStore()
  const inv = invoices.find((i) => i.id === route.path[1])
  // Once per issue: coming back to this screen later (Back, Forward) shows no confirmation and doesn't save again.
  const [justIssued] = useState(() => route.query.get('issued') === '1' && !issueHandled.has(route.path[1]))
  const [blob, setBlob] = useState<Blob>()
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState<Saving>()
  const [email, setEmail] = useState<EmailKind>()

  useEffect(() => {
    if (!inv) return
    let revoked = false
    let objectUrl: string | undefined
    renderPdf(inv, settings!)
      .then((b) => {
        if (revoked) return
        objectUrl = URL.createObjectURL(b)
        setBlob(b)
        setUrl(objectUrl)
      })
      .catch((e: Error) => setError(e.message))
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [inv, settings])

  /** Writes the PDF into the folder and reports it; the folder keeps the same file name, so saving again replaces it. */
  function saveToFolder() {
    if (!inv) return
    setSaving({ state: 'saving' })
    savePdfToFolder(inv)
      .then((path) => setSaving({ state: 'saved', path }))
      .catch((e: Error) => setSaving({ state: 'failed', message: e.message }))
  }

  // Issuing stores the PDF once. The URL keeps `issued`: changing it would remount the screen (it is keyed by the route).
  useEffect(() => {
    if (!justIssued || !inv || issueHandled.has(inv.id)) return
    issueHandled.add(inv.id)
    saveToFolder()
  }, [justIssued, inv?.id])

  if (!inv) return <p className="text-fg-muted">{t('editor.notFound')}</p>

  const status = displayStatus(inv)
  const fileName = pdfPath(inv).split('/').pop()!
  const canSend = inv.status === 'issued' && !inv.uncollectible && (inv.kind === 'invoice' || inv.kind === 'proforma')
  const qr = hasQrPayment(inv, settings!.supplier.bank.iban)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="relative flex items-center gap-3">
          <BackButton />
          <h1 className="font-display text-3xl leading-[1.2] font-semibold whitespace-nowrap">{t(TITLE[inv.kind], { number: inv.number })}</h1>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_20rem] items-start gap-6 mobile-stack">
        <Card className="overflow-hidden">
          {error ? <p className="p-6 text-sm text-danger">{error}</p>
            : url ? <iframe title={fileName} src={url} className="block h-[calc(100vh-12rem)] min-h-[36rem] w-full" />
            : <div className="grid h-[calc(100vh-12rem)] min-h-[36rem] place-items-center bg-surface-2 text-fg-muted"><Loader2 className="size-6 animate-spin" /></div>}
        </Card>

        <div className="space-y-6">
          {(justIssued || saving) && (
            <div role="status" className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-chip">
                {saving?.state === 'saving' ? <Loader2 aria-hidden="true" className="size-4 animate-spin text-success" />
                  : <Check aria-hidden="true" className="size-5 text-success" strokeWidth={2.5} />}
              </span>
              <div className="min-w-0 space-y-0.5">
                {justIssued && <p className="text-base font-semibold">{t(inv.kind === 'invoice' ? 'pdfScreen.issued' : 'pdfScreen.issuedDoc')}</p>}
                <p className="text-sm break-words text-fg-muted">
                  {saving?.state === 'saving' ? t('pdfScreen.saving')
                    : saving?.state === 'saved' ? t('pdfScreen.savedIn', { path: `${adapter?.name}/${saving.path}` })
                    : saving?.state === 'failed' ? <span className="text-danger">{t('pdf.saveFailed')}: {saving.message}</span>
                    : null}
                </p>
              </div>
            </div>
          )}

          {qr && <p className="max-w-hint text-sm text-fg-muted">{t('pdfScreen.qr')}</p>}

          <div className="flex flex-col items-stretch gap-2">
            {canSend && (
              <Button onClick={() => setEmail(status === 'overdue' ? 'reminder' : 'invoice')}>
                {status === 'overdue' ? <><BellRing className="size-4" /> {t('email.remind')}</> : <><Mail className="size-4" /> {t('email.send')}</>}
              </Button>
            )}
            <Button variant="secondary" disabled={!blob} onClick={() => blob && downloadBlob(blob, fileName)}>
              <Download className="size-4" /> {t('pdf.download')}
            </Button>
            {!justIssued && (
              <Button variant="secondary" disabled={saving?.state === 'saving'} onClick={saveToFolder}>
                <FolderDown className="size-4" /> {t('pdf.saveToFolder')}
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate(`/invoices/${inv.id}`)}><FileText className="size-4" /> {t('pdfScreen.details')}</Button>
            <Button variant="ghost" onClick={() => navigate('/invoices/new')}><Plus className="size-4" /> {t('nav.newInvoice')}</Button>
          </div>

          {(inv.sentAt || inv.reminders.length > 0) && (
            <p className="text-sm text-fg-muted">
              {inv.sentAt && t('email.sentOn', { date: f.date(inv.sentAt) })}
              {inv.sentAt && inv.reminders.length > 0 && ' · '}
              {inv.reminders.length > 0 && t('email.remindedOn', { count: inv.reminders.length, date: f.date(inv.reminders.at(-1)!) })}
            </p>
          )}
        </div>
      </div>

      {email && (
        <EmailDialog invoice={inv} kind={email} onClose={() => setEmail(undefined)}
          onSent={() => upsertInvoice(email === 'reminder' ? { ...inv, reminders: [...inv.reminders, today()] } : { ...inv, sentAt: today() })} />
      )}
    </div>
  )
}
