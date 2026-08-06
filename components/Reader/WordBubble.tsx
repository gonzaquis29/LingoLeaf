import { COLORS } from '@/lib/theme'
import type { WordStatus } from '@/types'

export function WordBubble({
  word,
  translation,
  loading,
  level,
  status,
  onSpeak,
  onSave,
  onMarkKnown,
  saving,
}: {
  word: string
  translation?: string
  loading?: boolean
  level?: number
  status?: WordStatus
  onSpeak?: () => void
  onSave?: () => void
  onMarkKnown?: () => void
  saving?: boolean
}) {
  return (
    <span
      className="lf-word-bubble absolute left-1/2 top-full z-20 mt-2.5 w-52 rounded-xl p-3.5 text-left text-sm normal-case"
      style={{ background: '#fff', boxShadow: '0 12px 30px rgba(20,24,28,0.18)' }}
    >
      <span
        className="absolute left-1/2 -top-1.5 h-3 w-3 -translate-x-1/2 rotate-45"
        style={{ background: '#fff', boxShadow: '-3px -3px 4px -3px rgba(20,24,28,0.12)' }}
        aria-hidden="true"
      />
      <strong className="font-jakarta block" style={{ color: COLORS.ink, fontSize: 14.5 }}>
        {word}
      </strong>
      <span className="mt-0.5 block" style={{ color: COLORS.muted }}>
        {loading ? 'Traduciendo…' : translation || '—'}
      </span>
      {status === 'learning' && level && (
        <span className="mt-1 block text-xs font-semibold" style={{ color: COLORS.stateLearning }}>
          Aprendiendo · nivel {level}/4
        </span>
      )}
      {status === 'known' && (
        <span className="mt-1 block text-xs font-semibold" style={{ color: COLORS.stateKnown }}>
          Conocida
        </span>
      )}
      <span className="mt-2.5 flex items-center gap-2">
        {onSpeak && (
          <button
            type="button"
            onClick={onSpeak}
            className="rounded-full px-2.5 py-1 text-xs"
            style={{ background: COLORS.mossSoft, color: COLORS.ink }}
          >
            🔊
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="font-jakarta rounded-full px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
            style={{ background: COLORS.mossMid }}
          >
            {saving ? 'Guardando…' : '+ Añadir a repaso'}
          </button>
        )}
        {onMarkKnown && (
          <button
            type="button"
            onClick={onMarkKnown}
            disabled={saving}
            className="rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            style={{ border: '1px solid rgba(20,24,28,0.2)', color: COLORS.ink }}
          >
            Ya la sé
          </button>
        )}
      </span>
    </span>
  )
}
