import { cn } from '@/ui/primitives'

/** A segmented control, the same as the settings tabs: the chosen part is a white segment on a tinted track. */
export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-0.5 rounded-2xl bg-track p-[3px]">
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={cn('rounded-md px-3 py-[3px] text-sm leading-label font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-link',
            value === v ? 'bg-surface text-fg' : 'text-fg-muted hover:text-fg')}>
          {text}
        </button>
      ))}
    </div>
  )
}
