export type TemplateId = 'elegant' | 'modern' | 'europass'
export type AccentId = 'navy' | 'green' | 'graphite'

export interface Personal {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  photo: string // data URL (optional)
}

/** An earlier role held at the same company (promotion), shown under the company like on LinkedIn. */
export interface Position {
  id: string
  role: string
  start: string
  end: string
  current: boolean
  description: string
  achievements: string
}

export interface Experience {
  id: string
  company: string
  role: string
  location: string
  start: string // YYYY-MM
  end: string // YYYY-MM
  current: boolean
  description: string
  achievements: string
  /** Earlier roles at this company. The fields above describe the most recent role. */
  previous?: Position[]
}

export type EducationStatus = 'completed' | 'ongoing' | 'interrupted'

export interface Education {
  id: string
  institution: string
  course: string
  degree: string
  start: string
  end: string
  status: EducationStatus
}

export interface Course {
  id: string
  name: string
  institution: string
  year: string
  hours: string
}

export interface Skill {
  id: string
  name: string
}

export type LanguageLevel = 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

/** Europass self-assessment grid (Quadro Europeu Comum de Referência). */
export interface CefrSkills {
  listening: CefrLevel
  reading: CefrLevel
  interaction: CefrLevel
  production: CefrLevel
  writing: CefrLevel
}

export interface Language {
  id: string
  name: string
  level: LanguageLevel
  /** Optional detailed CEFR levels; derived from `level` when absent. */
  cefr?: CefrSkills
}

export type AdditionalKind = 'project' | 'volunteer' | 'publication' | 'other'

export interface AdditionalItem {
  id: string
  kind: AdditionalKind
  title: string
  description: string
}

export type SectionKey =
  | 'personal'
  | 'experience'
  | 'education'
  | 'courses'
  | 'skills'
  | 'languages'
  | 'additional'

export interface ResumeData {
  personal: Personal
  experiences: Experience[]
  education: Education[]
  courses: Course[]
  skills: Skill[]
  languages: Language[]
  additional: AdditionalItem[]
  /** Cache of translated texts: original line -> English. */
  translations: Record<string, string>
  settings: {
    template: TemplateId
    accent: AccentId
    /** Language of the generated document. */
    lang: 'pt' | 'en'
    /** Which sections are included in the final resume. */
    visible: Record<SectionKey, boolean>
  }
}
