'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { setActiveLang } from '@/app/actions/profile'
import { languageInfo } from '@/lib/languages'
import { COLORS } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { Language } from '@/types'

export function Header({
  activeLang,
  learningLanguages,
  streakDays,
  dueCount,
}: {
  activeLang?: Language
  learningLanguages?: Language[]
  streakDays?: number
  dueCount?: number
}) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<'lang' | 'user' | null>(null)
  const [switching, startSwitch] = useTransition()
  const headerRef = useRef<HTMLElement>(null)
  const active = activeLang ? languageInfo(activeLang) : undefined
  const otherLangs = (learningLanguages ?? []).filter((code) => code !== activeLang)

  // Un solo menú abierto a la vez; se cierra con clic fuera, Escape o al navegar.
  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  // Cambiar de idioma no te saca de la pantalla actual. Única excepción: el Lector, donde el texto
  // abierto está en el idioma anterior y quedarse no mostraría ningún efecto del cambio.
  function switchLanguage(code: Language) {
    setOpenMenu(null)
    startSwitch(async () => {
      await setActiveLang(code)
      if (pathname.startsWith('/reader')) router.push('/library')
    })
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 px-4 sm:px-8"
      style={{ background: '#FAFAFB', borderBottom: '1px solid rgba(20,24,28,0.12)' }}
    >
      <Link href="/library" className="flex shrink-0 items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 4C25 8 27 18 16 28C5 18 7 8 16 4Z" fill="#14181C" />
          <path d="M16 9V24M16 15L11 11M16 21L21 17" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="font-jakarta hidden text-[19px] font-extrabold sm:inline" style={{ color: '#14181C' }}>
          Lingoleaf
        </span>
      </Link>

      <div className="hidden items-center gap-[26px] md:flex">
        <Link href="/library" className="text-sm font-semibold" style={{ color: '#14181C' }}>
          {t('nav_library')}
        </Link>
        <Link href="/vocabulary" className="text-sm font-semibold" style={{ color: '#14181C' }}>
          {t('nav_vocabulary')}
        </Link>
        <Link href="/review" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#14181C' }}>
          {t('nav_review')}
          {!!dueCount && (
            <span
              className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-bold text-white"
              style={{ background: 'oklch(58% 0.20 25)' }}
            >
              {dueCount}
            </span>
          )}
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
        {typeof streakDays === 'number' && (
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3"
            style={{ background: 'oklch(92% 0.05 40)' }}
          >
            <span className="text-sm">🔥</span>
            <span className="text-sm font-bold" style={{ color: 'oklch(42% 0.14 40)' }}>
              {streakDays}
            </span>
          </div>
        )}

        {active && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'lang' ? null : 'lang')}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'lang'}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5"
              style={{ background: '#fff', border: '1px solid rgba(20,24,28,0.14)', opacity: switching ? 0.6 : 1 }}
            >
              <span className="text-[15px]">{active.flag}</span>
              <span className="hidden text-sm sm:inline">{active.label}</span>
              <span className="text-[11px]" style={{ color: '#6B6E76' }}>
                ▾
              </span>
            </button>
            {openMenu === 'lang' && (
              <div
                role="menu"
                onClick={() => setOpenMenu(null)}
                className="absolute right-0 top-[44px] z-40 w-[190px] rounded-2xl p-2"
                style={{ background: '#fff', boxShadow: '0 12px 30px rgba(20,24,28,0.18)' }}
              >
                {otherLangs.map((code) => {
                  const info = languageInfo(code)
                  if (!info) return null
                  return (
                    <button
                      key={code}
                      type="button"
                      role="menuitem"
                      onClick={() => switchLanguage(code)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm"
                      style={{ color: '#14181C' }}
                    >
                      <span className="text-[15px]">{info.flag}</span>
                      {info.label}
                    </button>
                  )
                })}
                <Link
                  href="/profile"
                  className="mt-1 block rounded-lg px-3 py-2.5 text-left text-sm font-semibold"
                  style={{ color: COLORS.mossMid, borderTop: otherLangs.length > 0 ? '1px solid rgba(20,24,28,0.08)' : undefined }}
                >
                  {t('nav_add_language')}
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
            aria-haspopup="menu"
            aria-expanded={openMenu === 'user'}
            aria-label={t('nav_profile')}
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full font-jakarta font-bold text-white"
            style={{ background: '#14181C' }}
          >
            L
          </button>
          {openMenu === 'user' && (
          <div
            role="menu"
            onClick={() => setOpenMenu(null)}
            className="absolute right-0 top-[44px] z-40 w-[200px] rounded-2xl p-2"
            style={{ background: '#fff', boxShadow: '0 12px 30px rgba(20,24,28,0.18)' }}
          >
            <div className="mb-1 flex flex-col border-b pb-1 md:hidden" style={{ borderColor: 'rgba(20,24,28,0.08)' }}>
              <Link href="/library" className="rounded-lg px-3 py-2.5 text-left text-sm" style={{ color: '#14181C' }}>
                {t('nav_library')}
              </Link>
              <Link href="/vocabulary" className="rounded-lg px-3 py-2.5 text-left text-sm" style={{ color: '#14181C' }}>
                {t('nav_vocabulary')}
              </Link>
              <Link href="/review" className="rounded-lg px-3 py-2.5 text-left text-sm" style={{ color: '#14181C' }}>
                {t('nav_review')}{!!dueCount && ` (${dueCount})`}
              </Link>
            </div>
            <Link href="/profile" className="block rounded-lg px-3 py-2.5 text-left text-sm" style={{ color: '#14181C' }}>
              {t('nav_profile')}
            </Link>
            <Link href="/add" className="block rounded-lg px-3 py-2.5 text-left text-sm" style={{ color: '#14181C' }}>
              {t('nav_add_content')}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm"
                style={{ color: 'oklch(58% 0.20 25)' }}
              >
                {t('nav_sign_out')}
              </button>
            </form>
          </div>
          )}
        </div>
      </div>
    </header>
  )
}
