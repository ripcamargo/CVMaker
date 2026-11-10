import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { Experience, Position } from '../../types/resume'
import { uid } from '../../utils/format'
import { moveItem, patchItem, removeItem } from '../../utils/list'
import { CheckField, TextAreaField, TextField } from '../ui/Field'

interface Props {
  experience: Experience
  onChange: (patch: Partial<Experience>) => void
}

const blank = (): Position => ({
  id: uid(),
  role: '',
  start: '',
  end: '',
  current: false,
  description: '',
  achievements: '',
})

/** Earlier roles at the same company (promotions), shown under the company in the resume — like LinkedIn. */
export function PromotionsEditor({ experience, onChange }: Props) {
  const items = experience.previous ?? []
  const set = (list: Position[]) => onChange({ previous: list })
  const patch = (id: string, p: Partial<Position>) => set(patchItem(items, id, p))

  return (
    <div className="promo">
      <div className="promo-head">
        <strong>Outros cargos na mesma empresa</strong>
        <p className="muted small">
          Teve promoção ou mudou de cargo aqui? Os campos acima são o cargo mais recente; adicione abaixo os
          anteriores, do mais novo para o mais antigo.
        </p>
      </div>

      {items.map((p, i) => (
        <div key={p.id} className="promo-item">
          <div className="promo-item-head">
            <span>Cargo anterior {i + 1}</span>
            <div className="item-tools">
              <button type="button" className="icon-btn" aria-label="Mover para cima" disabled={i === 0} onClick={() => set(moveItem(items, p.id, -1))}>
                <ArrowUp size={15} />
              </button>
              <button type="button" className="icon-btn" aria-label="Mover para baixo" disabled={i === items.length - 1} onClick={() => set(moveItem(items, p.id, 1))}>
                <ArrowDown size={15} />
              </button>
              <button type="button" className="icon-btn danger" aria-label="Remover cargo" title="Remover" onClick={() => set(removeItem(items, p.id))}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <div className="form-grid">
            <TextField className="full" label="Cargo" value={p.role} onChange={(v) => patch(p.id, { role: v })} />
            <TextField label="Data de início" type="month" value={p.start} onChange={(v) => patch(p.id, { start: v })} />
            <TextField label="Data de término" type="month" value={p.current ? '' : p.end} disabled={p.current} onChange={(v) => patch(p.id, { end: v })} />
            <CheckField label="Ainda ocupo este cargo" checked={p.current} onChange={(v) => patch(p.id, { current: v })} />
            <TextAreaField className="full" label="Atividades e responsabilidades" rows={4} value={p.description} onChange={(v) => patch(p.id, { description: v })} placeholder={'- Responsável por...'} />
            <TextAreaField className="full" label="Principais resultados e conquistas" optional rows={3} value={p.achievements} onChange={(v) => patch(p.id, { achievements: v })} />
          </div>
        </div>
      ))}

      <div className="row-gap">
        <button type="button" className="btn btn-sm btn-add" onClick={() => set([...items, blank()])}>
          <Plus size={14} /> Adicionar cargo anterior
        </button>
      </div>
    </div>
  )
}
