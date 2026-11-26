import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Skill } from '../../types/resume'
import { uid } from '../../utils/format'
import { TextField } from '../ui/Field'

interface Props {
  items: Skill[]
  onChange: (items: Skill[]) => void
  jobKeywords: string
  onJobKeywords: (v: string) => void
}

export function SkillsForm({ items, onChange, jobKeywords, onJobKeywords }: Props) {
  const [text, setText] = useState('')

  const add = () => {
    // Accepts one skill, or several separated by comma / semicolon / new line (e.g. pasted list)
    const names = text
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!names.length) return
    const existing = new Set(items.map((s) => s.name.toLowerCase()))
    const fresh: Skill[] = []
    for (const n of names) {
      if (!existing.has(n.toLowerCase())) {
        existing.add(n.toLowerCase())
        fresh.push({ id: uid(), name: n })
      }
    }
    onChange([...items, ...fresh])
    setText('')
  }

  return (
    <div className="stack">
      <p className="muted">
        Inclua competências técnicas e comportamentais que você realmente possui. Adicione uma de cada vez ou
        várias separadas por vírgula.
      </p>
      <div className="skill-input">
        <input
          className="input"
          value={text}
          placeholder="Ex.: React, SQL, Comunicação"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          aria-label="Nova habilidade"
        />
        <button type="button" className="btn btn-add" onClick={add} disabled={!text.trim()}>
          <Plus size={16} /> Adicionar
        </button>
      </div>
      {items.length > 0 ? (
        <ul className="chips">
          {items.map((s) => (
            <li key={s.id} className="chip">
              {s.name}
              <button
                type="button"
                aria-label={`Remover ${s.name}`}
                onClick={() => onChange(items.filter((x) => x.id !== s.id))}
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">Nenhuma habilidade adicionada ainda.</p>
      )}
      <TextField
        label="Palavras-chave da vaga"
        optional
        value={jobKeywords}
        onChange={onJobKeywords}
        placeholder="Ex.: Scrum, SQL, gestão de projetos"
        hint="Não aparecem no currículo: vão apenas para os metadados do PDF, lidos por sistemas de recrutamento (ATS). Use somente termos que descrevem você."
      />
    </div>
  )
}
