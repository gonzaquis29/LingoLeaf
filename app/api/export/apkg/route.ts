import { NextRequest, NextResponse } from 'next/server'
// @ts-expect-error -- no aporta tipos propios
import AnkiExport from 'anki-apkg-export'

export const runtime = 'nodejs'

interface ExportableCard {
  word: string
  translation: string
  context?: string
}

export async function POST(req: NextRequest) {
  const { deckName, items }: { deckName?: string; items: ExportableCard[] } = await req.json()

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No hay tarjetas para exportar' }, { status: 400 })
  }

  const apkg = new AnkiExport(deckName || 'Lingoleaf')
  for (const item of items) {
    const front = item.context ? `${item.word}<br><i>${item.context}</i>` : item.word
    apkg.addCard(front, item.translation)
  }

  const zip: Buffer = await apkg.save()

  return new NextResponse(zip, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${(deckName || 'Lingoleaf').replace(/[^a-zA-Z0-9-_]/g, '_')}.apkg"`,
    },
  })
}
