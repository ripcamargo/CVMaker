import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { AccentId, ResumeData, TemplateId } from '../types/resume'
import { TEMPLATE_COMPONENTS } from '../templates'
import { localize } from '../utils/translate'
import { PAGE_MARGIN_Y, USABLE_H, paginate, type Paginated } from '../utils/paginate'

export interface PageModel extends Paginated {
  template: TemplateId
  accent: AccentId
}

interface StackProps {
  model: PageModel
  /** Optional wrapper for each page (the on-screen preview adds scaling + labels). */
  wrap?: (page: ReactNode, index: number) => ReactNode
}

/** Renders the paginated document as real A4 pages (794x1123px). */
export function PageStack({ model, wrap }: StackProps) {
  const pages = Array.from({ length: model.pages }, (_, i) => i)
  return (
    <div className={`tpl tpl-${model.template}`} data-accent={model.accent}>
      {pages.map((i) => {
        const page = (
          <div className="cv-page" data-page={i + 1}>
            <div className="cv-clip" style={{ top: PAGE_MARGIN_Y, height: USABLE_H }}>
              <div
                className="cv-flow"
                style={{ top: -i * USABLE_H }}
                dangerouslySetInnerHTML={{ __html: model.html }}
              />
            </div>
          </div>
        )
        return wrap ? wrap(page, i) : <div key={i}>{page}</div>
      })}
    </div>
  )
}

/**
 * Lays the resume out off-screen, paginates it, and exposes the result.
 * The returned `engine` node (a portal into <body>) must be rendered once:
 * it holds the measuring box and the un-scaled export root used for PDF / PNG / print.
 */
export function useResumeEngine(data: ResumeData) {
  const [shown, setShown] = useState(data)
  const [model, setModel] = useState<PageModel>({ html: '', pages: 1, template: data.settings.template, accent: data.settings.accent })
  const [fontTick, setFontTick] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  // Light debounce so typing stays snappy
  useEffect(() => {
    const t = setTimeout(() => setShown(data), 90)
    return () => clearTimeout(t)
  }, [data])

  // Re-measure when webfonts finish loading (text metrics change)
  useEffect(() => {
    const bump = () => setFontTick((n) => n + 1)
    void document.fonts?.ready.then(bump)
    document.fonts?.addEventListener?.('loadingdone', bump)
    return () => document.fonts?.removeEventListener?.('loadingdone', bump)
  }, [])

  const view = useMemo(() => localize(shown), [shown])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const result = paginate(root)
    setModel((prev) =>
      prev.html === result.html &&
      prev.pages === result.pages &&
      prev.template === shown.settings.template &&
      prev.accent === shown.settings.accent
        ? prev
        : { ...result, template: shown.settings.template, accent: shown.settings.accent },
    )
  }, [shown, view, fontTick])

  const Template = TEMPLATE_COMPONENTS[shown.settings.template]

  const engine = createPortal(
    <>
      <div className="cv-measure" aria-hidden="true">
        <div className={`tpl tpl-${shown.settings.template}`} data-accent={shown.settings.accent}>
          <div className="cv-root" ref={rootRef}>
            <Template data={view} />
          </div>
        </div>
      </div>
      <div id="cv-export-root" aria-hidden="true">
        <PageStack model={model} />
      </div>
    </>,
    document.body,
  )

  return { model, engine }
}
