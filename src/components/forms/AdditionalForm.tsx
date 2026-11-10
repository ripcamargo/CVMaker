import { Plus } from 'lucide-react'
import type { AdditionalItem, AdditionalKind } from '../../types/resume'
import { KIND_LABEL } from '../../data/defaults'
import { uid } from '../../utils/format'
import { moveItem, patchItem, removeItem } from '../../utils/list'
import { SelectField, TextAreaField, TextField } from '../ui/Field'
import { ItemCard } from '../ui/ItemCard'

interface Props {
  items: AdditionalItem[]
  onChange: (items: AdditionalItem[]) => void
}

const KINDS = (Object.keys(KIND_LABEL) as AdditionalKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))
const blank = (): AdditionalItem => ({ id: uid(), kind: 'project', title: '', description: '' })

export function AdditionalForm({ items, onChange }: Props) {
  const patch = (id: string, p: Partial<AdditionalItem>) => onChange(patchItem(items, id, p))
  return (
    <div className="stack">
      <p className="muted">Projetos relevantes, trabalho voluntário, publicações ou outras informações que agreguem.</p>
      {items.map((a, i) => (
        <ItemCard
          key={a.id}
          title={a.title || 'Novo item'}
          subtitle={KIND_LABEL[a.kind]}
          defaultOpen={!a.title}
          index={i}
          count={items.length}
          onMove={(d) => onChange(moveItem(items, a.id, d))}
          onRemove={() => onChange(removeItem(items, a.id))}
        >
          <div className="form-grid">
            <SelectField label="Tipo" value={a.kind} onChange={(v) => patch(a.id, { kind: v })} options={KINDS} />
            <TextField label="Título" value={a.title} onChange={(v) => patch(a.id, { title: v })} />
            <TextAreaField className="full" label="Descrição" rows={4} value={a.description} onChange={(v) => patch(a.id, { description: v })} />
          </div>
        </ItemCard>
      ))}
      <div className="row-gap">
        <button type="button" className="btn btn-add" onClick={() => onChange([...items, blank()])}>
          <Plus size={16} /> Adicionar item
        </button>
      </div>
    </div>
  )
}
