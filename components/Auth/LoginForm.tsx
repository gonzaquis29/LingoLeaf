'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { accentBase } from '@/lib/theme'
import { authInputStyle, authButtonStyle, authHeadingStyle } from '@/components/Auth/authStyles'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined)
  const accent = accentBase()

  return (
    <form action={formAction} className="font-sans">
      <h1 className="font-jakarta" style={authHeadingStyle}>
        Inicia sesión
      </h1>
      <p className="mb-5 text-sm" style={{ color: '#6B6E76' }}>
        Sigue leyendo donde lo dejaste.
      </p>

      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@email.com"
        style={authInputStyle}
      />
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Contraseña"
        style={{ ...authInputStyle, marginBottom: 8 }}
      />

      {state?.error && (
        <p role="alert" className="text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="font-jakarta" style={authButtonStyle(accent)}>
        {pending ? 'Entrando…' : 'Iniciar sesión'}
      </button>

      <p className="mt-4 text-center text-sm" style={{ color: '#6B6E76' }}>
        ¿Todavía no tienes cuenta?{' '}
        <Link href="/register" className="font-semibold" style={{ color: accent }}>
          Regístrate
        </Link>
      </p>
    </form>
  )
}
