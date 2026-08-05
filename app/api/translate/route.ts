import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const word = searchParams.get('word')
  const from = searchParams.get('from') || 'fr'
  const to = searchParams.get('to') || 'es'

  if (!word) return NextResponse.json({ error: 'No word provided' }, { status: 400 })

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${from}|${to}`
    )
    const data = await res.json()
    const translation = data.responseData?.translatedText || ''

    return NextResponse.json({ word, translation, language: from })
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
