import { Check } from 'lucide-react'
import type { AccentId, TemplateId } from '../types/resume'
import { ACCENTS, TEMPLATES } from '../data/defaults'

interface Props {
  template: TemplateId
  accent: AccentId
  onTemplate: (t: TemplateId) => void
  onAccent: (a: AccentId) => void
}

/** Tiny wireframes that hint at each layout. */
function Thumb({ id }: { id: TemplateId }) {
  if (id === 'elegant')
    return (
      <svg viewBox="0 0 60 80" aria-hidden="true">
        <rect width="60" height="80" fill="#fff" />
        <rect x="14" y="8" width="32" height="4" rx="1" fill="#151515" />
        <rect x="20" y="15" width="20" height="1.6" fill="#888" />
        <rect x="6" y="21" width="48" height=".8" fill="#151515" />
        {[28, 46, 62].map((y) => (
          <g key={y}>
            <rect x="6" y={y} width="16" height="1.6" fill="#151515" />
            <rect x="6" y={y + 4} width="48" height="1.2" fill="#bbb" />
            <rect x="6" y={y + 7} width="44" height="1.2" fill="#bbb" />
            <rect x="6" y={y + 10} width="36" height="1.2" fill="#bbb" />
          </g>
        ))}
      </svg>
    )
  if (id === 'modern')
    return (
      <svg viewBox="0 0 60 80" aria-hidden="true">
        <rect width="60" height="80" fill="#fff" />
        <rect width="21" height="80" fill="#1e3a5f" />
        <circle cx="10.5" cy="13" r="6" fill="#fff" opacity=".85" />
        {[28, 44, 58].map((y) => (
          <g key={y}>
            <rect x="4" y={y} width="12" height="1.4" fill="#fff" />
            <rect x="4" y={y + 4} width="13" height="1.2" fill="#fff" opacity=".5" />
            <rect x="4" y={y + 7} width="10" height="1.2" fill="#fff" opacity=".5" />
          </g>
        ))}
        <rect x="26" y="9" width="26" height="4" rx="1" fill="#1e3a5f" />
        <rect x="26" y="16" width="16" height="1.6" fill="#888" />
        {[26, 46, 64].map((y) => (
          <g key={y}>
            <rect x="26" y={y} width="14" height="1.6" fill="#1e3a5f" />
            <rect x="26" y={y + 5} width="28" height="1.2" fill="#bbb" />
            <rect x="26" y={y + 8} width="24" height="1.2" fill="#bbb" />
            <rect x="26" y={y + 11} width="26" height="1.2" fill="#bbb" />
          </g>
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 60 80" aria-hidden="true">
      <rect width="60" height="80" fill="#fff" />
      <rect x="6" y="8" width="30" height="4" rx="1" fill="#1b4b91" />
      <rect x="6" y="15" width="18" height="1.6" fill="#888" />
      <rect x="45" y="6" width="9" height="11" fill="#cbd5e1" />
      <rect x="6" y="21" width="48" height="1.4" fill="#1b4b91" />
      {[27, 44, 61].map((y) => (
        <g key={y}>
          <rect x="6" y={y} width="12" height="1.4" fill="#1b4b91" />
          <rect x="6" y={y + 4} width="10" height="1.2" fill="#888" />
          <rect x="22" y={y + 4} width="30" height="1.2" fill="#bbb" />
          <rect x="22" y={y + 7} width="26" height="1.2" fill="#bbb" />
          <rect x="22" y={y + 10} width="28" height="1.2" fill="#bbb" />
        </g>
      ))}
    </svg>
  )
}

export function TemplateSelector({ template, accent, onTemplate, onAccent }: Props) {
  return (
    <div className="tpl-selector">
      <div className="tpl-options" role="radiogroup" aria-label="Modelo do currículo">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={template === t.id}
            className={`tpl-option ${template === t.id ? 'active' : ''}`}
            onClick={() => onTemplate(t.id)}
            title={t.description}
          >
            <span className="tpl-thumb">
              <Thumb id={t.id} />
            </span>
            <span className="tpl-meta">
              <span className="tpl-name">
                {i + 1}. {t.name}
              </span>
              <span className="tpl-desc">{t.description}</span>
            </span>
            {template === t.id && (
              <span className="tpl-check">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
      {template === 'modern' && (
        <div className="accents" role="radiogroup" aria-label="Cor de destaque">
          <span className="muted small">Cor de destaque</span>
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={accent === a.id}
              aria-label={a.name}
              title={a.name}
              className={`swatch ${accent === a.id ? 'active' : ''}`}
              style={{ background: a.color }}
              onClick={() => onAccent(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
