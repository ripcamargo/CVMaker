import { Fragment } from 'react'
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
  type TemplateProps,
} from './shared'

/** Modelo 01 — Elegante Minimalista. Single column, plain text, ATS friendly. */
export function ElegantTemplate({ data }: TemplateProps) {
  const p = data.personal
  const lang = data.settings.lang
  const L = LABELS[lang]
  const on = activeSections(data)
  const contacts = contactItems(p)

  if (isBlank(data)) return <Placeholder />

  return (
    <>
      <header className="cv-block el-header" data-block>
        {p.fullName && <h1 className="el-name">{p.fullName}</h1>}
        {p.title && <div className="el-title">{p.title}</div>}
        {contacts.length > 0 && (
          <div className="el-contacts">
            {contacts.map((c, i) => (
              <Fragment key={c.key}>
                {i > 0 && <span className="el-sep">|</span>}
                {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
              </Fragment>
            ))}
          </div>
        )}
      </header>

      {p.summary.trim() && (
        <Section title={L.summary} headingClass="el-heading">
          <RichText text={p.summary} />
        </Section>
      )}

      {on.experience && (
        <Section title={L.experience} headingClass="el-heading">
          {data.experiences.map((e) =>
            e.previous?.length ? (
              <div key={e.id}>
                <div className="el-row">
                  <div className="el-strong">{e.company || e.role}</div>
                  <div className="el-date">{companyPeriod(e, undefined, lang)}</div>
                </div>
                {e.location && <div className="el-meta">{e.location}</div>}
                {positionsOf(e).map((pos) => (
                  <div key={pos.id} className="el-pos">
                    <div className="el-row">
                      <div className="el-pos-title">{pos.role}</div>
                      <div className="el-date">{positionPeriod(pos, undefined, lang)}</div>
                    </div>
                    <RichText text={pos.description} />
                    <Achievements text={pos.achievements} label={L.results} />
                  </div>
                ))}
              </div>
            ) : (
            <div key={e.id}>
              <div className="el-row">
                <div className="el-strong">{e.role || e.company}</div>
                <div className="el-date">{experiencePeriod(e, undefined, lang)}</div>
              </div>
              {(e.role && e.company) || e.location ? (
                <div className="el-meta">{[e.role ? e.company : '', e.location].filter(Boolean).join(' · ')}</div>
              ) : null}
              <RichText text={e.description} />
              <Achievements text={e.achievements} label={L.results} />
            </div>
            ),
          )}
        </Section>
      )}

      {on.education && (
        <Section title={L.education} headingClass="el-heading">
          {data.education.map((e) => (
            <div key={e.id}>
              <div className="el-row">
                <div className="el-strong">{[e.degree, e.course].filter(Boolean).join(` ${L.inWord} `) || e.institution}</div>
                <div className="el-date">{educationPeriod(e, undefined, lang)}</div>
              </div>
              <div className="el-meta">
                {[(e.degree || e.course) && e.institution ? e.institution : '', L.status[e.status]]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          ))}
        </Section>
      )}

      {on.courses && (
        <Section title={L.courses} headingClass="el-heading">
          {data.courses.map((c) => (
            <div key={c.id} className="el-row el-compact">
              <div>
                <span className="el-strong">{c.name}</span>
                {c.institution && <span className="el-meta-inline"> — {c.institution}</span>}
                {c.hours && <span className="el-meta-inline"> · {c.hours}h</span>}
              </div>
              <div className="el-date">{c.year}</div>
            </div>
          ))}
        </Section>
      )}

      {on.skills && (
        <Section title={L.skills} headingClass="el-heading">
          <div className="cv-text">{data.skills.map((s) => s.name).join('  •  ')}</div>
        </Section>
      )}

      {on.languages && (
        <Section title={L.languages} headingClass="el-heading">
          <div className="cv-text">
            {data.languages.map((l) => `${l.name} (${L.level[l.level]})`).join('  •  ')}
          </div>
        </Section>
      )}

      {on.additional && (
        <Section title={L.additional} headingClass="el-heading">
          {data.additional.map((a) => (
            <div key={a.id}>
              <div className="el-strong">
                {a.title} <span className="el-meta-inline">· {L.kind[a.kind]}</span>
              </div>
              <RichText text={a.description} />
            </div>
          ))}
        </Section>
      )}
    </>
  )
}
