import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileDown, Image as ImageIcon, Loader2, Printer } from 'lucide-react'
import { exportPdf, exportPng, fileSlug, printResume } from '../export/exporters'
import { buildPdfMetadata } from '../export/metadata'
import type { ResumeData } from '../types/resume'

export type Notify = (message: string, kind?: 'success' | 'error' | 'info') => void

interface Props {
  data: ResumeData
  notify: Notify
}

export function ExportActions({ data, notify }: Props) {
  const [busy, setBusy] = useState<null | 'pdf' | 'png'>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const run = async (kind: 'pdf' | 'png') => {
    setOpen(false)
    if (busy) return
    setBusy(kind)
    try {
      // let the latest layout settle before capturing
      await new Promise((r) => setTimeout(r, 150))
      if (kind === 'pdf') {
        const dropped = await exportPdf(fileSlug(data.personal.fullName), buildPdfMetadata(data))
        if (dropped.length) {
          notify(
            `PDF gerado, mas estes caracteres não puderam ser incluídos no texto: ${dropped.slice(0, 8).join(' ')}`,
            'info',
          )
        } else notify('PDF gerado com sucesso.', 'success')
      } else {
        await exportPng(fileSlug(data.personal.fullName))
        notify('Imagem PNG gerada com sucesso.', 'success')
      }
    } catch (e) {
      console.error(e)
      notify('Não foi possível exportar. Tente novamente.', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="export" ref={menuRef}>
      <button type="button" className="btn btn-primary" onClick={() => run('pdf')} disabled={!!busy}>
        {busy === 'pdf' ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />}
        <span>{busy === 'pdf' ? 'Gerando…' : 'Baixar PDF'}</span>
      </button>
      <button
        type="button"
        className="btn btn-primary btn-attached"
        aria-label="Mais opções de exportação"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        disabled={!!busy}
      >
        {busy === 'png' ? <Loader2 size={16} className="spin" /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              printResume()
              notify('Abrindo a janela de impressão…', 'info')
            }}
          >
            <Printer size={16} />
            <span>
              Imprimir
              <small>Também permite salvar PDF com texto selecionável</small>
            </span>
          </button>
          <button type="button" role="menuitem" onClick={() => run('png')}>
            <ImageIcon size={16} />
            <span>
              Baixar como imagem
              <small>PNG em alta resolução</small>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
