import type {
  AdditionalKind,
  EducationStatus,
  LanguageLevel,
  ResumeData,
  SectionKey,
  TemplateId,
  AccentId,
} from '../types/resume'

export const emptyResume = (): ResumeData => ({
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    photo: '',
  },
  experiences: [],
  education: [],
  courses: [],
  skills: [],
  languages: [],
  additional: [],
  translations: {},
  settings: {
    template: 'elegant',
    accent: 'navy',
    lang: 'pt',
    visible: {
      personal: true,
      experience: true,
      education: true,
      courses: true,
      skills: true,
      languages: true,
      additional: true,
    },
  },
})

export const SECTIONS: { key: SectionKey; label: string; short: string; optional: boolean }[] = [
  { key: 'personal', label: 'Informações pessoais', short: 'Pessoal', optional: false },
  { key: 'experience', label: 'Experiência profissional', short: 'Experiência', optional: true },
  { key: 'education', label: 'Formação acadêmica', short: 'Formação', optional: true },
  { key: 'courses', label: 'Cursos e certificações', short: 'Cursos', optional: true },
  { key: 'skills', label: 'Habilidades', short: 'Habilidades', optional: true },
  { key: 'languages', label: 'Idiomas', short: 'Idiomas', optional: true },
  { key: 'additional', label: 'Informações adicionais', short: 'Adicionais', optional: true },
]

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: 'elegant', name: 'Elegante', description: 'Minimalista, preto e branco, ideal para ATS' },
  { id: 'modern', name: 'Moderno', description: 'Duas colunas com cor de destaque' },
  { id: 'europass', name: 'Europeu', description: 'Estrutura formal inspirada no Europass' },
]

export const ACCENTS: { id: AccentId; name: string; color: string }[] = [
  { id: 'navy', name: 'Azul-marinho', color: '#1e3a5f' },
  { id: 'green', name: 'Verde-escuro', color: '#1f4d3a' },
  { id: 'graphite', name: 'Grafite', color: '#2f3640' },
]

export const LEVEL_LABEL: Record<LanguageLevel, string> = {
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  fluent: 'Fluente',
  native: 'Nativo',
}

/** Europass-style CEFR hint, shown only in the European template. */
export const LEVEL_CEFR: Record<LanguageLevel, string> = {
  basic: 'A1–A2',
  intermediate: 'B1–B2',
  advanced: 'C1',
  fluent: 'C2',
  native: 'Língua materna',
}

export const STATUS_LABEL: Record<EducationStatus, string> = {
  completed: 'Concluído',
  ongoing: 'Cursando',
  interrupted: 'Interrompido',
}

export const KIND_LABEL: Record<AdditionalKind, string> = {
  project: 'Projeto',
  volunteer: 'Voluntariado',
  publication: 'Publicação',
  other: 'Outro',
}

import type { CefrLevel, CefrSkills } from '../types/resume'

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const CEFR_FIELDS: { key: keyof CefrSkills; label: string; group: string }[] = [
  { key: 'listening', label: 'Compreensão oral', group: 'Compreensão' },
  { key: 'reading', label: 'Leitura', group: 'Compreensão' },
  { key: 'interaction', label: 'Interação oral', group: 'Expressão' },
  { key: 'production', label: 'Produção oral', group: 'Expressão' },
  { key: 'writing', label: 'Escrita', group: 'Escrita' },
]

const LEVEL_TO_CEFR: Record<LanguageLevel, CefrLevel> = {
  basic: 'A2',
  intermediate: 'B1',
  advanced: 'C1',
  fluent: 'C2',
  native: 'C2',
}

/** Detailed CEFR levels for a language: the user's values or a uniform level derived from the simple one. */
export function cefrOf(l: { level: LanguageLevel; cefr?: CefrSkills }): CefrSkills {
  if (l.cefr) return l.cefr
  const v = LEVEL_TO_CEFR[l.level]
  return { listening: v, reading: v, interaction: v, production: v, writing: v }
}
