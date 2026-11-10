import { Languages, Loader2, RefreshCw } from 'lucide-react'
import type { Lang } from '../data/i18n'

interface Props {
  lang: Lang
  onLang: (l: Lang) => void
  /** null = still checking */
  canTranslate: boolean | null
  translating: boolean
  progress: string
  pending: number
  onTranslate: () => void
}

/** Switches the generated resume between Portuguese and English. */
export function LanguageToggle({ lang, onLang, canTranslate, translating, progress, pending, onTranslate }: Props) {
  return (
    <div className="lang-toggle">
      <div className="seg" role="radiogroup" aria-label="Idioma do currículo">
        <Languages size={15} className="seg-icon" />
        <button type="button" role="radio" aria-checked={lang === 'pt'} className={lang === 'pt' ? 'active' : ''} onClick={() => onLang('pt')}>
          Português
        </button>
        <button type="button" role="radio" aria-checked={lang === 'en'} className={lang === 'en' ? 'active' : ''} onClick={() => onLang('en')}>
          English
        </button>
      </div>

      {lang === 'en' && translating && (
        <span className="lang-note">
          <Loader2 size={13} className="spin" /> Traduzindo… {progress}
        </span>
      )}
      {lang === 'en' && !translating && canTranslate && pending > 0 && (
        <button type="button" className="btn btn-sm" onClick={onTranslate}>
          <RefreshCw size={13} /> Traduzir {pending} {pending === 1 ? 'texto' : 'textos'}
        </button>
      )}
      {lang === 'en' && !translating && canTranslate && pending === 0 && (
        <span className="lang-note">Traduzido. Revise o texto antes de enviar.</span>
      )}
      {lang === 'en' && canTranslate === false && (
        <span className="lang-note">
          Títulos e datas traduzidos. Seus textos seguem em português: a tradução automática exige Chrome 138+ ou
          Edge recente.
        </span>
      )}
    </div>
  )
}
