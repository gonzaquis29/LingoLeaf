import { NextRequest, NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import { detectLanguage } from '@/lib/detectLanguage'

// AC US3.2: extrae el contenido principal (sin nav/anuncios/comentarios) con Readability —
// la misma librería detrás de la vista de lectura de Firefox, sin costo ni API key.
export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Falta la URL.' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('protocol')
  } catch {
    return NextResponse.json({ error: 'Esa URL no es válida.' }, { status: 400 })
  }

  let html: string
  try {
    const res = await fetch(parsedUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LingoleafBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error('fetch failed')
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'No se pudo acceder a esa URL.' }, { status: 422 })
  }

  let article
  try {
    const dom = new JSDOM(html, { url: parsedUrl.toString() })
    article = new Readability(dom.window.document).parse()
  } catch {
    article = null
  }

  const content = article?.textContent?.trim().replace(/\n{3,}/g, '\n\n')
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0

  if (!content || wordCount < 15) {
    return NextResponse.json(
      { error: 'No se pudo extraer texto legible de esa página.' },
      { status: 422 }
    )
  }

  return NextResponse.json({
    title: article?.title?.trim() || 'Sin título',
    content,
    language: detectLanguage(content),
    wordCount,
  })
}
