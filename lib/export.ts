import { VocabularyItem } from '@/types'

export function toCsv(items: VocabularyItem[]): string {
  const header = ['word', 'translation', 'context', 'language', 'status', 'created_at']
  const rows = items.map(v => [v.word, v.translation, v.context ?? '', v.language, v.status, v.created_at])
  const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`
  return [header, ...rows].map(row => row.map(escape).join(',')).join('\n')
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCsv(items: VocabularyItem[], filename = 'vocabulario.csv') {
  triggerDownload(new Blob([toCsv(items)], { type: 'text/csv;charset=utf-8;' }), filename)
}

// El .apkg se genera en el servidor (app/api/export/apkg/route.ts) — la librería
// anki-apkg-export no es compatible con bundlers de navegador modernos, pero
// funciona sin problemas en Node.
export async function downloadApkg(items: VocabularyItem[], deckName = 'Lingoleaf') {
  const res = await fetch('/api/export/apkg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deckName, items }),
  })
  if (!res.ok) throw new Error('No se pudo generar el mazo de Anki')
  const blob = await res.blob()
  triggerDownload(blob, `${deckName}.apkg`)
}
