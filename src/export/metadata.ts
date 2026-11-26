import type { ResumeData } from '../types/resume'

export interface PdfMetadata {
  title: string
  author: string
  subject: string
  /** comma separated, for the PDF Info dictionary */
  keywords: string
  keywordList: string[]
  /** "Currículo" / "Resume" */
  category: string
  creator: string
  /** BCP-47 language of the document (PDF /Lang). */
  lang: 'pt-BR' | 'en-US'
}

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).trimEnd() + '…'
}

function unique(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const v = clean(raw)
    const k = v.toLowerCase()
    if (v && !seen.has(k)) {
      seen.add(k)
      out.push(v)
    }
  }
  return out
}

/**
 * Builds the PDF document properties from what the candidate filled in.
 * ATS parsers and search indexes read Title / Author / Subject / Keywords / Language,
 * so they carry the candidate's name, target role, location and top skills.
 */
export function buildPdfMetadata(data: ResumeData): PdfMetadata {
  const { personal: p, settings } = data
  const en = settings.lang === 'en'
  const name = clean(p.fullName)
  const role = clean(p.title)
  const vis = settings.visible

  const label = en ? 'Resume' : 'Currículo'
  const title = unique([name, role]).join(' - ')
  const fullTitle = title ? `${title} - ${label}` : label

  const subject = clean(p.summary)
    ? truncate(clean(p.summary), 250)
    : unique([role, clean(p.location)]).join(' - ') || label

  const skills = vis.skills ? data.skills.map((s) => s.name) : []
  const experiences = vis.experience ? data.experiences : []
  const roles = experiences.flatMap((e) => [e.role, ...(e.previous ?? []).map((x) => x.role)])
  const companies = experiences.map((e) => e.company)
  const education = vis.education ? data.education.flatMap((e) => [e.course, e.degree]) : []
  const languages = vis.languages ? data.languages.map((l) => l.name) : []
  const jobTerms = (data.jobKeywords ?? '').split(/[,;\n]/)

  const keywordList = unique([
    ...jobTerms, // terms the candidate chose for the target job come first
    role,
    ...skills.slice(0, 15),
    ...roles.slice(0, 4),
    ...companies.slice(0, 4),
    ...education.slice(0, 3),
    ...languages,
    clean(p.location),
    label,
  ]).map((k) => k.replace(/[;,]/g, ' '))

  return {
    title: fullTitle,
    author: name,
    subject,
    keywords: keywordList.join(', '),
    keywordList,
    category: label,
    creator: 'CVMaker by Ricardo Camargo dev',
    lang: en ? 'en-US' : 'pt-BR',
  }
}

// XML 1.0 forbids most control characters; strip them and escape markup.
const esc = (v: string) =>
  [...v]
    .filter((ch) => {
      const c = ch.codePointAt(0)!
      return c >= 0x20 || c === 0x09 || c === 0x0a || c === 0x0d
    })
    .join('')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const alt = (v: string) => `<rdf:Alt><rdf:li xml:lang="x-default">${esc(v)}</rdf:li></rdf:Alt>`
const bag = (list: string[]) => `<rdf:Bag>${list.map((v) => `<rdf:li>${esc(v)}</rdf:li>`).join('')}</rdf:Bag>`

/**
 * XMP packet (Dublin Core + PDF + XMP basic) mirroring the document properties.
 * Many indexers and ATS prefer XMP over the legacy Info dictionary.
 */
export function buildXmp(meta: PdfMetadata, created: Date = new Date()): string {
  const iso = created.toISOString()
  const parts = [
    meta.title && `<dc:title>${alt(meta.title)}</dc:title>`,
    meta.author && `<dc:creator><rdf:Seq><rdf:li>${esc(meta.author)}</rdf:li></rdf:Seq></dc:creator>`,
    meta.subject && `<dc:description>${alt(meta.subject)}</dc:description>`,
    meta.keywordList.length > 0 && `<dc:subject>${bag(meta.keywordList)}</dc:subject>`,
    `<dc:type>${bag([meta.category])}</dc:type>`,
    `<dc:language>${bag([meta.lang])}</dc:language>`,
    `<dc:format>application/pdf</dc:format>`,
    meta.keywords && `<pdf:Keywords>${esc(meta.keywords)}</pdf:Keywords>`,
    `<pdf:Producer>CVMaker</pdf:Producer>`,
    `<xmp:CreatorTool>${esc(meta.creator)}</xmp:CreatorTool>`,
    `<xmp:CreateDate>${iso}</xmp:CreateDate>`,
    `<xmp:ModifyDate>${iso}</xmp:ModifyDate>`,
  ].filter(Boolean)
  return (
    '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
    '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:pdf="http://ns.adobe.com/pdf/1.3/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">' +
    parts.join('') +
    '</rdf:Description></rdf:RDF></x:xmpmeta>'
  )
}
