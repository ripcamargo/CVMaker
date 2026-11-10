import type { Education, Experience, Position } from '../types/resume'
import { LABELS, type Lang } from '../data/i18n'

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

/** "2022-03" -> "mar 2022" (pt) / "Mar 2022" (en) */
export function formatMonth(value: string, lang: Lang = 'pt'): string {
  if (!value) return ''
  const [y, m] = value.split('-')
  if (!y) return ''
  if (!m) return y
  return `${LABELS[lang].months[Number(m) - 1] ?? ''} ${y}`.trim()
}

/** "2022-03" -> "03/2022" (Europass style) */
export function formatMonthNumeric(value: string): string {
  if (!value) return ''
  const [y, m] = value.split('-')
  return m ? `${m}/${y}` : y
}

type Fmt = (v: string, lang: Lang) => string

export function experiencePeriod(e: Experience, fmt: Fmt = formatMonth, lang: Lang = 'pt'): string {
  const start = fmt(e.start, lang)
  const end = e.current ? LABELS[lang].present : fmt(e.end, lang)
  if (!start && !end) return ''
  if (!start) return end
  if (!end) return start
  return `${start} – ${end}`
}

/** Most recent role first: the experience itself, then the earlier positions. */
export function positionsOf(e: Experience): Position[] {
  const main: Position = {
    id: e.id,
    role: e.role,
    start: e.start,
    end: e.end,
    current: e.current,
    description: e.description,
    achievements: e.achievements,
  }
  return [main, ...(e.previous ?? [])]
}

export function positionPeriod(p: Position, fmt: Fmt = formatMonth, lang: Lang = 'pt'): string {
  return experiencePeriod({ start: p.start, end: p.end, current: p.current } as Experience, fmt, lang)
}

/** Whole time at the company: earliest start until the end of the most recent role. */
export function companyPeriod(e: Experience, fmt: Fmt = formatMonth, lang: Lang = 'pt'): string {
  const starts = positionsOf(e).map((p) => p.start).filter(Boolean).sort()
  return experiencePeriod({ ...e, start: starts[0] ?? e.start }, fmt, lang)
}

export function educationPeriod(e: Education, fmt: Fmt = formatMonth, lang: Lang = 'pt'): string {
  const L = LABELS[lang]
  const start = fmt(e.start, lang)
  let end = fmt(e.end, lang)
  if (end && e.status === 'ongoing') end = `${end} (${L.expected})`
  if (!end && e.status === 'ongoing') end = L.ongoing
  if (!start && !end) return ''
  if (!start) return end
  if (!end) return start
  return `${start} – ${end}`
}

export type TextLine = { type: 'bullet' | 'text'; text: string }

/** Turns a free textarea into paragraphs and bullets (lines starting with -, • or *). */
export function parseLines(value: string): TextLine[] {
  return value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^[-•*–]\s+(.*)$/)
      return m ? { type: 'bullet' as const, text: m[1] } : { type: 'text' as const, text: l }
    })
}

export function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}

export function hrefOf(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}


/** Reads an image file and returns a square-ish, downsized JPEG data URL (keeps localStorage small). */
export function fileToResizedDataUrl(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Imagem inválida'))
      img.onload = () => {
        // center-crop to square
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const out = Math.min(max, side)
        const canvas = document.createElement('canvas')
        canvas.width = out
        canvas.height = out
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, out, out)
        ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
