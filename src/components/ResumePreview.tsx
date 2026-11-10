import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, Maximize2 } from 'lucide-react'
import { PageStack, type PageModel } from './ResumeEngine'
import { PAGE_H, PAGE_W } from '../utils/paginate'

/** On-screen, scaled A4 preview. Shows exactly the pages used for PDF/PNG/print. */
export function ResumePreview({ model }: { model: PageModel }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [zoom, setZoom] = useState(1) // multiplier over "fit width"

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const fit = width > 0 ? Math.min(1.1, (width - 32) / PAGE_W) : 0.5
  const scale = Math.max(0.2, fit * zoom)

  return (
    <div className="preview">
      <div className="preview-bar">
        <span className="muted small">
          {model.pages} {model.pages === 1 ? 'página' : 'páginas'} · A4
        </span>
        <div className="zoom">
          <button type="button" className="icon-btn" aria-label="Diminuir zoom" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}>
            <Minus size={15} />
          </button>
          <span className="zoom-val">{Math.round(scale * 100)}%</span>
          <button type="button" className="icon-btn" aria-label="Aumentar zoom" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}>
            <Plus size={15} />
          </button>
          <button type="button" className="icon-btn" aria-label="Ajustar à largura" title="Ajustar à largura" onClick={() => setZoom(1)}>
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
      <div className="preview-scroll" ref={boxRef}>
        <div className="preview-pages">
          <PageStack
            model={model}
            wrap={(page, i) => (
              <div key={i} className="pv-page-wrap">
                <div className="pv-page" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
                  <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}>{page}</div>
                </div>
                {model.pages > 1 && (
                  <div className="pv-label">
                    Página {i + 1} de {model.pages}
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
