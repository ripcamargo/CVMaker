import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Pencil, RotateCcw, FileText, X } from 'lucide-react'
import type { ResumeData, SectionKey } from '../types/resume'
import { SECTIONS } from '../data/defaults'
import { useResume } from '../hooks/useResume'
import { overallProgress, sectionScore } from '../utils/progress'
import { Header, SaveStatus } from './Header'
import { ExportActions, type Notify } from './ExportActions'
import { BackupActions } from './BackupActions'
import { isBlank } from '../templates/shared'
import { useResumeEngine } from './ResumeEngine'
import { ResumePreview } from './ResumePreview'
import { LanguageToggle } from './LanguageToggle'
import { pendingLines, translateLines, translatorAvailable } from '../utils/translate'
import type { Lang } from '../data/i18n'
import { TemplateSelector } from './TemplateSelector'
import { Switch } from './ui/Field'
import { PersonalInformationForm } from './forms/PersonalInformationForm'
import { ExperienceForm } from './forms/ExperienceForm'
import { EducationForm } from './forms/EducationForm'
import { CoursesForm } from './forms/CoursesForm'
import { SkillsForm } from './forms/SkillsForm'
import { LanguagesForm } from './forms/LanguagesForm'
import { AdditionalForm } from './forms/AdditionalForm'

interface Toast {
  id: number
  message: string
  kind: 'success' | 'error' | 'info'
}

