import type { AdditionalKind, EducationStatus, LanguageLevel, CefrSkills } from '../types/resume'

export type Lang = 'pt' | 'en'

export interface Labels {
  months: string[]
  present: string
  expected: string
  ongoing: string
  inWord: string // "Bacharelado em Administração"
  hours: string
  results: string
  summary: string
  aboutMe: string
  profile: string
  contact: string
  experience: string
  education: string
  educationEu: string
  courses: string
  skills: string
  skillsEu: string
  languages: string
  languagesEu: string
  additional: string
  motherTongue: string
  otherLanguages: string
  cefrNote: string
  cefrGroups: { comprehension: string; expression: string; writing: string }
  cefr: Record<keyof CefrSkills, string>
  level: Record<LanguageLevel, string>
  status: Record<EducationStatus, string>
  kind: Record<AdditionalKind, string>
}

const pt: Labels = {
  months: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  present: 'Atual',
  expected: 'previsão',
  ongoing: 'Cursando',
  inWord: 'em',
  hours: 'horas',
  results: 'Principais resultados',
  summary: 'Resumo profissional',
  aboutMe: 'Sobre mim',
  profile: 'Perfil',
  contact: 'Contato',
  experience: 'Experiência profissional',
  education: 'Formação acadêmica',
  educationEu: 'Educação e formação',
  courses: 'Cursos e certificações',
  skills: 'Habilidades',
  skillsEu: 'Competências digitais e pessoais',
  languages: 'Idiomas',
  languagesEu: 'Competências linguísticas',
  additional: 'Informações adicionais',
  motherTongue: 'Língua(s) materna(s):',
  otherLanguages: 'Outra(s) língua(s):',
  cefrNote:
    'Níveis: A1 e A2: utilizador elementar · B1 e B2: utilizador independente · C1 e C2: utilizador avançado — Quadro Europeu Comum de Referência para as Línguas',
  cefrGroups: { comprehension: 'Compreensão', expression: 'Expressão', writing: 'Escrita' },
  cefr: {
    listening: 'Compreensão oral',
    reading: 'Leitura',
    interaction: 'Interação oral',
    production: 'Produção oral',
    writing: 'Escrita',
  },
  level: { basic: 'Básico', intermediate: 'Intermediário', advanced: 'Avançado', fluent: 'Fluente', native: 'Nativo' },
  status: { completed: 'Concluído', ongoing: 'Cursando', interrupted: 'Interrompido' },
  kind: { project: 'Projeto', volunteer: 'Voluntariado', publication: 'Publicação', other: 'Outro' },
}

const en: Labels = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  present: 'Present',
  expected: 'expected',
  ongoing: 'In progress',
  inWord: 'in',
  hours: 'hours',
  results: 'Key achievements',
  summary: 'Professional summary',
  aboutMe: 'About me',
  profile: 'Profile',
  contact: 'Contact',
  experience: 'Work experience',
  education: 'Education',
  educationEu: 'Education and training',
  courses: 'Courses and certifications',
  skills: 'Skills',
  skillsEu: 'Digital and personal skills',
  languages: 'Languages',
  languagesEu: 'Language skills',
  additional: 'Additional information',
  motherTongue: 'Mother tongue(s):',
  otherLanguages: 'Other language(s):',
  cefrNote:
    'Levels: A1 and A2: basic user · B1 and B2: independent user · C1 and C2: proficient user — Common European Framework of Reference for Languages',
  cefrGroups: { comprehension: 'Understanding', expression: 'Speaking', writing: 'Writing' },
  cefr: {
    listening: 'Listening',
    reading: 'Reading',
    interaction: 'Spoken interaction',
    production: 'Spoken production',
    writing: 'Writing',
  },
  level: { basic: 'Basic', intermediate: 'Intermediate', advanced: 'Advanced', fluent: 'Fluent', native: 'Native' },
  status: { completed: 'Completed', ongoing: 'In progress', interrupted: 'Interrupted' },
  kind: { project: 'Project', volunteer: 'Volunteering', publication: 'Publication', other: 'Other' },
}

export const LABELS: Record<Lang, Labels> = { pt, en }
