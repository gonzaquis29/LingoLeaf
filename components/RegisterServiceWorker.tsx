'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    // Solo en producción: un service worker registrado en desarrollo sobrevive a los reinicios
    // de `next dev` y puede quedar sirviendo respuestas viejas/rotas — un problema clásico de
    // SW-en-dev, no algo que valga la pena mientras seguimos iterando.
    if (process.env.NODE_ENV !== 'production') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // instalar la PWA es una mejora, no un requisito — si falla el registro, la app sigue
        // funcionando normal como página web.
      })
    }
  }, [])

  return null
}
