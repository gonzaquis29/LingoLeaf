import { NextRequest, NextResponse } from 'next/server'
import { translateWord } from '@/lib/translate'
import type { Language } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const word = searchParams.get('word')
  const from = (searchParams.get('from') || 'fr') as Language
  const to = (searchParams.get('to') || 'es') as Language

  if (!word) return NextResponse.json({ error: 'No word provided' }, { status: 400 })

  try {
    const translation = await translateWord(word, from, to)
    return NextResponse.json({ word, translation, language: from })
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
