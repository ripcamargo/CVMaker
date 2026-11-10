import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { CefrLevel, CefrSkills, Language, LanguageLevel } from '../../types/resume'
import { CEFR_FIELDS, CEFR_LEVELS, LEVEL_LABEL, cefrOf } from '../../data/defaults'
import { uid } from '../../utils/format'
import { patchItem, removeItem } from '../../utils/list'

interface Props {
  items: Language[]
  onChange: (items: Language[]) => void
}

const LEVELS = (Object.keys(LEVEL_LABEL) as LanguageLevel[]).map((k) => ({ value: k, label: LEVEL_LABEL[k] }))

export function LanguagesForm({ items, onChange }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  const setCefr = (l: Language, key: keyof CefrSkills, v: CefrLevel) =>
    onChange(patchItem(items, l.id, { cefr: { ...cefrOf(l), [key]: v } }))

  return (
    <div className="stack">
      <p className="muted">
        O nível simples é usado em todos os modelos. No modelo Europeu, a grade de autoavaliação (A1–C2) é
        preenchida a partir dele, e você pode detalhá-la por habilidade.
      </p>
      {items.map((l) => (
        <div key={l.id} className="lang-block">
          <div className="lang-row">
            <input
              className="input"
              aria-label="Idioma"
              placeholder="Idioma (ex.: Inglês)"
              value={l.name}
              onChange={(e) => onChange(patchItem(items, l.id, { name: e.target.value }))}
            />
            <select
              className="input select"
              aria-label="Nível"
              value={l.level}
              onChange={(e) =>
                // changing the simple level resets the detailed grid so both stay consistent
                onChange(patchItem(items, l.id, { level: e.target.value as LanguageLevel, cefr: undefined }))
              }
            >
              {LEVELS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn danger"
              aria-label="Remover idioma"
              title="Remover"
              onClick={() => onChange(removeItem(items, l.id))}
            >
              <Trash2 size={16} />
            </button>
          </div>
          {l.level !== 'native' && (
            <>
              <button type="button" className="lang-detail-toggle" onClick={() => setOpen(open === l.id ? null : l.id)}>
                Níveis detalhados (Europass) {open === l.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {open === l.id && (
                <div className="cefr-grid">
                  {CEFR_FIELDS.map((f) => (
                    <label key={f.key}>
                      <span>{f.label}</span>
                      <select
                        className="input select"
                        value={cefrOf(l)[f.key]}
                        onChange={(e) => setCefr(l, f.key, e.target.value as CefrLevel)}
                      >
                        {CEFR_LEVELS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
      <div className="row-gap">
        <button
          type="button"
          className="btn btn-add"
          onClick={() => onChange([...items, { id: uid(), name: '', level: 'intermediate' }])}
        >
          <Plus size={16} /> Adicionar idioma
        </button>
      </div>
    </div>
  )
}
