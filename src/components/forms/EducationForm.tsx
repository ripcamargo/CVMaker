import { Plus } from 'lucide-react'
import type { Education, EducationStatus } from '../../types/resume'
import { STATUS_LABEL } from '../../data/defaults'
import { educationPeriod, uid } from '../../utils/format'
import { moveItem, patchItem, removeItem } from '../../utils/list'
import { SelectField, TextField } from '../ui/Field'
import { ItemCard } from '../ui/ItemCard'

interface Props {
  items: Education[]
  onChange: (items: Education[]) => void
}

const blank = (): Education => ({
  id: uid(),
  institution: '',
  course: '',
  degree: '',
  start: '',
  end: '',
  status: 'completed',
})

const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as EducationStatus[]).map((k) => ({ value: k, label: STATUS_LABEL[k] }))

export function EducationForm({ items, onChange }: Props) {
  const patch = (id: string, p: Partial<Education>) => onChange(patchItem(items, id, p))
  return (
    <div className="stack">
      {items.map((e, i) => (
        <ItemCard
          key={e.id}
          title={e.course || e.institution || 'Nova formação'}
          subtitle={[e.course ? e.institution : '', educationPeriod(e)].filter(Boolean).join(' · ')}
          defaultOpen={!e.course && !e.institution}
          index={i}
          count={items.length}
          onMove={(d) => onChange(moveItem(items, e.id, d))}
          onRemove={() => onChange(removeItem(items, e.id))}
        >
          <div className="form-grid">
            <TextField className="full" label="Instituição de ensino" value={e.institution} onChange={(v) => patch(e.id, { institution: v })} />
            <TextField label="Curso" value={e.course} onChange={(v) => patch(e.id, { course: v })} />
            <TextField label="Grau acadêmico" value={e.degree} onChange={(v) => patch(e.id, { degree: v })} placeholder="Bacharelado, Tecnólogo, MBA..." />
            <TextField label="Data de início" type="month" value={e.start} onChange={(v) => patch(e.id, { start: v })} />
            <TextField label="Conclusão ou previsão" type="month" value={e.end} onChange={(v) => patch(e.id, { end: v })} />
            <SelectField className="full" label="Status" value={e.status} onChange={(v) => patch(e.id, { status: v })} options={STATUS_OPTIONS} />
          </div>
        </ItemCard>
      ))}
      <div className="row-gap">
        <button type="button" className="btn btn-add" onClick={() => onChange([blank(), ...items])}>
          <Plus size={16} /> Adicionar formação
        </button>
      </div>
    </div>
  )
}
