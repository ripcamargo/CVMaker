import { Children, type ReactNode } from 'react'
import type { Personal, ResumeData, SectionKey } from '../types/resume'
import { cleanUrl, hrefOf, parseLines } from '../utils/format'

export interface TemplateProps {
  data: ResumeData
}

/**
 * A section whose items are each wrapped in a [data-block] element.
 * The heading is rendered INSIDE the first block, so the paginator keeps the
 * title glued to its first item (a title never ends up alone at the bottom of a page).
 */
export function Section({
  title,
  headingClass = 'cv-heading',
  className = '',
  children,
}: {
  title: string
  headingClass?: string
  className?: string
  children: ReactNode
}) {
  const items = Children.toArray(children)
  if (!items.length) return null
  return (
    <section className={`cv-section ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="cv-block" data-block>
          {i === 0 && <h2 className={headingClass}>{title}</h2>}
          {item}
        </div>
      ))}
    </section>
  )
}

/** Free text → paragraphs and bullet list. Lines starting with "-" become bullets. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const lines = parseLines(text)
  if (!lines.length) return null
  const out: ReactNode[] = []
  let bullets: string[] = []
  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`u${out.length}`} className="cv-list">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }
  for (const l of lines) {
    if (l.type === 'bullet') bullets.push(l.text)
    else {
      flush()
      out.push(
        <p key={`p${out.length}`} className="cv-text">
          {l.text}
        </p>,
      )
    }
  }
  flush()
  return <div className={className}>{out}</div>
}

/** Achievements: each non-empty line is a bullet, regardless of marker. */
export function Achievements({ text, label = 'Principais resultados' }: { text: string; label?: string }) {
  const lines = parseLines(text)
  if (!lines.length) return null
  return (
    <div className="cv-achievements">
      <div className="cv-subhead">{label}</div>
      <ul className="cv-list">
        {lines.map((l, i) => (
          <li key={i}>{l.text}</li>
        ))}
      </ul>
    </div>
  )
}

export interface ContactItem {
  key: 'email' | 'phone' | 'location' | 'linkedin' | 'website'
  label: string
  href?: string
}

export function contactItems(p: Personal): ContactItem[] {
  const items: ContactItem[] = []
  if (p.email) items.push({ key: 'email', label: p.email, href: `mailto:${p.email}` })
  if (p.phone) items.push({ key: 'phone', label: p.phone, href: `tel:${p.phone.replace(/[^\d+]/g, '')}` })
  if (p.location) items.push({ key: 'location', label: p.location })
  if (p.linkedin) items.push({ key: 'linkedin', label: cleanUrl(p.linkedin), href: hrefOf(p.linkedin) })
  if (p.website) items.push({ key: 'website', label: cleanUrl(p.website), href: hrefOf(p.website) })
  return items
}

/** Which optional sections are enabled AND have content. */
export function activeSections(data: ResumeData): Record<SectionKey, boolean> {
  const v = data.settings.visible
  return {
    personal: true,
    experience: v.experience && data.experiences.length > 0,
    education: v.education && data.education.length > 0,
    courses: v.courses && data.courses.length > 0,
    skills: v.skills && data.skills.length > 0,
    languages: v.languages && data.languages.length > 0,
    additional: v.additional && data.additional.length > 0,
  }
}

export function isBlank(data: ResumeData): boolean {
  const p = data.personal
  return (
    !p.fullName &&
    !p.title &&
    !p.summary &&
    !contactItems(p).length &&
    !data.experiences.length &&
    !data.education.length &&
    !data.courses.length &&
    !data.skills.length &&
    !data.languages.length &&
    !data.additional.length
  )
}

export function Placeholder() {
  return (
    <div className="cv-block cv-empty" data-block>
      <p>Seu currículo aparecerá aqui.</p>
      <p>Comece preenchendo suas informações pessoais ao lado.</p>
    </div>
  )
}
