import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import type { Personal } from '../../types/resume'
import { fileToResizedDataUrl } from '../../utils/format'
import { TextAreaField, TextField } from '../ui/Field'

interface Props {
  value: Personal
  onChange: (patch: Partial<Personal>) => void
}

export function PersonalInformationForm({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState('')

  const onFile = async (file?: File) => {
    if (!file) return
    setPhotoError('')
    if (!file.type.startsWith('image/')) return setPhotoError('Selecione um arquivo de imagem.')
    try {
      onChange({ photo: await fileToResizedDataUrl(file) })
    } catch {
      setPhotoError('Não foi possível carregar a imagem.')
    }
  }

  return (
    <div className="form-grid">
      <div className="photo-row full">
        <div className="photo-box">
          {value.photo ? <img src={value.photo} alt="Foto de perfil" /> : <ImagePlus size={24} />}
        </div>
        <div className="photo-actions">
          <strong>Foto de perfil</strong>
          <span className="muted">
            Opcional. Aparece apenas nos modelos Moderno e Europeu; o Elegante não usa foto.
          </span>
          <div className="row-gap">
            <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()}>
              {value.photo ? 'Trocar foto' : 'Enviar foto'}
            </button>
            {value.photo && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange({ photo: '' })}>
                <Trash2 size={14} /> Remover
              </button>
            )}
          </div>
          {photoError && <span className="error-text">{photoError}</span>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              void onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <TextField className="full" label="Nome completo" value={value.fullName} onChange={(v) => onChange({ fullName: v })} placeholder="Ex.: Maria da Silva" autoComplete="name" />
      <TextField className="full" label="Cargo ou título profissional" value={value.title} onChange={(v) => onChange({ title: v })} placeholder="Ex.: Analista de Marketing" />
      <TextField label="E-mail" type="email" value={value.email} onChange={(v) => onChange({ email: v })} placeholder="nome@email.com" autoComplete="email" />
      <TextField label="Telefone" type="tel" value={value.phone} onChange={(v) => onChange({ phone: v })} placeholder="(11) 90000-0000" autoComplete="tel" />
      <TextField className="full" label="Cidade e estado" value={value.location} onChange={(v) => onChange({ location: v })} placeholder="São Paulo, SP" />
      <TextField label="LinkedIn" optional value={value.linkedin} onChange={(v) => onChange({ linkedin: v })} placeholder="linkedin.com/in/seu-perfil" />
      <TextField label="Portfólio ou site" optional value={value.website} onChange={(v) => onChange({ website: v })} placeholder="seusite.com.br" />
      <TextAreaField
        className="full"
        label="Resumo profissional"
        rows={5}
        value={value.summary}
        onChange={(v) => onChange({ summary: v })}
        placeholder="Em 3 a 4 linhas, descreva sua experiência, suas principais competências e o que busca profissionalmente."
        hint="Seja objetivo e use apenas informações verdadeiras."
      />
    </div>
  )
}
