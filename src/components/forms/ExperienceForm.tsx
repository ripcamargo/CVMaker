import { ArrowDownWideNarrow, Plus } from 'lucide-react'
import type { Experience } from '../../types/resume'
import { experiencePeriod, uid } from '../../utils/format'
import { moveItem, patchItem, removeItem } from '../../utils/list'
import { CheckField, TextAreaField, TextField } from '../ui/Field'
import { ItemCard } from '../ui/ItemCard'
import { PromotionsEditor } from './PromotionsEditor'

interface Props {
  items: Experience[]
  onChange: (items: Experience[]) => void
}

const blank = (): Experience => ({
  id: uid(),
  company: '',
  role: '',
  location: '',
  start: '',
  end: '',
  current: false,
  description: '',
  achievements: '',
})

/** Most recent first: current jobs, then by end date, then by start date. */
export function sortReverseChronological(items: Experience[]): Experience[] {
  const key = (e: Experience) => (e.current ? '9999-12' : e.end || e.start || '0000-00')
  return items
    .slice()
    .sort((a, b) => key(b).localeCompare(key(a)) || (b.start || '').localeCompare(a.start || ''))
}

export function ExperienceForm({ items, onChange }: Props) {
  const patch = (id: string, p: Partial<Experience>) => onChange(patchItem(items, id, p))
  return (
    <div className="stack">
      <p className="muted">
        Liste da mais recente para a mais antiga. Use <code>-</code> no início de uma linha para criar tópicos.
      </p>
      {items.map((e, i) => (
        <ItemCard
          key={e.id}
          title={e.role || e.company || 'Nova experiência'}
          subtitle={[e.role ? e.company : '', experiencePeriod(e)].filter(Boolean).join(' · ')}
          defaultOpen={!e.role && !e.company}
          index={i}
          count={items.length}
          onMove={(d) => onChange(moveItem(items, e.id, d))}
          onRemove={() => onChange(removeItem(items, e.id))}
        >
          <div className="form-grid">
            <TextField label="Empresa" value={e.company} onChange={(v) => patch(e.id, { company: v })} />
            <TextField label="Cargo" value={e.role} onChange={(v) => patch(e.id, { role: v })} />
            <TextField className="full" label="Cidade/estado" optional value={e.location} onChange={(v) => patch(e.id, { location: v })} />
            <TextField label="Data de início" type="month" value={e.start} onChange={(v) => patch(e.id, { start: v })} />
            <TextField
              label="Data de término"
              type="month"
              value={e.current ? '' : e.end}
              disabled={e.current}
              onChange={(v) => patch(e.id, { end: v })}
            />
            <CheckField label="Trabalho atualmente nesta empresa" checked={e.current} onChange={(v) => patch(e.id, { current: v })} />
            <TextAreaField
              className="full"
              label="Atividades e responsabilidades"
              rows={5}
              value={e.description}
              onChange={(v) => patch(e.id, { description: v })}
              placeholder={'- Responsável por...\n- Atuei em...'}
            />
            <TextAreaField
              className="full"
              label="Principais resultados e conquistas"
              optional
              rows={3}
              value={e.achievements}
              onChange={(v) => patch(e.id, { achievements: v })}
              hint="Um resultado por linha. Prefira números e fatos reais."
            />
          </div>
          <PromotionsEditor experience={e} onChange={(p) => patch(e.id, p)} />
        </ItemCard>
      ))}
      <div className="row-gap">
        <button type="button" className="btn btn-add" onClick={() => onChange([blank(), ...items])}>
          <Plus size={16} /> Adicionar experiência
        </button>
        {items.length > 1 && (
          <button type="button" className="btn btn-ghost" onClick={() => onChange(sortReverseChronological(items))}>
            <ArrowDownWideNarrow size={16} /> Ordenar por data
          </button>
        )}
      </div>
    </div>
  )
}
