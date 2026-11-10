import { Globe, Link2, Mail, MapPin, Phone } from 'lucide-react'
import { LABELS } from '../data/i18n'
import { companyPeriod, educationPeriod, experiencePeriod, positionPeriod, positionsOf } from '../utils/format'
import {
  Achievements,
  RichText,
  Section,
  Placeholder,
  activeSections,
  contactItems,
  isBlank,
  type ContactItem,
  type TemplateProps,
} from './shared'

const ICONS: Record<ContactItem['key'], typeof Mail> = {
  email: Mail,
  phone: Phone,
  location: MapPin,
  linkedin: Link2,
  website: Globe,
}

/** Modelo 02 — Moderno e Estilizado. Two columns: accent sidebar + main column. */
export function ModernTemplate({ data }: TemplateProps) {
  const p = data.personal
  const lang = data.settings.lang
  const L = LABELS[lang]
  const on = activeSections(data)
  const contacts = contactItems(p)

  if (isBlank(data)) return <Placeholder />

  return (
    <div className="mo-grid">
      <aside className="mo-side">
        {p.photo && (
          <div className="cv-block mo-photo-wrap" data-block>
            <img className="mo-photo" src={p.photo} alt="" />
          </div>
        )}

        {contacts.length > 0 && (
          <Section title={L.contact} headingClass="mo-side-heading">
            <ul className="mo-contacts">
              {contacts.map((c) => {
                const Icon = ICONS[c.key]
                return (
                  <li key={c.key}>
                    <Icon size={13} strokeWidth={2} />
                    {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        {on.skills && (
          <Section title={L.skills} headingClass="mo-side-heading">
            <ul className="mo-skills">
              {data.skills.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </Section>
        )}

        {on.languages && (
          <Section title={L.languages} headingClass="mo-side-heading">
            <ul className="mo-langs">
              {data.languages.map((l) => (
                <li key={l.id}>
                  <strong>{l.name}</strong>
                  <span>{L.level[l.level]}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </aside>

      <main className="mo-main">
        <header className="cv-block mo-header" data-block>
          {p.fullName && <h1 className="mo-name">{p.fullName}</h1>}
          {p.title && <div className="mo-title">{p.title}</div>}
        </header>

        {p.summary.trim() && (
          <Section title={L.profile} headingClass="mo-heading">
            <RichText text={p.summary} />
          </Section>
        )}

        {on.experience && (
          <Section title={L.experience} headingClass="mo-heading">
            {data.experiences.map((e) =>
              e.previous?.length ? (
                <div key={e.id} className="mo-item">
                  <div className="mo-strong">{e.company || e.role}</div>
                  <div className="mo-meta">
                    {[e.location, companyPeriod(e, undefined, lang)].filter(Boolean).join('  ·  ')}
                  </div>
                  {positionsOf(e).map((pos) => (
                    <div key={pos.id} className="mo-pos">
                      <div className="mo-pos-title">{pos.role}</div>
                      <div className="mo-meta">{positionPeriod(pos, undefined, lang)}</div>
                      <RichText text={pos.description} />
                      <Achievements text={pos.achievements} label={L.results} />
                    </div>
                  ))}
                </div>
              ) : (
              <div key={e.id} className="mo-item">
                <div className="mo-strong">{e.role || e.company}</div>
                <div className="mo-meta">
                  {[e.role ? e.company : '', e.location, experiencePeriod(e, undefined, lang)].filter(Boolean).join('  ·  ')}
                </div>
                <RichText text={e.description} />
                <Achievements text={e.achievements} label={L.results} />
              </div>
              ),
            )}
          </Section>
        )}

        {on.education && (
          <Section title={L.education} headingClass="mo-heading">
            {data.education.map((e) => (
              <div key={e.id} className="mo-item">
                <div className="mo-strong">{[e.degree, e.course].filter(Boolean).join(` ${L.inWord} `) || e.institution}</div>
                <div className="mo-meta">
                  {[(e.degree || e.course) && e.institution ? e.institution : '', educationPeriod(e, undefined, lang), L.status[e.status]]
                    .filter(Boolean)
                    .join('  ·  ')}
                </div>
              </div>
            ))}
          </Section>
        )}

        {on.courses && (
          <Section title={L.courses} headingClass="mo-heading">
            {data.courses.map((c) => (
              <div key={c.id} className="mo-item">
                <div className="mo-strong">{c.name}</div>
                <div className="mo-meta">
                  {[c.institution, c.year, c.hours ? `${c.hours}h` : ''].filter(Boolean).join('  ·  ')}
                </div>
              </div>
            ))}
          </Section>
        )}

        {on.additional && (
          <Section title={L.additional} headingClass="mo-heading">
            {data.additional.map((a) => (
              <div key={a.id} className="mo-item">
                <div className="mo-strong">{a.title}</div>
                <div className="mo-meta">{L.kind[a.kind]}</div>
                <RichText text={a.description} />
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  )
}