export function ResumeBuilder({ onHome }: { onHome: () => void }) {
  const { data, update, reset, replace, saveState } = useResume()
  const { model, engine } = useResumeEngine(data)
  const [step, setStep] = useState<SectionKey>('personal')
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingImport, setPendingImport] = useState<ResumeData | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const formRef = useRef<HTMLDivElement>(null)
  const [canTranslate, setCanTranslate] = useState<boolean | null>(null)
  const [translating, setTranslating] = useState(false)
  const [tProgress, setTProgress] = useState('')

  useEffect(() => {
    void translatorAvailable().then(setCanTranslate)
  }, [])

  const lang = data.settings.lang
  const pending = lang === 'en' ? pendingLines(data).length : 0

  const notify: Notify = useCallback((message, kind = 'info') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const runTranslate = async (source: ResumeData) => {
    const lines = pendingLines(source)
    if (!lines.length || translating) return
    setTranslating(true)
    try {
      const result = await translateLines(lines, (done, total) => setTProgress(`${done}/${total}`))
      update((d) => ({ ...d, translations: { ...d.translations, ...result } }))
      notify('Currículo traduzido para o inglês. Revise o texto.', 'success')
    } catch (e) {
      console.error(e)
      notify('Não foi possível traduzir automaticamente.', 'error')
    } finally {
      setTranslating(false)
      setTProgress('')
    }
  }

  const changeLang = (l: Lang) => {
    update((d) => ({ ...d, settings: { ...d.settings, lang: l } }))
    if (l !== 'en') return
    if (canTranslate) void runTranslate({ ...data, settings: { ...data.settings, lang: l } })
    else notify('Seções e datas em inglês. A tradução dos textos exige Chrome 138+.', 'info')
  }

  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    update((d) => ({ ...d, [key]: value }))

  const setVisible = (key: SectionKey, v: boolean) =>
    update((d) => ({ ...d, settings: { ...d.settings, visible: { ...d.settings.visible, [key]: v } } }))

  const go = (key: SectionKey) => {
    setStep(key)
    formRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }

  const idx = SECTIONS.findIndex((s) => s.key === step)
  const current = SECTIONS[idx]
  const progress = overallProgress(data)
  const visible = data.settings.visible[step]

  const applyImport = (next: ResumeData) => {
    replace(next)
    setPendingImport(null)
    setStep('personal')
    notify('Dados carregados com sucesso.', 'success')
  }

  const onImport = (next: ResumeData) => (isBlank(data) ? applyImport(next) : setPendingImport(next))

  const doReset = () => {
    reset()
    setConfirmReset(false)
    setStep('personal')
    notify('Currículo reiniciado. Você pode começar de novo.', 'info')
  }

  return (
    <div className={`builder tab-${mobileTab}`}>
      <Header onHome={onHome}>
        <SaveStatus state={saveState} />
        <button type="button" className="btn btn-ghost hide-sm" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={16} /> <span>Reiniciar</span>
        </button>
        <BackupActions data={data} hasContent={!isBlank(data)} onImport={onImport} notify={notify} />
        <ExportActions data={data} notify={notify} />
      </Header>

      <div className="builder-body">
        {/* ---------------- Editor ---------------- */}
        <section className="editor" aria-label="Editor do currículo">
          <div className="editor-top">
            <div className="progress-row">
              <span className="progress-label">Progresso</span>
              <div
                className="progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-val">{progress}%</span>
            </div>
            <nav className="steps" aria-label="Seções">
              {SECTIONS.map((s) => {
                const on = data.settings.visible[s.key]
                const done = on && sectionScore(data, s.key) >= (s.key === 'personal' ? 0.99 : 1)
                return (
                  <button
                    key={s.key}
                    type="button"
                    className={`step ${step === s.key ? 'active' : ''} ${!on ? 'off' : ''}`}
                    onClick={() => go(s.key)}
                    aria-current={step === s.key ? 'step' : undefined}
                  >
                    <span className="step-dot">{done ? <Check size={12} strokeWidth={3} /> : !on ? <EyeOff size={11} /> : null}</span>
                    {s.short}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="editor-scroll" ref={formRef}>
            <div className="card">
              <div className="card-head">
                <div>
                  <h2>{current.label}</h2>
                  <p className="muted small">
                    Etapa {idx + 1} de {SECTIONS.length}
                  </p>
                </div>
                {current.optional && (
                  <Switch
                    checked={visible}
                    onChange={(v) => setVisible(step, v)}
                    label={visible ? 'Incluída' : 'Oculta'}
                  />
                )}
              </div>

              <div className={!visible ? 'dimmed' : ''}>
                {step === 'personal' && (
                  <PersonalInformationForm
                    value={data.personal}
                    onChange={(patch) => update((d) => ({ ...d, personal: { ...d.personal, ...patch } }))}
                  />
                )}
                {step === 'experience' && <ExperienceForm items={data.experiences} onChange={(v) => set('experiences', v)} />}
                {step === 'education' && <EducationForm items={data.education} onChange={(v) => set('education', v)} />}
                {step === 'courses' && <CoursesForm items={data.courses} onChange={(v) => set('courses', v)} />}
                {step === 'skills' && <SkillsForm
                    items={data.skills}
                    onChange={(v) => set('skills', v)}
                    jobKeywords={data.jobKeywords}
                    onJobKeywords={(v) => set('jobKeywords', v)}
                  />}
                {step === 'languages' && <LanguagesForm items={data.languages} onChange={(v) => set('languages', v)} />}
                {step === 'additional' && <AdditionalForm items={data.additional} onChange={(v) => set('additional', v)} />}
              </div>
              {!visible && (
                <p className="hidden-note">
                  <EyeOff size={14} /> Esta seção não aparece no currículo final. Seus dados continuam salvos.
                </p>
              )}
            </div>

            <div className="pager">
              <button type="button" className="btn" disabled={idx === 0} onClick={() => go(SECTIONS[idx - 1].key)}>
                <ArrowLeft size={16} /> Anterior
              </button>
              {idx < SECTIONS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={() => go(SECTIONS[idx + 1].key)}>
                  Próxima <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="btn btn-primary show-sm-only" onClick={() => setMobileTab('preview')}>
                  Ver currículo <Eye size={16} />
                </button>
              )}
            </div>
            <button type="button" className="link-reset show-sm-only" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} /> Reiniciar currículo
            </button>
          </div>
        </section>

        {/* ---------------- Preview ---------------- */}
        <section className="preview-panel" aria-label="Pré-visualização">
          <LanguageToggle lang={lang} onLang={changeLang} canTranslate={canTranslate} translating={translating} progress={tProgress} pending={pending} onTranslate={() => void runTranslate(data)} />
          <TemplateSelector
            template={data.settings.template}
            accent={data.settings.accent}
            onTemplate={(t) => update((d) => ({ ...d, settings: { ...d.settings, template: t } }))}
            onAccent={(a) => update((d) => ({ ...d, settings: { ...d.settings, accent: a } }))}
          />
          <ResumePreview model={model} />
        </section>
      </div>

      {/* Mobile tab bar */}
      <div className="mobile-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mobileTab === 'edit'} className={mobileTab === 'edit' ? 'active' : ''} onClick={() => setMobileTab('edit')}>
          <Pencil size={16} /> Editar
        </button>
        <button type="button" role="tab" aria-selected={mobileTab === 'preview'} className={mobileTab === 'preview' ? 'active' : ''} onClick={() => setMobileTab('preview')}>
          <FileText size={16} /> Visualizar
        </button>
      </div>

      {confirmReset && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmReset(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="reset-title">Reiniciar currículo?</h3>
            <p>Todos os dados preenchidos serão apagados deste navegador. Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={doReset}>
                Apagar tudo e recomeçar
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingImport && (
        <div className="modal-backdrop" role="presentation" onClick={() => setPendingImport(null)}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="import-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="import-title">Substituir os dados atuais?</h3>
            <p>
              Você já tem informações preenchidas. Carregar este arquivo vai substituí-las
              {pendingImport.personal.fullName ? ` pelos dados de ${pendingImport.personal.fullName}` : ''}. Se quiser
              guardar o que existe hoje, baixe seus dados antes.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setPendingImport(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={() => applyImport(pendingImport)}>
                Substituir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.kind === 'success' ? <Check size={16} /> : t.kind === 'error' ? <X size={16} /> : null}
            {t.message}
          </div>
        ))}
      </div>

      {engine}
    </div>
  )
}
