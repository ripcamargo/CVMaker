import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  index: number
  count: number
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  children: ReactNode
}

/** Collapsible card for one record (experience, education...). */
export function ItemCard({ title, subtitle, defaultOpen = false, index, count, onMove, onRemove, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [confirming, setConfirming] = useState(false)
  return (
    <div className={`item-card ${open ? 'open' : ''}`}>
      <div className="item-head">
        <button type="button" className="item-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="item-text">
            <span className="item-title">{title}</span>
            {subtitle && <span className="item-sub">{subtitle}</span>}
          </span>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <div className="item-tools">
          <button
            type="button"
            className="icon-btn"
            title="Mover para cima"
            aria-label="Mover para cima"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Mover para baixo"
            aria-label="Mover para baixo"
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={16} />
          </button>
          {confirming ? (
            <button
              type="button"
              className="icon-btn danger confirm"
              onBlur={() => setConfirming(false)}
              onClick={onRemove}
              autoFocus
            >
              Excluir?
            </button>
          ) : (
            <button
              type="button"
              className="icon-btn danger"
              title="Excluir"
              aria-label="Excluir"
              onClick={() => setConfirming(true)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      {open && <div className="item-body">{children}</div>}
    </div>
  )
}
