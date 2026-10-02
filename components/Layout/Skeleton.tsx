'use client'

import type { CSSProperties } from 'react'
import { CARD_RADIUS } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'

export function Skeleton({ style, className = '' }: { style?: CSSProperties; className?: string }) {
  return <div className={`lf-skeleton rounded-lg ${className}`} style={style} />
}

// Mismo alto (68px) y misma estructura que el Header real (logo, navegación, píldoras), para que
// no salte ni "pierda" elementos mientras carga la página.
export function HeaderSkeleton() {
  const t = useT()
  return (
    <div
      className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 px-4 sm:px-8"
      style={{ background: '#FAFAFB', borderBottom: '1px solid rgba(20,24,28,0.12)' }}
    >
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 4C25 8 27 18 16 28C5 18 7 8 16 4Z" fill="#14181C" />
          <path d="M16 9V24M16 15L11 11M16 21L21 17" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="font-jakarta hidden text-[19px] font-extrabold sm:inline" style={{ color: '#14181C' }}>
          Lingoleaf
        </span>
      </div>
      <div className="hidden items-center gap-[26px] md:flex">
        {(['nav_library', 'nav_vocabulary', 'nav_review'] as const).map((key) => (
          <span key={key} className="text-sm font-semibold" style={{ color: '#14181C' }}>
            {t(key)}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 sm:gap-3.5">
        <Skeleton style={{ width: 56, height: 34, borderRadius: 100 }} />
        <Skeleton style={{ width: 96, height: 34, borderRadius: 100 }} />
        <Skeleton style={{ width: 34, height: 34, borderRadius: '50%' }} />
      </div>
    </div>
  )
}

// Mismo alto mínimo (196px) que el banner real de cada pantalla.
export function BannerSkeleton() {
  return <Skeleton className="mb-8 rounded-none" style={{ height: 196, width: '100%' }} />
}

export function CardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ background: '#FAFAFB', borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)' }}
    >
      <Skeleton className="rounded-none" style={{ height: 130 }} />
      <div className="flex flex-col gap-2.5 px-[18px] pb-5 pt-[18px]">
        <Skeleton style={{ height: 16, width: '70%' }} />
        <Skeleton style={{ height: 12, width: '45%' }} />
        <Skeleton style={{ height: 36, width: '100%', borderRadius: 100, marginTop: 6 }} />
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4"
      style={{ background: '#FAFAFB', borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)' }}
    >
      <div className="flex-1">
        <Skeleton style={{ height: 15, width: '35%', marginBottom: 8 }} />
        <Skeleton style={{ height: 12, width: '55%' }} />
      </div>
      <Skeleton style={{ height: 12, width: 70 }} />
    </div>
  )
}
