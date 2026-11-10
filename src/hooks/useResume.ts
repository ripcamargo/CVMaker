import { useCallback, useEffect, useRef, useState } from 'react'
import type { ResumeData } from '../types/resume'
import { emptyResume } from '../data/defaults'

const KEY = 'cvmaker:resume:v1'
const VIEW_KEY = 'cvmaker:started:v1'

/** Fills in anything missing so older saves and imported files always have a complete shape. */
export function normalize(saved: Partial<ResumeData>): ResumeData {
  const base = emptyResume()
  return {
    ...base,
    ...saved,
    personal: { ...base.personal, ...saved.personal },
    experiences: saved.experiences ?? [],
    education: saved.education ?? [],
    courses: saved.courses ?? [],
    skills: saved.skills ?? [],
    languages: saved.languages ?? [],
    additional: saved.additional ?? [],
    translations: { ...saved.translations },
    settings: {
      ...base.settings,
      ...saved.settings,
      visible: { ...base.settings.visible, ...saved.settings?.visible },
    },
  }
}

function load(): ResumeData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? normalize(JSON.parse(raw) as Partial<ResumeData>) : emptyResume()
  } catch {
    return emptyResume()
  }
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function useResume() {
  const [data, setData] = useState<ResumeData>(load)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaveState('saving')
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(data))
        setSaveState('saved')
      } catch {
        setSaveState('error') // e.g. quota exceeded
      }
    }, 450)
    return () => clearTimeout(t)
  }, [data])

  const update = useCallback((fn: (d: ResumeData) => ResumeData) => setData(fn), [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setData(emptyResume())
    setSaveState('idle')
  }, [])

  const replace = useCallback((next: ResumeData) => setData(next), [])

  return { data, update, reset, replace, saveState }
}

export const hasStarted = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === '1' || localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}
export const markStarted = () => {
  try {
    localStorage.setItem(VIEW_KEY, '1')
  } catch {
    /* ignore */
  }
}
