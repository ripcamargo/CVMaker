import { useEffect, useRef, useState } from 'react'
import { Database, Download, Upload } from 'lucide-react'
import type { ResumeData } from '../types/resume'
import { downloadBackup, parseBackup } from '../utils/backup'
import type { Notify } from './ExportActions'

interface Props {
  data: ResumeData
  hasContent: boolean
  /** Called with validated data; the parent decides whether to confirm before replacing. */
  onImport: (data: ResumeData) => void
  notify: Notify
}

/** Save / load all typed data as a JSON file, so it can be restored later. */
export function BackupActions({ data, hasContent, onImport, notify }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const onFile = async (file?: File) => {
    if (!file) return
    try {
      onImport(parseBackup(await file.text()))
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Não foi possível ler o arquivo.', 'error')
    }
  }

  return (
    <div className="export" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Database size={16} /> <span className="hide-sm">Meus dados</span>
      </button>
      {open && (
        <div className="menu" role="menu">
          <button
            type="button"
            role="menuitem"
            disabled={!hasContent}
            onClick={() => {
              setOpen(false)
              const name = downloadBackup(data)
              notify(`Dados salvos em ${name}`, 'success')
            }}
          >
            <Download size={16} />
            <span>
              Baixar meus dados
              <small>Arquivo JSON para guardar e carregar depois</small>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              fileRef.current?.click()
            }}
          >
            <Upload size={16} />
            <span>
              Carregar dados
              <small>Restaurar a partir de um arquivo baixado</small>
            </span>
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
