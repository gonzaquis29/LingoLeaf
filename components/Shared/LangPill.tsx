import type { CSSProperties } from 'react'
import { accentBase } from '@/lib/theme'
import type { Language } from '@/types'

// Sin background/border/color acá a propósito: un inline style le gana a cualquier clase de
// Tailwind (incluida la variante has-checked:), así que esas tres viven en className para poder
// competir en el mismo nivel que el estado "marcado" — ver abajo.
const pillStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: 100,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
}

export function LangPill({
  inputType,
  name,
  value,
  label,
  flag,
  defaultChecked,
}: {
  inputType: 'radio' | 'checkbox'
  name: string
  value: Language
  label: string
  flag: string
  defaultChecked?: boolean
}) {
  return (
    <label
      style={{ ...pillStyle, ['--pill-accent' as string]: accentBase(value) }}
      className="border border-[rgba(30,42,32,0.16)] bg-white text-[#14181C] has-checked:border-transparent has-checked:bg-[var(--pill-accent)] has-checked:text-white"
    >
      <input type={inputType} name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      {flag} · {label}
    </label>
  )
}
