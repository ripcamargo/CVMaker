import { Plus } from 'lucide-react'
import type { Course } from '../../types/resume'
import { uid } from '../../utils/format'
import { moveItem, patchItem, removeItem } from '../../utils/list'
import { TextField } from '../ui/Field'
import { ItemCard } from '../ui/ItemCard'

interface Props {
  items: Course[]
  onChange: (items: Course[]) => void
}

const blank = (): Course => ({ id: uid(), name: '', institution: '', year: '', hours: '' })

export function CoursesForm({ items, onChange }: Props) {
  const patch = (id: string, p: Partial<Course>) => onChange(patchItem(items, id, p))
  return (
    <div className="stack">
      {items.map((c, i) => (
        <ItemCard
          key={c.id}
          title={c.name || 'Novo curso'}
          subtitle={[c.institution, c.year].filter(Boolean).join(' · ')}
          defaultOpen={!c.name}
          index={i}
          count={items.length}
          onMove={(d) => onChange(moveItem(items, c.id, d))}
          onRemove={() => onChange(removeItem(items, c.id))}
        >
          <div className="form-grid">
            <TextField className="full" label="Curso ou certificação" value={c.name} onChange={(v) => patch(c.id, { name: v })} />
            <TextField className="full" label="Instituição" value={c.institution} onChange={(v) => patch(c.id, { institution: v })} />
            <TextField label="Ano de conclusão" inputMode="numeric" maxLength={4} value={c.year} onChange={(v) => patch(c.id, { year: v.replace(/\D/g, '') })} placeholder="2024" />
            <TextField label="Carga horária (horas)" optional inputMode="numeric" value={c.hours} onChange={(v) => patch(c.id, { hours: v.replace(/\D/g, '') })} placeholder="40" />
          </div>
        </ItemCard>
      ))}
      <div className="row-gap">
        <button type="button" className="btn btn-add" onClick={() => onChange([blank(), ...items])}>
          <Plus size={16} /> Adicionar curso
        </button>
      </div>
    </div>
  )
}
