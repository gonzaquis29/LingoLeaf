'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { accentBase } from '@/lib/theme'
import { authInputStyle, authButtonStyle, authHeadingStyle } from '@/components/Auth/authStyles'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, undefined)
  const accent = accentBase()

  return (
    <form action={formAction} className="font-sans">
      <h1 className="font-jakarta" style={authHeadingStyle}>
        Crea tu cuenta
      </h1>
      <p className="mb-5 text-sm" style={{ color: '#6B6E76' }}>
        Lectura interactiva y vocabulario con repetición espaciada, gratis.
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
        minLength={8}
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        style={authInputStyle}
      />
      <input
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Repite tu contraseña"
        style={{ ...authInputStyle, marginBottom: 8 }}
      />

      {state?.error && (
        <p role="alert" className="text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="font-jakarta" style={authButtonStyle(accent)}>
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <p className="mt-4 text-center text-sm" style={{ color: '#6B6E76' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold" style={{ color: accent }}>
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
