import type { CSSProperties } from 'react'

// Estilos inline porque LingoLeaf-vf.html los define así (colores oklch dinámicos por idioma,
// no expresables como clases Tailwind estáticas) — mantiene el puerto fiel al original.
export const authInputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(20,24,28,0.16)',
  fontSize: 15,
  marginBottom: 14,
  background: '#fff',
  color: '#14181C',
}

export function authButtonStyle(accent: string): CSSProperties {
  return {
    width: '100%',
    marginTop: 10,
    padding: 14,
    border: 'none',
    borderRadius: 100,
    background: accent,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  }
}

export const authHeadingStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  margin: '0 0 6px',
  color: '#14181C',
}
