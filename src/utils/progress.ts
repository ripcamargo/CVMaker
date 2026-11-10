import type { ResumeData, SectionKey } from '../types/resume'

/** 0..1 completeness of each section. */
export function sectionScore(data: ResumeData, key: SectionKey): number {
  const p = data.personal
  switch (key) {
    case 'personal': {
      const fields = [p.fullName, p.title, p.email, p.phone, p.location, p.summary]
      return fields.filter((f) => f.trim()).length / fields.length
    }
    case 'experience':
      return data.experiences.length ? 1 : 0
    case 'education':
      return data.education.length ? 1 : 0
    case 'courses':
      return data.courses.length ? 1 : 0
    case 'skills':
      return data.skills.length ? 1 : 0
    case 'languages':
      return data.languages.length ? 1 : 0
    case 'additional':
      return data.additional.length ? 1 : 0
  }
}

/** Overall progress in %, ignoring sections the user chose to hide. */
export function overallProgress(data: ResumeData): number {
  const keys = (Object.keys(data.settings.visible) as SectionKey[]).filter((k) => data.settings.visible[k])
  if (!keys.length) return 0
  const sum = keys.reduce((acc, k) => acc + sectionScore(data, k), 0)
  return Math.round((sum / keys.length) * 100)
}
