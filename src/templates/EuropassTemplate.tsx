import { Globe, Link2, Mail, MapPin, Phone } from 'lucide-react'
import { CEFR_FIELDS, cefrOf } from '../data/defaults'
import { LABELS } from '../data/i18n'
import {
  companyPeriod,
  educationPeriod,
  experiencePeriod,
  formatMonthNumeric,
  positionPeriod,
  positionsOf,
} from '../utils/format'
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

/**
 * Modelo 03 — Padrão Europeu (Europass).
 * Header with photo + name + icon contacts; each section has an uppercase blue title with a rule,
 * dates in a left column and content on the right; language self-assessment grid (CEFR).
 */
export function EuropassTemplate({ data }: TemplateProps) {
  const p = data.personal
  const lang = data.settings.lang
  const L = LABELS[lang]
  const on = activeSections(data)
  const contacts = contactItems(p)
  const natives = data.languages.filter((l) => l.level === 'native' && l.name.trim())
  const others = data.languages.filter((l) => l.level !== 'native' && l.name.trim())

  if (isBlank(data)) return <Placeholder />

  const fmt = formatMonthNumeric

  return (
    <>
      <header className="cv-block eu-header" data-block>
        {p.photo && <img className="eu-photo" src={p.photo} alt="" />}
        <div className="eu-header-text">
          {p.fullName && <h1 className="eu-name">{p.fullName}</h1>}
          {p.title && <div className="eu-title">{p.title}</div>}
          {contacts.length > 0 && (
            <ul className="eu-contacts">
              {contacts.map((c) => {
                const Icon = ICONS[c.key]
                return (
                  <li key={c.key}>
                    <Icon size={13} strokeWidth={2.2} />
                    {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </header>

      {p.summary.trim() && (
        <Section title={L.aboutMe} headingClass="eu-heading">
          <RichText text={p.summary} />
        </Section>
      )}

      {on.experience && (
        <Section title={L.experience} headingClass="eu-heading">
          {data.experiences.map((e) =>
            e.previous?.length ? (
              <div key={e.id} className="eu-row">
                <div className="eu-label">{companyPeriod(e, fmt, lang).replace(L.present, L.present.toUpperCase())}</div>
                <div className="eu-content">
                  <div className="eu-strong">{e.company || e.role}</div>
                  {e.location && <div className="eu-org">{e.location}</div>}
                  {positionsOf(e).map((pos) => (
                    <div key={pos.id} className="eu-pos">
                      <div className="eu-pos-head">
                        <span className="eu-pos-title">{pos.role}</span>
                        <span className="eu-pos-date">
                          {positionPeriod(pos, fmt, lang).replace(L.present, L.present.toUpperCase())}
                        </span>
                      </div>
                      <RichText text={pos.description} />
                      <Achievements text={pos.achievements} label={L.results} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
            <div key={e.id} className="eu-row">
              <div className="eu-label">{experiencePeriod(e, fmt, lang).replace(L.present, L.present.toUpperCase())}</div>
              <div className="eu-content">
                <div className="eu-strong">{e.role || e.company}</div>
                {((e.role && e.company) || e.location) && (
                  <div className="eu-org">{[e.role ? e.company : '', e.location].filter(Boolean).join(', ')}</div>
                )}
                <RichText text={e.description} />
                <Achievements text={e.achievements} label={L.results} />
              </div>
            </div>
            ),
          )}
        </Section>
      )}

      {on.education && (
        <Section title={L.educationEu} headingClass="eu-heading">
          {data.education.map((e) => (
            <div key={e.id} className="eu-row">
              <div className="eu-label">{educationPeriod(e, fmt, lang)}</div>
              <div className="eu-content">
                <div className="eu-strong">{[e.degree, e.course].filter(Boolean).join(` ${L.inWord} `) || e.institution}</div>
                <div className="eu-org">
                  {[(e.degree || e.course) && e.institution ? e.institution : '', L.status[e.status]]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {on.courses && (
        <Section title={L.courses} headingClass="eu-heading">
          {data.courses.map((c) => (
            <div key={c.id} className="eu-row">
              <div className="eu-label">{c.year}</div>
              <div className="eu-content">
                <div className="eu-strong">{c.name}</div>
                {(c.institution || c.hours) && (
                  <div className="eu-org">
                    {[c.institution, c.hours ? `${c.hours} ${L.hours}` : ''].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {on.languages && (
        <Section title={L.languagesEu} headingClass="eu-heading">
          <div>
            {natives.length > 0 && (
              <div className="eu-lang-line">
                <span className="eu-lang-key">{L.motherTongue}</span>{' '}
                <strong>{natives.map((l) => l.name).join(', ')}</strong>
              </div>
            )}
            {others.length > 0 && (
              <>
                <div className="eu-lang-line">
                  <span className="eu-lang-key">{L.otherLanguages}</span>
                </div>
                <table className="eu-cefr">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="eu-cefr-name" />
                      <th colSpan={2}>{L.cefrGroups.comprehension}</th>
                      <th colSpan={2}>{L.cefrGroups.expression}</th>
                      <th>{L.cefrGroups.writing}</th>
                    </tr>
                    <tr>
                      {CEFR_FIELDS.map((f) => (
                        <th key={f.key} className="eu-cefr-sub">
                          {L.cefr[f.key]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {others.map((l) => {
                      const c = cefrOf(l)
                      return (
                        <tr key={l.id}>
                          <td className="eu-cefr-name">{l.name}</td>
                          {CEFR_FIELDS.map((f) => (
                            <td key={f.key}>{c[f.key]}</td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="eu-cefr-note">{L.cefrNote}</div>
              </>
            )}
          </div>
        </Section>
      )}

      {on.skills && (
        <Section title={L.skillsEu} headingClass="eu-heading">
          <div className="eu-skills">{data.skills.map((s) => s.name).join(' · ')}</div>
        </Section>
      )}

      {on.additional && (
        <Section title={L.additional} headingClass="eu-heading">
          {data.additional.map((a) => (
            <div key={a.id} className="eu-row">
              <div className="eu-label">{L.kind[a.kind].toUpperCase()}</div>
              <div className="eu-content">
                <div className="eu-strong">{a.title}</div>
                <RichText text={a.description} />
              </div>
            </div>
          ))}
        </Section>
      )}
    </>
  )
}
