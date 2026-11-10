import { Check, FileText, Loader2, AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SaveState } from '../hooks/useResume'

export function Logo({ onClick }: { onClick?: () => void }) {
  const inner = (
    <>
      <span className="logo-mark">
        <FileText size={18} strokeWidth={2.2} />
      </span>
      <span className="logo-text">
        CV<strong>Maker</strong>
      </span>
    </>
  )
  return onClick ? (
    <button type="button" className="logo" onClick={onClick} aria-label="CVMaker — voltar ao início">
      {inner}
    </button>
  ) : (
    <div className="logo">{inner}</div>
  )
}

export function SaveStatus({ state }: { state: SaveState }) {
  if (state === 'idle') return <span className="save-status muted">Salvamento automático</span>
  if (state === 'saving')
    return (
      <span className="save-status">
        <Loader2 size={14} className="spin" /> Salvando…
      </span>
    )
  if (state === 'error')
    return (
      <span className="save-status error">
        <AlertCircle size={14} /> Não foi possível salvar
      </span>
    )
  return (
    <span className="save-status ok">
      <Check size={14} /> Salvo neste navegador
    </span>
  )
}

export function Header({ onHome, children }: { onHome?: () => void; children?: ReactNode }) {
  return (
    <header className="app-header">
      <Logo onClick={onHome} />
      <div className="header-right">{children}</div>
    </header>
  )
}
