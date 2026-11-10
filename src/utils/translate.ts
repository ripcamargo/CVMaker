import type { ResumeData } from '../types/resume'

/**
 * Translation works on-device through the browser's built-in Translator API
 * (Chrome 138+). No server, no API key. Texts are cached per line in
 * `data.translations`, so editing one field only re-translates that field.
 */

type Mapper = (line: string) => string

const MARKER = /^([-•*–]\s+)?(.*)$/

/** Applies `fn` to every non-empty line of a free text, preserving bullet markers. */
function mapText(text: string, fn: Mapper): string {
  if (!text.trim()) return text
  return text
    .split('\n')
    .map((raw) => {
      const line = raw.trim()
      if (!line) return raw
      const m = line.match(MARKER)!
      return `${m[1] ?? ''}${fn(m[2])}`
    })
    .join('\n')
}

/** Calls `visit` for every translatable text field. Names of people, companies and institutions are never translated. */
function mapFields(data: ResumeData, fn: Mapper): ResumeData {
  const t = (s: string) => mapText(s, fn)
  return {
    ...data,
    personal: { ...data.personal, title: t(data.personal.title), summary: t(data.personal.summary) },
    experiences: data.experiences.map((e) => ({
      ...e,
      role: t(e.role),
      description: t(e.description),
      achievements: t(e.achievements),
      previous: e.previous?.map((p) => ({
        ...p,
        role: t(p.role),
        description: t(p.description),
        achievements: t(p.achievements),
      })),
    })),
    education: data.education.map((e) => ({ ...e, course: t(e.course), degree: t(e.degree) })),
    skills: data.skills.map((s) => ({ ...s, name: t(s.name) })),
    languages: data.languages.map((l) => ({ ...l, name: t(l.name) })),
    additional: data.additional.map((a) => ({ ...a, title: t(a.title), description: t(a.description) })),
  }
}

/** Returns the resume with every translatable text replaced by its cached translation (if any). */
export function localize(data: ResumeData): ResumeData {
  if (data.settings.lang === 'pt') return data
  const cache = data.translations
  return mapFields(data, (line) => cache[line] ?? line)
}

/** Lines that still have no cached translation. */
export function pendingLines(data: ResumeData): string[] {
  const out = new Set<string>()
  mapFields(data, (line) => {
    if (line.trim() && !(line in data.translations)) out.add(line)
    return line
  })
  return [...out]
}

// ---- Browser Translator API ------------------------------------------------

interface TranslatorLike {
  translate(text: string): Promise<string>
  destroy?: () => void
}
interface TranslatorStatic {
  availability(o: { sourceLanguage: string; targetLanguage: string }): Promise<string>
  create(o: {
    sourceLanguage: string
    targetLanguage: string
    monitor?: (m: EventTarget) => void
  }): Promise<TranslatorLike>
}

const api = (): TranslatorStatic | undefined => (globalThis as unknown as { Translator?: TranslatorStatic }).Translator

export async function translatorAvailable(): Promise<boolean> {
  const T = api()
  if (!T) return false
  try {
    return (await T.availability({ sourceLanguage: 'pt', targetLanguage: 'en' })) !== 'unavailable'
  } catch {
    return false
  }
}

export async function translateLines(
  lines: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<Record<string, string>> {
  const T = api()
  if (!T) throw new Error('unsupported')
  const translator = await T.create({
    sourceLanguage: 'pt',
    targetLanguage: 'en',
    monitor: (m) =>
      m.addEventListener('downloadprogress', (e) => {
        const loaded = (e as unknown as { loaded: number }).loaded
        onProgress?.(Math.round(loaded * 100), 100)
      }),
  })
  const result: Record<string, string> = {}
  let done = 0
  for (const line of lines) {
    try {
      result[line] = (await translator.translate(line)).trim()
    } catch {
      result[line] = line
    }
    onProgress?.(++done, lines.length)
  }
  translator.destroy?.()
  return result
}
